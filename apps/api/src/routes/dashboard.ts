import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import { getPrisma } from "../lib/db";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

export const dashboardRoute = new Hono<{ Bindings: Bindings }>();

dashboardRoute.use("*", requireAuth);

dashboardRoute.get("/", async (c) => {
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    openJobs,
    inProgressJobs,
    waitingPartsJobs,
    completedToday,
    customersCount,
    vehiclesCount,
    recentJobs,
    unpaidInvoices,
  ] = await Promise.all([
    prisma.jobCard.count({
      where: { deletedAt: null, status: "open" },
    }),
    prisma.jobCard.count({
      where: { deletedAt: null, status: "in_progress" },
    }),
    prisma.jobCard.count({
      where: { deletedAt: null, status: "waiting_parts" },
    }),
    prisma.jobCard.count({
      where: {
        deletedAt: null,
        status: "completed",
        completedAt: { gte: startOfDay },
      },
    }),
    prisma.customer.count({ where: { deletedAt: null } }),
    prisma.vehicle.count({ where: { deletedAt: null } }),
    prisma.jobCard.findMany({
      where: { deletedAt: null },
      orderBy: { dateIn: "desc" },
      take: 8,
      include: {
        customer: { select: { fullName: true, mobile: true } },
        vehicle: {
          select: { make: true, model: true, plateNumber: true },
        },
      },
    }),
    prisma.invoice.findMany({
      where: { status: { in: ["draft", "sent"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        customer: { select: { fullName: true } },
      },
    }),
  ]);

  return c.json({
    stats: {
      openJobs,
      inProgressJobs,
      waitingPartsJobs,
      completedToday,
      customersCount,
      vehiclesCount,
    },
    recentJobs,
    unpaidInvoices,
  });
});
