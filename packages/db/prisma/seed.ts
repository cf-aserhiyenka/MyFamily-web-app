import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../index";

async function main() {
  const passwordHash = await bcrypt.hash("Test1234!", 10);
  const user = await prisma.user.upsert({
    where: { email: "test@myfamily.local" },
    update: {},
    create: {
      email: "test@myfamily.local",
      passwordHash,
      firstName: "Jan",
      lastName: "Testowy",
      birthDate: new Date("1990-01-01"),
    },
  });

  console.log("Seed OK, testowy user:", user.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
