import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "@garage/shared";
import { requireAuth, requireRole, type AuthUser } from "../middleware/auth";
import { getPrisma } from "../lib/db";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

export const customersRoute = new Hono<{ Bindings: Bindings }>();

// All customer routes require auth
customersRoute.use("*", requireAuth);

// GET /customers – list + search
customersRoute.get("/", async (c) => {
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);
  const q = c.req.query("q")?.trim() || "";
  const mobile = c.req.query("mobile")?.trim() || "";

  const where: any = { deletedAt: null };

  if (mobile) {
    // Exact or partial mobile search (priority feature)
    where.mobile = { contains: mobile, mode: "insensitive" };
  } else if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { mobile: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      vehicles: {
        where: { deletedAt: null },
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          plateNumber: true,
        },
      },
      _count: {
        select: { jobCards: true },
      },
    },
    take: 50,
  });

  return c.json(customers);
});

// GET /customers/:id
customersRoute.get("/:id", async (c) => {
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);
  const id = c.req.param("id");

  const customer = await prisma.customer.findFirst({
    where: { id, deletedAt: null },
    include: {
      vehicles: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      },
      jobCards: {
        where: { deletedAt: null },
        orderBy: { dateIn: "desc" },
        take: 20,
        include: {
          vehicle: {
            select: { make: true, model: true, plateNumber: true },
          },
        },
      },
    },
  });

  if (!customer) {
    return c.json({ error: "Customer not found" }, 404);
  }

  return c.json(customer);
});

// POST /customers
customersRoute.post(
  "/",
  requireRole("admin", "manager"),
  zValidator("json", createCustomerSchema),
  async (c) => {
    const body = c.req.valid("json");
    const user = c.get("user") as AuthUser;
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    // Unique mobile check
    const existing = await prisma.customer.findFirst({
      where: {
        mobile: body.mobile.trim(),
        deletedAt: null,
      },
    });

    if (existing) {
      return c.json(
        { error: "A customer with this mobile number already exists" },
        409
      );
    }

    const customer = await prisma.customer.create({
      data: {
        fullName: body.fullName.trim(),
        mobile: body.mobile.trim(),
        email: body.email?.trim() || null,
        address: body.address?.trim() || null,
        notes: body.notes?.trim() || null,
        createdBy: user.id,
      },
    });

    return c.json(customer, 201);
  }
);

// PATCH /customers/:id
customersRoute.patch(
  "/:id",
  requireRole("admin", "manager"),
  zValidator("json", updateCustomerSchema),
  async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    const existing = await prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return c.json({ error: "Customer not found" }, 404);
    }

    // If mobile is being changed, check uniqueness
    if (body.mobile && body.mobile.trim() !== existing.mobile) {
      const duplicate = await prisma.customer.findFirst({
        where: {
          mobile: body.mobile.trim(),
          deletedAt: null,
          NOT: { id },
        },
      });
      if (duplicate) {
        return c.json(
          { error: "A customer with this mobile number already exists" },
          409
        );
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(body.fullName !== undefined && { fullName: body.fullName.trim() }),
        ...(body.mobile !== undefined && { mobile: body.mobile.trim() }),
        ...(body.email !== undefined && {
          email: body.email?.trim() || null,
        }),
        ...(body.address !== undefined && {
          address: body.address?.trim() || null,
        }),
        ...(body.notes !== undefined && { notes: body.notes?.trim() || null }),
      },
    });

    return c.json(customer);
  }
);

// DELETE /customers/:id (soft delete)
customersRoute.delete(
  "/:id",
  requireRole("admin", "manager"),
  async (c) => {
    const id = c.req.param("id");
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    const existing = await prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return c.json({ error: "Customer not found" }, 404);
    }

    await prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return c.json({ success: true });
  }
);
