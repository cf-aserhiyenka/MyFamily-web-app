import "dotenv/config";
import bcrypt from "bcryptjs";
import { FamilyRole, MemberStatus } from "@prisma/client";
import { prisma } from "../index";

async function main() {
  await prisma.familyMember.deleteMany();
  await prisma.personNode.deleteMany();
  await prisma.family.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Test123!", 10);


  const jan = await prisma.user.create({
    data: {
      email: "john@test.com",
      passwordHash,
    },
  });

  const anna = await prisma.user.create({
    data: {
      email: "anna@test.com",
      passwordHash,
    },
  });

  const piotr = await prisma.user.create({
    data: {
      email: "peter@test.com",
      passwordHash,
    },
  });

  const kasia = await prisma.user.create({
    data: {
      email: "kate@test.com",
      passwordHash,
    },
  });

  const adam = await prisma.user.create({
    data: {
      email: "adam@test.com",
      passwordHash,
    },
  });


  const janPerson = await prisma.personNode.create({
    data: {
      firstName: "John",
      lastName: "Smith",
    },
  });

  const annaPerson = await prisma.personNode.create({
    data: {
      firstName: "Anna",
      lastName: "Smith",
    },
  });

  const piotrPerson = await prisma.personNode.create({
    data: {
      firstName: "Peter",
      lastName: "Brown",
    },
  });

  const kasiaPerson = await prisma.personNode.create({
    data: {
      firstName: "Kate",
      lastName: "Brown",
    },
  });

  const adamPerson = await prisma.personNode.create({
    data: {
      firstName: "Adam",
      lastName: "White",
    },
  });


  const family1 = await prisma.family.create({
    data: {
      name: "Smith Family",
      description: "Main family of John and Anna",
      createdById: jan.id,
    },
  });

  const family2 = await prisma.family.create({
    data: {
      name: "Brown Family",
      description: "Family of Peter and Kate",
      createdById: anna.id,
    },
  });

  const family3 = await prisma.family.create({
    data: {
      name: "White Family",
      description: "Adam's family",
      createdById: piotr.id,
    },
  });

  const family4 = await prisma.family.create({
    data: {
      name: "Green Family",
      description: "Guardians family",
      createdById: kasia.id,
    },
  });

  const family5 = await prisma.family.create({
    data: {
      name: "Wilson Family",
      description: "Example multi-generation family",
      createdById: adam.id,
    },
  });


  await prisma.familyMember.createMany({
    data: [
      {
        userId: jan.id,
        familyId: family1.id,
        personNodeId: janPerson.id,
        role: FamilyRole.PARENT,
        status: MemberStatus.ACTIVE,
      },
      {
        userId: anna.id,
        familyId: family1.id,
        personNodeId: annaPerson.id,
        role: FamilyRole.PARENT,
        status: MemberStatus.ACTIVE,
      },

      {
        userId: piotr.id,
        familyId: family2.id,
        personNodeId: piotrPerson.id,
        role: FamilyRole.PARENT,
        status: MemberStatus.ACTIVE,
      },
      {
        userId: kasia.id,
        familyId: family2.id,
        personNodeId: kasiaPerson.id,
        role: FamilyRole.CHILD,
        status: MemberStatus.ACTIVE,
      },

      {
        userId: adam.id,
        familyId: family3.id,
        personNodeId: adamPerson.id,
        role: FamilyRole.PARENT,
        status: MemberStatus.ACTIVE,
      },

      {
        userId: jan.id,
        familyId: family3.id,
        personNodeId: janPerson.id,
        role: FamilyRole.CHILD,
        status: MemberStatus.ACTIVE,
      },

      {
        userId: anna.id,
        familyId: family4.id,
        personNodeId: annaPerson.id,
        role: FamilyRole.GUARDIAN,
        status: MemberStatus.ACTIVE,
      },

      {
        userId: piotr.id,
        familyId: family5.id,
        personNodeId: piotrPerson.id,
        role: FamilyRole.CHILD,
        status: MemberStatus.ACTIVE,
      },

      {
        userId: adam.id,
        familyId: family5.id,
        personNodeId: adamPerson.id,
        role: FamilyRole.SENIOR,
        status: MemberStatus.ACTIVE,
      },
    ],
  });

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
