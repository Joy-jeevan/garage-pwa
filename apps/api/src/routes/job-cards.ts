import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  createJobCardSchema,
  updateJobCardSchema,
  updateJobCardStatusSchema,
  createJobCardItemSchema,
} from "@garage/shared";
import { requireAuth, requireRole, type AuthUser } from "../middleware/auth";
import { getPrisma } from "../lib/db";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

export const jobCardsRoute = new Hono<{ Bindings: Bindings }>();

jobCardsRoute.use("*", requireAuth);

/** Generate a human-friendly job number: JOB-2026-0001 */
async function nextJobNumber(prisma: any): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `JOB-${year}-`;
  const latest = await prisma.jobCard.findFirst({
    where: { jobNumber: { startsWith: prefix } },
    orderBy: { jobNumber: "desc" },
    select: { jobNumber: true },
  });
  let seq = 1;
  if (latest?.jobNumber) {
    const part = latest.jobNumber.split("-").pop();
    const n = parseInt(part || "0", 10);
    if (!isNaN(n)) seq = n + 1;
  }
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

// GET /job-cards
jobCardsRoute.get("/", async (c) => {
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);
  const status = c.req.query("status")?.trim();
  const mine = c.req.query("mine") === "1";
  const q = c.req.query("q")?.trim() || "";
  const user = c.get("user") as AuthUser;

  const where: any = { deletedAt: null };

  if (status) where.status = status;
  if (mine) where.assignedMechanicId = user.id;

  if (q) {
    where.OR = [
      { jobNumber: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { customer: { fullName: { contains: q, mode: "insensitive" } } },
      { customer: { mobile: { contains: q, mode: "insensitive" } } },
      { vehicle: { plateNumber: { contains: q, mode: "insensitive" } } },
    ];
  }

  const jobs = await prisma.jobCard.findMany({
    where,
    orderBy: [{ dateIn: "desc" }],
    include: {
      customer: { select: { id: true, fullName: true, mobile: true } },
      vehicle: {
        select: {
          id: true,
          make: true,
          model: true,
          plateNumber: true,
        },
      },
      assignedMechanic: {
        select: { id: true, fullName: true },
      },
      _count: { select: { items: true, images: true } },
    },
    take: 50,
  });

  return c.json(jobs);
});

// GET /job-cards/:id
jobCardsRoute.get("/:id", async (c) => {
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);
  const id = c.req.param("id");

  const job = await prisma.jobCard.findFirst({
    where: { id, deletedAt: null },
    include: {
      customer: true,
      vehicle: true,
      assignedMechanic: {
        select: { id: true, fullName: true, email: true },
      },
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          part: { select: { id: true, name: true, sku: true } },
        },
      },
      images: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!job) return c.json({ error: "Job card not found" }, 404);
  return c.json(job);
});

// POST /job-cards
jobCardsRoute.post(
  "/",
  zValidator("json", createJobCardSchema),
  async (c) => {
    const body = c.req.valid("json");
    const user = c.get("user") as AuthUser;
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    const customer = await prisma.customer.findFirst({
      where: { id: body.customerId, deletedAt: null },
    });
    if (!customer) return c.json({ error: "Customer not found" }, 404);

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: body.vehicleId,
        customerId: body.customerId,
        deletedAt: null,
      },
    });
    if (!vehicle) {
      return c.json(
        { error: "Vehicle not found or does not belong to this customer" },
        404
      );
    }

    const jobNumber = await nextJobNumber(prisma);

    const job = await prisma.jobCard.create({
      data: {
        jobNumber,
        customerId: body.customerId,
        vehicleId: body.vehicleId,
        description: body.description?.trim() || null,
        priority: body.priority || "normal",
        estimatedCompletion: body.estimatedCompletion
          ? new Date(body.estimatedCompletion)
          : null,
        mileageIn: body.mileageIn ?? vehicle.currentMileage ?? null,
        assignedMechanicId: body.assignedMechanicId || null,
        notes: body.notes?.trim() || null,
        status: "open",
        createdBy: user.id,
      },
      include: {
        customer: { select: { id: true, fullName: true, mobile: true } },
        vehicle: {
          select: { id: true, make: true, model: true, plateNumber: true },
        },
      },
    });

    return c.json(job, 201);
  }
);

