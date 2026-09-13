import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "@garage/shared";
import { requireAuth, requireRole, type AuthUser } from "../middleware/auth";
import { getPrisma } from "../lib/db";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

export const vehiclesRoute = new Hono<{ Bindings: Bindings }>();

vehiclesRoute.use("*", requireAuth);

// GET /vehicles – list + search by plate or customer
vehiclesRoute.get("/", async (c) => {
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);
  const q = c.req.query("q")?.trim() || "";
  const plate = c.req.query("plate")?.trim() || "";
  const customerId = c.req.query("customerId")?.trim() || "";

  const where: any = { deletedAt: null };

  if (customerId) {
    where.customerId = customerId;
  }

  if (plate) {
    where.plateNumber = { contains: plate, mode: "insensitive" };
  } else if (q) {
    where.OR = [
      { plateNumber: { contains: q, mode: "insensitive" } },
      { make: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
      { vin: { contains: q, mode: "insensitive" } },
      {
        customer: {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { mobile: { contains: q, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          mobile: true,
        },
      },
      _count: {
        select: { jobCards: true },
      },
    },
    take: 50,
  });

  return c.json(vehicles);
});

// GET /vehicles/:id
vehiclesRoute.get("/:id", async (c) => {
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);
  const id = c.req.param("id");

  const vehicle = await prisma.vehicle.findFirst({
    where: { id, deletedAt: null },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          mobile: true,
          email: true,
        },
      },
      jobCards: {
        where: { deletedAt: null },
        orderBy: { dateIn: "desc" },
        take: 20,
        select: {
          id: true,
          jobNumber: true,
          status: true,
          dateIn: true,
          description: true,
          priority: true,
        },
      },
    },
  });

  if (!vehicle) {
    return c.json({ error: "Vehicle not found" }, 404);
  }

  return c.json(vehicle);
});

// POST /vehicles
vehiclesRoute.post(
  "/",
  requireRole("admin", "manager"),
  zValidator("json", createVehicleSchema),
  async (c) => {
    const body = c.req.valid("json");
    const user = c.get("user") as AuthUser;
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    // Ensure customer exists
    const customer = await prisma.customer.findFirst({
      where: { id: body.customerId, deletedAt: null },
    });
    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        customerId: body.customerId,
        make: body.make.trim(),
        model: body.model.trim(),
        year: body.year ?? null,
        plateNumber: body.plateNumber.trim().toUpperCase(),
        vin: body.vin?.trim() || null,
        color: body.color?.trim() || null,
        currentMileage: body.currentMileage ?? null,
        notes: body.notes?.trim() || null,
        createdBy: user.id,
      },
      include: {
        customer: {
          select: { id: true, fullName: true, mobile: true },
        },
      },
    });

    return c.json(vehicle, 201);
  }
);

// PATCH /vehicles/:id
vehiclesRoute.patch(
  "/:id",
  requireRole("admin", "manager"),
  zValidator("json", updateVehicleSchema),
  async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    const existing = await prisma.vehicle.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return c.json({ error: "Vehicle not found" }, 404);
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(body.make !== undefined && { make: body.make.trim() }),
        ...(body.model !== undefined && { model: body.model.trim() }),
        ...(body.year !== undefined && { year: body.year }),
        ...(body.plateNumber !== undefined && {
          plateNumber: body.plateNumber.trim().toUpperCase(),
        }),
        ...(body.vin !== undefined && { vin: body.vin?.trim() || null }),
        ...(body.color !== undefined && { color: body.color?.trim() || null }),
        ...(body.currentMileage !== undefined && {
          currentMileage: body.currentMileage,
        }),
        ...(body.notes !== undefined && { notes: body.notes?.trim() || null }),
      },
      include: {
        customer: {
          select: { id: true, fullName: true, mobile: true },
        },
      },
    });

    return c.json(vehicle);
  }
);

// DELETE /vehicles/:id (soft delete)
vehiclesRoute.delete(
  "/:id",
  requireRole("admin", "manager"),
  async (c) => {
    const id = c.req.param("id");
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    const existing = await prisma.vehicle.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return c.json({ error: "Vehicle not found" }, 404);
    }

    await prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return c.json({ success: true });
  }
);
