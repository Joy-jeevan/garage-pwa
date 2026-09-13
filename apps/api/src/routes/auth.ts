import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { registerSchema, loginSchema } from "@garage/shared";
import { hashPassword, verifyPassword, signToken } from "../lib/auth";
import { requireAuth, type AuthUser } from "../middleware/auth";
import { getPrisma } from "../lib/db";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

export const authRoute = new Hono<{
  Bindings: Bindings;
  Variables: {
    user: AuthUser;
  };
}>();

// POST /auth/register
authRoute.post(
  "/register",
  zValidator("json", registerSchema),
  async (c) => {
    const body = c.req.valid("json");
    const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

    const existing = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existing) {
      return c.json({ error: "Email already registered" }, 409);
    }

    // First user becomes admin automatically
    const userCount = await prisma.user.count();
    const role =
      userCount === 0
        ? "admin"
        : (body.role as "admin" | "manager" | "mechanic") || "mechanic";

    const passwordHash = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        fullName: body.fullName,
        phone: body.phone || null,
        role,
        isActive: true,
      },
    });

    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    return c.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
      201
    );
  }
);

// POST /auth/login
authRoute.post("/login", zValidator("json", loginSchema), async (c) => {
  const body = c.req.valid("json");
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
  });
  console.log("Logging in user:", user);
  if (!user || !user.isActive || user.deletedAt) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const valid = await verifyPassword(body.password, user.passwordHash);
  if (!valid) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  });
  
  console.log("Logging in token:", token);
  
  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
});

// GET /auth/me
authRoute.get("/me", requireAuth, async (c) => {
  const authUser = c.get("user");
  const prisma = await getPrisma(c.env.DATABASE_URL || process.env.DATABASE_URL);

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      phone: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(user);
});