// PATCH /job-cards/:id
jobCardsRoute.patch(
  "/:id",
  zValidator("json", updateJobCardSchema),
  async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    const existing = await prisma.jobCard.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) return c.json({ error: "Job card not found" }, 404);

    const data: any = {};
    if (body.description !== undefined)
      data.description = body.description?.trim() || null;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.estimatedCompletion !== undefined) {
      data.estimatedCompletion = body.estimatedCompletion
        ? new Date(body.estimatedCompletion)
        : null;
    }
    if (body.mileageIn !== undefined) data.mileageIn = body.mileageIn;
    if (body.mileageOut !== undefined) data.mileageOut = body.mileageOut;
    if (body.assignedMechanicId !== undefined)
      data.assignedMechanicId = body.assignedMechanicId || null;
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === "completed" && !existing.completedAt) {
        data.completedAt = new Date();
      }
    }

    const job = await prisma.jobCard.update({
      where: { id },
      data,
      include: {
        customer: { select: { id: true, fullName: true, mobile: true } },
        vehicle: {
          select: { id: true, make: true, model: true, plateNumber: true },
        },
        items: true,
      },
    });

    // Update vehicle mileage if mileageOut provided
    if (body.mileageOut != null) {
      await prisma.vehicle.update({
        where: { id: existing.vehicleId },
        data: { currentMileage: body.mileageOut },
      });
    }

    return c.json(job);
  }
);

// PATCH /job-cards/:id/status
jobCardsRoute.patch(
  "/:id/status",
  zValidator("json", updateJobCardStatusSchema),
  async (c) => {
    const id = c.req.param("id");
    const { status } = c.req.valid("json");
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    const existing = await prisma.jobCard.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) return c.json({ error: "Job card not found" }, 404);

    const data: any = { status };
    if (status === "completed" && !existing.completedAt) {
      data.completedAt = new Date();
    }

    const job = await prisma.jobCard.update({
      where: { id },
      data,
    });

    return c.json(job);
  }
);

// POST /job-cards/:id/items
jobCardsRoute.post(
  "/:id/items",
  zValidator("json", createJobCardItemSchema),
  async (c) => {
    const jobCardId = c.req.param("id");
    const body = c.req.valid("json");
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    const job = await prisma.jobCard.findFirst({
      where: { id: jobCardId, deletedAt: null },
    });
    if (!job) return c.json({ error: "Job card not found" }, 404);

    const maxOrder = await prisma.jobCardItem.aggregate({
      where: { jobCardId },
      _max: { sortOrder: true },
    });

    const item = await prisma.jobCardItem.create({
      data: {
        jobCardId,
        type: body.type,
        description: body.description.trim(),
        quantity: body.quantity ?? 1,
        unitPrice: body.unitPrice,
        partId: body.partId || null,
        hours: body.hours ?? null,
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    return c.json(item, 201);
  }
);

// DELETE /job-cards/:id/items/:itemId
jobCardsRoute.delete("/:id/items/:itemId", async (c) => {
  const jobCardId = c.req.param("id");
  const itemId = c.req.param("itemId");
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

  const item = await prisma.jobCardItem.findFirst({
    where: { id: itemId, jobCardId },
  });
  if (!item) return c.json({ error: "Item not found" }, 404);

  await prisma.jobCardItem.delete({ where: { id: itemId } });
  return c.json({ success: true });
});

// DELETE /job-cards/:id (soft)
jobCardsRoute.delete(
  "/:id",
  requireRole("admin", "manager"),
  async (c) => {
    const id = c.req.param("id");
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    const existing = await prisma.jobCard.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) return c.json({ error: "Job card not found" }, 404);

    await prisma.jobCard.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return c.json({ success: true });
  }
);
