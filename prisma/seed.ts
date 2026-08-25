import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  const user = await (prisma as any).user.upsert({
    where: {
      email: "admin@vpos.com",
    },

    update: {
      password,
      name: "Admin",
      role: "ADMIN",
    },

    create: {
      name: "Admin",
      email: "admin@vpos.com",
      password,
      role: "ADMIN",
    },
  });

  console.log("User created:");
  console.log({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });