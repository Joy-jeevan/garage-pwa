/**
 * Simple JWT authentication middleware
 */

import { createMiddleware } from "hono/factory";
import { verifyToken, type JwtPayload } from "../lib/auth";

export type AuthUser = JwtPayload & { id: string };

export const requireAuth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  const user: AuthUser = {
    id: payload.sub,
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    fullName: payload.fullName,
  };

  c.set("user", user);
  await next();
});

export const requireRole = (...roles: AuthUser["role"][]) => {
  return createMiddleware(async (c, next) => {
    const user = c.get("user") as AuthUser | undefined;

    if (!user || !roles.includes(user.role)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await next();
  });
};
