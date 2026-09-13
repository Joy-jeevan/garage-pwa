/**
 * Seed script – creates the first admin user.
 * Run: pnpm --filter @garage/database seed
 *
 * Requires DATABASE_URL in environment.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@garage.local";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin12345";
  const fullName = process.env.SEED_ADMIN_NAME || "Garage Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: "admin",
      isActive: true,
    },
  });

  console.log("✅ Admin user created:");
  console.log(`   Email:    ${user.email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role:     ${user.role}`);
  console.log("\nChange the password after first login in production.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
