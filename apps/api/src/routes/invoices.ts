import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createInvoiceSchema,
  recordPaymentSchema,
  updateInvoiceStatusSchema,
} from "@garage/shared";
import { requireAuth, requireRole, type AuthUser } from "../middleware/auth";
import { getPrisma } from "../lib/db";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

export const invoicesRoute = new Hono<{ Bindings: Bindings }>();

invoicesRoute.use("*", requireAuth);

async function nextInvoiceNumber(prisma: any): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const latest = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });
  let seq = 1;
  if (latest?.invoiceNumber) {
    const n = parseInt(latest.invoiceNumber.split("-").pop() || "0", 10);
    if (!isNaN(n)) seq = n + 1;
  }
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

// GET /invoices
invoicesRoute.get("/", async (c) => {
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);
  const status = c.req.query("status")?.trim();

  const where: any = {};
  if (status) where.status = status;

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { id: true, fullName: true, mobile: true } },
      jobCard: {
        select: {
          id: true,
          jobNumber: true,
          vehicle: {
            select: { make: true, model: true, plateNumber: true },
          },
        },
      },
      payments: true,
    },
    take: 50,
  });

  return c.json(invoices);
});

// GET /invoices/:id
invoicesRoute.get("/:id", async (c) => {
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);
  const id = c.req.param("id");

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      jobCard: {
        include: {
          vehicle: true,
          items: { orderBy: { sortOrder: "asc" } },
        },
      },
      payments: { orderBy: { paidAt: "desc" } },
      creator: { select: { fullName: true } },
    },
  });

  if (!invoice) return c.json({ error: "Invoice not found" }, 404);
  return c.json(invoice);
});

// POST /invoices – create from completed job card
invoicesRoute.post(
  "/",
  requireRole("admin", "manager"),
  zValidator("json", createInvoiceSchema),
  async (c) => {
    const body = c.req.valid("json");
    const user = c.get("user") as AuthUser;
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    const job = await prisma.jobCard.findFirst({
      where: { id: body.jobCardId, deletedAt: null },
      include: { items: true, invoice: true },
    });

    if (!job) return c.json({ error: "Job card not found" }, 404);
    if (job.invoice) {
      return c.json({ error: "This job already has an invoice" }, 409);
    }
    if (!["completed", "invoiced"].includes(job.status)) {
      return c.json(
        { error: "Job must be completed before invoicing" },
        400
      );
    }

    const subtotal = job.items.reduce((sum: number, item: any) => {
      return sum + Number(item.quantity) * Number(item.unitPrice);
    }, 0);
    const taxAmount = body.taxAmount ?? 0;
    const total = subtotal + taxAmount;

    const invoiceNumber = await nextInvoiceNumber(prisma);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        jobCardId: job.id,
        customerId: job.customerId,
        status: "draft",
        subtotal,
        taxAmount,
        total,
        notes: body.notes?.trim() || null,
        issuedAt: new Date(),
        createdBy: user.id,
      },
      include: {
        customer: { select: { id: true, fullName: true, mobile: true } },
        jobCard: { select: { id: true, jobNumber: true } },
      },
    });

    // Mark job as invoiced
    await prisma.jobCard.update({
      where: { id: job.id },
      data: { status: "invoiced" },
    });

    return c.json(invoice, 201);
  }
);

// PATCH /invoices/:id/status
invoicesRoute.patch(
  "/:id/status",
  requireRole("admin", "manager"),
  zValidator("json", updateInvoiceStatusSchema),
  async (c) => {
    const id = c.req.param("id");
    const { status } = c.req.valid("json");
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) return c.json({ error: "Invoice not found" }, 404);

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status },
    });

    return c.json(invoice);
  }
);

// POST /invoices/:id/payments
invoicesRoute.post(
  "/:id/payments",
  requireRole("admin", "manager"),
  zValidator("json", recordPaymentSchema),
  async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const user = c.get("user") as AuthUser;
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });
    if (!invoice) return c.json({ error: "Invoice not found" }, 404);

    const payment = await prisma.payment.create({
      data: {
        invoiceId: id,
        amount: body.amount,
        method: body.method,
        reference: body.reference?.trim() || null,
        notes: body.notes?.trim() || null,
        createdBy: user.id,
      },
    });

    const paidTotal = invoice.payments.reduce(
      (s: number, p: any) => s + Number(p.amount),
      0
    ) + Number(body.amount);

    if (paidTotal >= Number(invoice.total)) {
      await prisma.invoice.update({
        where: { id },
        data: { status: "paid" },
      });
    } else if (invoice.status === "draft") {
      await prisma.invoice.update({
        where: { id },
        data: { status: "sent" },
      });
    }

    return c.json(payment, 201);
  }
);
