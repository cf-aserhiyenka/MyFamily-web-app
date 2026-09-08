import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import {
  FamilyRole,
  MemberStatus,
  RelationType,
  ConversationType,
  BudgetCategory,
  BudgetPeriod,
  AlbumType,
} from "@prisma/client";
import { prisma } from "../index";

async function main() {
  await prisma.goalContribution.deleteMany();
  await prisma.savingGoal.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.mediaFile.deleteMany();
  await prisma.album.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.familyInvitation.deleteMany();
  await prisma.personRelation.deleteMany();
  await prisma.familyTreeMembership.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.personNode.deleteMany();
  await prisma.family.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Test123!", 10);

  const sophie = await prisma.user.create({ data: { email: "sophie@test.com", passwordHash, emailVerified: new Date() } });
  const mark = await prisma.user.create({ data: { email: "mark@test.com", passwordHash, emailVerified: new Date() } });
  const eve = await prisma.user.create({ data: { email: "eve@test.com", passwordHash, emailVerified: new Date() } });
  const jack = await prisma.user.create({ data: { email: "jack@test.com", passwordHash, emailVerified: new Date() } });
  const zoe = await prisma.user.create({ data: { email: "zoe@test.com", passwordHash, emailVerified: new Date() } });
  const kate = await prisma.user.create({ data: { email: "kate@test.com", passwordHash, emailVerified: new Date() } });
  const peter = await prisma.user.create({ data: { email: "peter@test.com", passwordHash, emailVerified: new Date() } });
  const alice = await prisma.user.create({ data: { email: "alice@test.com", passwordHash, emailVerified: new Date() } });

  const theodorePerson = await prisma.personNode.create({
    data: {
      firstName: "Theodore",
      lastName: "Newman",
      birthDate: new Date("1945-03-12"),
      birthPlace: "Boston",
      deathDate: new Date("2020-11-02"),
      deathPlace: "Boston",
      occupation: "Railway worker",
      bio: "Mark's father, passed away in 2020.",
      createdById: mark.id,
    },
  });

  const sophiePerson = await prisma.personNode.create({
    data: {
      firstName: "Sophie",
      lastName: "Newman",
      birthDate: new Date("1948-06-20"),
      birthPlace: "Boston",
      occupation: "Teacher (retired)",
      userId: sophie.id,
      createdById: sophie.id,
    },
  });

  const markPerson = await prisma.personNode.create({
    data: {
      firstName: "Mark",
      lastName: "Newman",
      birthDate: new Date("1975-09-01"),
      birthPlace: "Boston",
      occupation: "Engineer",
      userId: mark.id,
      createdById: mark.id,
    },
  });

  const evePerson = await prisma.personNode.create({
    data: {
      firstName: "Eve",
      lastName: "Newman",
      maidenName: "Collins",
      birthDate: new Date("1978-02-14"),
      birthPlace: "New York",
      occupation: "Doctor",
      userId: eve.id,
      createdById: eve.id,
    },
  });

  const jackPerson = await prisma.personNode.create({
    data: {
      firstName: "Jack",
      lastName: "Newman",
      birthDate: new Date("2008-05-30"),
      birthPlace: "Boston",
      userId: jack.id,
      createdById: mark.id,
    },
  });

  const zoePerson = await prisma.personNode.create({
    data: {
      firstName: "Zoe",
      lastName: "Newman",
      birthDate: new Date("2011-08-19"),
      birthPlace: "Boston",
      userId: zoe.id,
      createdById: mark.id,
    },
  });

  const katePerson = await prisma.personNode.create({
    data: {
      firstName: "Kate",
      lastName: "Wolfe",
      maidenName: "Newman",
      birthDate: new Date("1980-12-05"),
      birthPlace: "Boston",
      occupation: "Accountant",
      userId: kate.id,
      createdById: kate.id,
    },
  });

  const peterPerson = await prisma.personNode.create({
    data: {
      firstName: "Peter",
      lastName: "Wolfe",
      birthDate: new Date("1979-04-22"),
      birthPlace: "Seattle",
      occupation: "Electrician",
      userId: peter.id,
      createdById: peter.id,
    },
  });

  const alicePerson = await prisma.personNode.create({
    data: {
      firstName: "Alice",
      lastName: "Wolfe",
      birthDate: new Date("2015-01-10"),
      birthPlace: "Boston",
      userId: alice.id,
      createdById: kate.id,
    },
  });

  const newmanFamily = await prisma.family.create({
    data: {
      name: "Newman Family",
      description: "Family of Mark and Eve Newman",
      createdById: mark.id,
    },
  });

  const wolfeFamily = await prisma.family.create({
    data: {
      name: "Wolfe Family",
      description: "Family of Kate and Peter Wolfe",
      createdById: kate.id,
    },
  });

  const markMember = await prisma.familyMember.create({
    data: { userId: mark.id, familyId: newmanFamily.id, personNodeId: markPerson.id, role: FamilyRole.PARENT, status: MemberStatus.ACTIVE },
  });
  const eveMember = await prisma.familyMember.create({
    data: { userId: eve.id, familyId: newmanFamily.id, personNodeId: evePerson.id, role: FamilyRole.PARENT, status: MemberStatus.ACTIVE },
  });
  const jackMember = await prisma.familyMember.create({
    data: { userId: jack.id, familyId: newmanFamily.id, personNodeId: jackPerson.id, role: FamilyRole.CHILD, status: MemberStatus.ACTIVE },
  });
  const zoeMember = await prisma.familyMember.create({
    data: { userId: zoe.id, familyId: newmanFamily.id, personNodeId: zoePerson.id, role: FamilyRole.CHILD, status: MemberStatus.ACTIVE },
  });
  const sophieMember = await prisma.familyMember.create({
    data: { userId: sophie.id, familyId: newmanFamily.id, personNodeId: sophiePerson.id, role: FamilyRole.SENIOR, status: MemberStatus.ACTIVE },
  });
  const kateMemberNewman = await prisma.familyMember.create({
    data: { userId: kate.id, familyId: newmanFamily.id, personNodeId: katePerson.id, role: FamilyRole.GUARDIAN, status: MemberStatus.ACTIVE },
  });

  const kateMemberWolfe = await prisma.familyMember.create({
    data: { userId: kate.id, familyId: wolfeFamily.id, personNodeId: katePerson.id, role: FamilyRole.PARENT, status: MemberStatus.ACTIVE },
  });
  const peterMember = await prisma.familyMember.create({
    data: { userId: peter.id, familyId: wolfeFamily.id, personNodeId: peterPerson.id, role: FamilyRole.PARENT, status: MemberStatus.ACTIVE },
  });
  const aliceMember = await prisma.familyMember.create({
    data: { userId: alice.id, familyId: wolfeFamily.id, personNodeId: alicePerson.id, role: FamilyRole.CHILD, status: MemberStatus.ACTIVE },
  });

  await prisma.familyTreeMembership.createMany({
    data: [
      { personId: theodorePerson.id, familyId: newmanFamily.id, addedById: markMember.id },
      { personId: sophiePerson.id, familyId: newmanFamily.id, addedById: markMember.id },
      { personId: markPerson.id, familyId: newmanFamily.id, addedById: markMember.id },
      { personId: evePerson.id, familyId: newmanFamily.id, addedById: markMember.id },
      { personId: jackPerson.id, familyId: newmanFamily.id, addedById: markMember.id },
      { personId: zoePerson.id, familyId: newmanFamily.id, addedById: markMember.id },
      { personId: katePerson.id, familyId: newmanFamily.id, addedById: markMember.id },
      { personId: katePerson.id, familyId: wolfeFamily.id, addedById: kateMemberWolfe.id },
      { personId: peterPerson.id, familyId: wolfeFamily.id, addedById: kateMemberWolfe.id },
      { personId: alicePerson.id, familyId: wolfeFamily.id, addedById: kateMemberWolfe.id },
    ],
  });

  await prisma.personRelation.createMany({
    data: [
      { familyId: newmanFamily.id, personAId: theodorePerson.id, personBId: markPerson.id, relation: RelationType.PARENT_OF, createdById: mark.id },
      { familyId: newmanFamily.id, personAId: sophiePerson.id, personBId: markPerson.id, relation: RelationType.PARENT_OF, createdById: mark.id },
      { familyId: newmanFamily.id, personAId: theodorePerson.id, personBId: sophiePerson.id, relation: RelationType.PARTNER_OF, createdById: mark.id },
      { familyId: newmanFamily.id, personAId: theodorePerson.id, personBId: katePerson.id, relation: RelationType.PARENT_OF, createdById: mark.id },
      { familyId: newmanFamily.id, personAId: sophiePerson.id, personBId: katePerson.id, relation: RelationType.PARENT_OF, createdById: mark.id },
      { familyId: newmanFamily.id, personAId: markPerson.id, personBId: katePerson.id, relation: RelationType.SIBLING_OF, createdById: mark.id },
      { familyId: newmanFamily.id, personAId: markPerson.id, personBId: evePerson.id, relation: RelationType.PARTNER_OF, createdById: mark.id },
      { familyId: newmanFamily.id, personAId: markPerson.id, personBId: jackPerson.id, relation: RelationType.PARENT_OF, createdById: mark.id },
      { familyId: newmanFamily.id, personAId: evePerson.id, personBId: jackPerson.id, relation: RelationType.PARENT_OF, createdById: eve.id },
      { familyId: newmanFamily.id, personAId: markPerson.id, personBId: zoePerson.id, relation: RelationType.PARENT_OF, createdById: mark.id },
      { familyId: newmanFamily.id, personAId: evePerson.id, personBId: zoePerson.id, relation: RelationType.PARENT_OF, createdById: eve.id },
      { familyId: newmanFamily.id, personAId: jackPerson.id, personBId: zoePerson.id, relation: RelationType.SIBLING_OF, createdById: mark.id },

      { familyId: wolfeFamily.id, personAId: peterPerson.id, personBId: katePerson.id, relation: RelationType.PARTNER_OF, createdById: kate.id },
      { familyId: wolfeFamily.id, personAId: peterPerson.id, personBId: alicePerson.id, relation: RelationType.PARENT_OF, createdById: kate.id },
      { familyId: wolfeFamily.id, personAId: katePerson.id, personBId: alicePerson.id, relation: RelationType.PARENT_OF, createdById: kate.id },
    ],
  });

  await prisma.familyInvitation.createMany({
    data: [
      {
        token: randomUUID(),
        email: "grandma2@test.com",
        role: FamilyRole.SENIOR,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        familyId: newmanFamily.id,
        invitedById: markMember.id,
      },
      {
        token: randomUUID(),
        email: "uncle@test.com",
        role: FamilyRole.GUARDIAN,
        expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        familyId: newmanFamily.id,
        invitedById: eveMember.id,
      },
    ],
  });

  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const groupChat = await prisma.conversation.create({
    data: {
      type: ConversationType.GROUP_CUSTOM,
      name: "Newman Family",
      familyId: newmanFamily.id,
      createdById: markMember.id,
      lastMessageAt: new Date(now - 0.2 * day),
      participants: {
        create: [markMember, eveMember, jackMember, zoeMember, sophieMember, kateMemberNewman].map((m) => ({
          memberId: m.id,
        })),
      },
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: groupChat.id, senderId: markMember.id, content: "Hey everyone! Don't forget Sunday lunch at grandma's.", sentAt: new Date(now - 3 * day) },
      { conversationId: groupChat.id, senderId: eveMember.id, content: "Sure, I'll bring a cake :)", sentAt: new Date(now - 3 * day + 5 * 60 * 1000) },
      { conversationId: groupChat.id, senderId: sophieMember.id, content: "Looking forward to it, I'll make stew!", sentAt: new Date(now - 2.8 * day) },
      { conversationId: groupChat.id, senderId: jackMember.id, content: "I can bring a board game", sentAt: new Date(now - 2 * day) },
      { conversationId: groupChat.id, senderId: kateMemberNewman.id, content: "We'll drop by too with Peter and Alice", sentAt: new Date(now - 1 * day) },
      { conversationId: groupChat.id, senderId: markMember.id, content: "Great, see you all on Sunday!", sentAt: new Date(now - 0.2 * day) },
    ],
  });

  const directChat = await prisma.conversation.create({
    data: {
      type: ConversationType.DIRECT,
      familyId: newmanFamily.id,
      createdById: jackMember.id,
      lastMessageAt: new Date(now - 1 * day + 5 * 60 * 1000),
      participants: {
        create: [{ memberId: jackMember.id }, { memberId: zoeMember.id }],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: directChat.id, senderId: jackMember.id, content: "Have you seen my backpack?", sentAt: new Date(now - 1 * day) },
      { conversationId: directChat.id, senderId: zoeMember.id, content: "It's in your room under the bed", sentAt: new Date(now - 1 * day + 5 * 60 * 1000) },
    ],
  });

  const groceriesBudget = await prisma.budget.create({
    data: { name: "Groceries", category: BudgetCategory.GROCERIES, limitAmount: 1500, period: BudgetPeriod.MONTHLY, familyId: newmanFamily.id, createdById: markMember.id },
  });
  const billsBudget = await prisma.budget.create({
    data: { name: "Bills", category: BudgetCategory.BILLS, limitAmount: 600, period: BudgetPeriod.MONTHLY, familyId: newmanFamily.id, createdById: eveMember.id },
  });
  await prisma.budget.create({
    data: { name: "Vacation budget 2025", category: BudgetCategory.TRANSPORT, limitAmount: 2000, period: BudgetPeriod.YEARLY, isActive: false, familyId: newmanFamily.id, createdById: markMember.id },
  });

  await prisma.expense.createMany({
    data: [
      { title: "Grocery shopping at Trader Joe's", amount: 187.32, date: new Date(now - 4 * day), budgetId: groceriesBudget.id, familyId: newmanFamily.id, paidById: markMember.id },
      { title: "Grocery shopping at Costco", amount: 94.50, date: new Date(now - 2 * day), budgetId: groceriesBudget.id, familyId: newmanFamily.id, paidById: eveMember.id },
      { title: "Electricity bill", amount: 210.00, date: new Date(now - 5 * day), budgetId: billsBudget.id, familyId: newmanFamily.id, paidById: eveMember.id },
      { title: "Birthday gift for Jack", amount: 150.00, date: new Date(now - 6 * day), familyId: newmanFamily.id, paidById: kateMemberNewman.id },
    ],
  });

  const vacationGoal = await prisma.savingGoal.create({
    data: { name: "Mountain vacation", targetAmount: 5000, deadline: new Date(now + 150 * day), familyId: newmanFamily.id, createdById: markMember.id },
  });
  await prisma.goalContribution.createMany({
    data: [
      { goalId: vacationGoal.id, amount: 500, note: "First contribution", memberId: markMember.id },
      { goalId: vacationGoal.id, amount: 300, note: "Adding some too", memberId: eveMember.id },
    ],
  });

  const bikeGoal = await prisma.savingGoal.create({
    data: { name: "New bike for Jack", targetAmount: 800, isAchieved: true, familyId: newmanFamily.id, createdById: eveMember.id },
  });
  await prisma.goalContribution.create({
    data: { goalId: bikeGoal.id, amount: 800, note: "Whole budget at once", memberId: eveMember.id },
  });

  await prisma.album.create({
    data: { name: "Family Photos", type: AlbumType.CUSTOM, familyId: newmanFamily.id, createdById: markMember.id },
  });
  await prisma.album.create({
    data: { name: "Vacation 2025", type: AlbumType.CUSTOM, familyId: newmanFamily.id, createdById: markMember.id },
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
