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
  // kolejnosc kasowania: od "liscia" do "korzenia", bo nie wszystkie
  // relacje maja onDelete: Cascade (patrz schema.prisma)
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

  // --- USERS ---
  const zofia = await prisma.user.create({ data: { email: "zofia@test.com", passwordHash } });
  const marek = await prisma.user.create({ data: { email: "marek@test.com", passwordHash } });
  const ewa = await prisma.user.create({ data: { email: "ewa@test.com", passwordHash } });
  const kuba = await prisma.user.create({ data: { email: "kuba@test.com", passwordHash } });
  const zosia = await prisma.user.create({ data: { email: "zosia@test.com", passwordHash } });
  const kasia = await prisma.user.create({ data: { email: "kasia@test.com", passwordHash } });
  const piotr = await prisma.user.create({ data: { email: "piotr@test.com", passwordHash } });
  const ala = await prisma.user.create({ data: { email: "ala@test.com", passwordHash } });

  // --- PERSON NODES ---
  // Tadeusz nie ma konta - to zmarly przodek, dodany recznie do drzewa przez Marka
  const tadeuszPerson = await prisma.personNode.create({
    data: {
      firstName: "Tadeusz",
      lastName: "Nowak",
      birthDate: new Date("1945-03-12"),
      birthPlace: "Krakow",
      deathDate: new Date("2020-11-02"),
      deathPlace: "Krakow",
      occupation: "Kolejarz",
      bio: "Ojciec Marka, zmarl w 2020 roku.",
      createdById: marek.id,
    },
  });

  const zofiaPerson = await prisma.personNode.create({
    data: {
      firstName: "Zofia",
      lastName: "Nowak",
      birthDate: new Date("1948-06-20"),
      birthPlace: "Krakow",
      occupation: "Nauczycielka (emerytka)",
      userId: zofia.id,
      createdById: zofia.id,
    },
  });

  const marekPerson = await prisma.personNode.create({
    data: {
      firstName: "Marek",
      lastName: "Nowak",
      birthDate: new Date("1975-09-01"),
      birthPlace: "Krakow",
      occupation: "Inzynier",
      userId: marek.id,
      createdById: marek.id,
    },
  });

  const ewaPerson = await prisma.personNode.create({
    data: {
      firstName: "Ewa",
      lastName: "Nowak",
      maidenName: "Kowalska",
      birthDate: new Date("1978-02-14"),
      birthPlace: "Warszawa",
      occupation: "Lekarka",
      userId: ewa.id,
      createdById: ewa.id,
    },
  });

  // konto Kuby zalozyl rodzic (Marek) - stad createdById = marek, nie kuba
  const kubaPerson = await prisma.personNode.create({
    data: {
      firstName: "Kuba",
      lastName: "Nowak",
      birthDate: new Date("2008-05-30"),
      birthPlace: "Krakow",
      userId: kuba.id,
      createdById: marek.id,
    },
  });

  const zosiaPerson = await prisma.personNode.create({
    data: {
      firstName: "Zosia",
      lastName: "Nowak",
      birthDate: new Date("2011-08-19"),
      birthPlace: "Krakow",
      userId: zosia.id,
      createdById: marek.id,
    },
  });

  const kasiaPerson = await prisma.personNode.create({
    data: {
      firstName: "Kasia",
      lastName: "Wilk",
      maidenName: "Nowak",
      birthDate: new Date("1980-12-05"),
      birthPlace: "Krakow",
      occupation: "Ksiegowa",
      userId: kasia.id,
      createdById: kasia.id,
    },
  });

  const piotrPerson = await prisma.personNode.create({
    data: {
      firstName: "Piotr",
      lastName: "Wilk",
      birthDate: new Date("1979-04-22"),
      birthPlace: "Gdansk",
      occupation: "Elektryk",
      userId: piotr.id,
      createdById: piotr.id,
    },
  });

  const alaPerson = await prisma.personNode.create({
    data: {
      firstName: "Ala",
      lastName: "Wilk",
      birthDate: new Date("2015-01-10"),
      birthPlace: "Krakow",
      userId: ala.id,
      createdById: kasia.id,
    },
  });

  // --- FAMILIES ---
  const nowak = await prisma.family.create({
    data: {
      name: "Rodzina Nowak",
      description: "Rodzina Marka i Ewy Nowak",
      createdById: marek.id,
    },
  });

  const wilk = await prisma.family.create({
    data: {
      name: "Rodzina Wilk",
      description: "Rodzina Kasi i Piotra Wilk",
      createdById: kasia.id,
    },
  });

  // --- FAMILY MEMBERS (pojedynczo, bo potrzebujemy id do dalszych tabel) ---
  const marekMember = await prisma.familyMember.create({
    data: { userId: marek.id, familyId: nowak.id, personNodeId: marekPerson.id, role: FamilyRole.PARENT, status: MemberStatus.ACTIVE },
  });
  const ewaMember = await prisma.familyMember.create({
    data: { userId: ewa.id, familyId: nowak.id, personNodeId: ewaPerson.id, role: FamilyRole.PARENT, status: MemberStatus.ACTIVE },
  });
  const kubaMember = await prisma.familyMember.create({
    data: { userId: kuba.id, familyId: nowak.id, personNodeId: kubaPerson.id, role: FamilyRole.CHILD, status: MemberStatus.ACTIVE },
  });
  const zosiaMember = await prisma.familyMember.create({
    data: { userId: zosia.id, familyId: nowak.id, personNodeId: zosiaPerson.id, role: FamilyRole.CHILD, status: MemberStatus.ACTIVE },
  });
  const zofiaMember = await prisma.familyMember.create({
    data: { userId: zofia.id, familyId: nowak.id, personNodeId: zofiaPerson.id, role: FamilyRole.SENIOR, status: MemberStatus.ACTIVE },
  });
  // Kasia jest GUARDIAN u Nowakow, ale PARENT we wlasnej rodzinie (Wilk) - patrz nizej
  const kasiaMemberNowak = await prisma.familyMember.create({
    data: { userId: kasia.id, familyId: nowak.id, personNodeId: kasiaPerson.id, role: FamilyRole.GUARDIAN, status: MemberStatus.ACTIVE },
  });

  const kasiaMemberWilk = await prisma.familyMember.create({
    data: { userId: kasia.id, familyId: wilk.id, personNodeId: kasiaPerson.id, role: FamilyRole.PARENT, status: MemberStatus.ACTIVE },
  });
  const piotrMember = await prisma.familyMember.create({
    data: { userId: piotr.id, familyId: wilk.id, personNodeId: piotrPerson.id, role: FamilyRole.PARENT, status: MemberStatus.ACTIVE },
  });
  const alaMember = await prisma.familyMember.create({
    data: { userId: ala.id, familyId: wilk.id, personNodeId: alaPerson.id, role: FamilyRole.CHILD, status: MemberStatus.ACTIVE },
  });

  // --- TREE MEMBERSHIPS ---
  await prisma.familyTreeMembership.createMany({
    data: [
      { personId: tadeuszPerson.id, familyId: nowak.id, addedById: marekMember.id },
      { personId: zofiaPerson.id, familyId: nowak.id, addedById: marekMember.id },
      { personId: marekPerson.id, familyId: nowak.id, addedById: marekMember.id },
      { personId: ewaPerson.id, familyId: nowak.id, addedById: marekMember.id },
      { personId: kubaPerson.id, familyId: nowak.id, addedById: marekMember.id },
      { personId: zosiaPerson.id, familyId: nowak.id, addedById: marekMember.id },
      { personId: kasiaPerson.id, familyId: nowak.id, addedById: marekMember.id },
      // kasiaPerson pojawia sie tez w drzewie drugiej rodziny - to ten sam globalny PersonNode
      { personId: kasiaPerson.id, familyId: wilk.id, addedById: kasiaMemberWilk.id },
      { personId: piotrPerson.id, familyId: wilk.id, addedById: kasiaMemberWilk.id },
      { personId: alaPerson.id, familyId: wilk.id, addedById: kasiaMemberWilk.id },
    ],
  });

  // --- PERSON RELATIONS ---
  await prisma.personRelation.createMany({
    data: [
      { familyId: nowak.id, personAId: tadeuszPerson.id, personBId: marekPerson.id, relation: RelationType.PARENT_OF, createdById: marek.id },
      { familyId: nowak.id, personAId: zofiaPerson.id, personBId: marekPerson.id, relation: RelationType.PARENT_OF, createdById: marek.id },
      { familyId: nowak.id, personAId: tadeuszPerson.id, personBId: zofiaPerson.id, relation: RelationType.PARTNER_OF, createdById: marek.id },
      { familyId: nowak.id, personAId: tadeuszPerson.id, personBId: kasiaPerson.id, relation: RelationType.PARENT_OF, createdById: marek.id },
      { familyId: nowak.id, personAId: zofiaPerson.id, personBId: kasiaPerson.id, relation: RelationType.PARENT_OF, createdById: marek.id },
      { familyId: nowak.id, personAId: marekPerson.id, personBId: kasiaPerson.id, relation: RelationType.SIBLING_OF, createdById: marek.id },
      { familyId: nowak.id, personAId: marekPerson.id, personBId: ewaPerson.id, relation: RelationType.PARTNER_OF, createdById: marek.id },
      { familyId: nowak.id, personAId: marekPerson.id, personBId: kubaPerson.id, relation: RelationType.PARENT_OF, createdById: marek.id },
      { familyId: nowak.id, personAId: ewaPerson.id, personBId: kubaPerson.id, relation: RelationType.PARENT_OF, createdById: ewa.id },
      { familyId: nowak.id, personAId: marekPerson.id, personBId: zosiaPerson.id, relation: RelationType.PARENT_OF, createdById: marek.id },
      { familyId: nowak.id, personAId: ewaPerson.id, personBId: zosiaPerson.id, relation: RelationType.PARENT_OF, createdById: ewa.id },
      { familyId: nowak.id, personAId: kubaPerson.id, personBId: zosiaPerson.id, relation: RelationType.SIBLING_OF, createdById: marek.id },

      { familyId: wilk.id, personAId: piotrPerson.id, personBId: kasiaPerson.id, relation: RelationType.PARTNER_OF, createdById: kasia.id },
      { familyId: wilk.id, personAId: piotrPerson.id, personBId: alaPerson.id, relation: RelationType.PARENT_OF, createdById: kasia.id },
      { familyId: wilk.id, personAId: kasiaPerson.id, personBId: alaPerson.id, relation: RelationType.PARENT_OF, createdById: kasia.id },
    ],
  });

  // --- INVITATIONS (jeden aktywny, jeden przeterminowany - dwa rozne stany) ---
  await prisma.familyInvitation.createMany({
    data: [
      {
        token: randomUUID(),
        email: "babcia2@test.com",
        role: FamilyRole.SENIOR,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        familyId: nowak.id,
        invitedById: marekMember.id,
      },
      {
        token: randomUUID(),
        email: "wujek@test.com",
        role: FamilyRole.GUARDIAN,
        expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        familyId: nowak.id,
        invitedById: ewaMember.id,
      },
    ],
  });

  // --- CHAT ---
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const groupChat = await prisma.conversation.create({
    data: {
      type: ConversationType.GROUP_CUSTOM,
      name: "Rodzina Nowak",
      familyId: nowak.id,
      createdById: marekMember.id,
      lastMessageAt: new Date(now - 0.2 * day),
      participants: {
        create: [marekMember, ewaMember, kubaMember, zosiaMember, zofiaMember, kasiaMemberNowak].map((m) => ({
          memberId: m.id,
        })),
      },
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: groupChat.id, senderId: marekMember.id, content: "Czesc wszystkim! Pamietajcie o niedzielnym obiedzie u babci.", sentAt: new Date(now - 3 * day) },
      { conversationId: groupChat.id, senderId: ewaMember.id, content: "Jasne, przywioze ciasto :)", sentAt: new Date(now - 3 * day + 5 * 60 * 1000) },
      { conversationId: groupChat.id, senderId: zofiaMember.id, content: "Czekam na Was, bedzie bigos!", sentAt: new Date(now - 2.8 * day) },
      { conversationId: groupChat.id, senderId: kubaMember.id, content: "Ja moge przywiezc gre planszowa", sentAt: new Date(now - 2 * day) },
      { conversationId: groupChat.id, senderId: kasiaMemberNowak.id, content: "My tez wpadniemy z Piotrem i Ala", sentAt: new Date(now - 1 * day) },
      { conversationId: groupChat.id, senderId: marekMember.id, content: "Super, do zobaczenia w niedziele!", sentAt: new Date(now - 0.2 * day) },
    ],
  });

  const directChat = await prisma.conversation.create({
    data: {
      type: ConversationType.DIRECT,
      familyId: nowak.id,
      createdById: kubaMember.id,
      lastMessageAt: new Date(now - 1 * day + 5 * 60 * 1000),
      participants: {
        create: [{ memberId: kubaMember.id }, { memberId: zosiaMember.id }],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: directChat.id, senderId: kubaMember.id, content: "Widziales moj plecak?", sentAt: new Date(now - 1 * day) },
      { conversationId: directChat.id, senderId: zosiaMember.id, content: "Jest w Twoim pokoju pod lozkiem", sentAt: new Date(now - 1 * day + 5 * 60 * 1000) },
    ],
  });

  // --- FINANCE ---
  const budgetZakupy = await prisma.budget.create({
    data: { name: "Zakupy spozywcze", category: BudgetCategory.GROCERIES, limitAmount: 1500, period: BudgetPeriod.MONTHLY, familyId: nowak.id, createdById: marekMember.id },
  });
  const budgetRachunki = await prisma.budget.create({
    data: { name: "Rachunki", category: BudgetCategory.BILLS, limitAmount: 600, period: BudgetPeriod.MONTHLY, familyId: nowak.id, createdById: ewaMember.id },
  });
  // stary, nieaktywny budzet - pokazuje pole isActive
  await prisma.budget.create({
    data: { name: "Wakacyjny budzet 2025", category: BudgetCategory.TRANSPORT, limitAmount: 2000, period: BudgetPeriod.YEARLY, isActive: false, familyId: nowak.id, createdById: marekMember.id },
  });

  await prisma.expense.createMany({
    data: [
      { title: "Zakupy w Biedronce", amount: 187.32, date: new Date(now - 4 * day), budgetId: budgetZakupy.id, familyId: nowak.id, paidById: marekMember.id },
      { title: "Zakupy w Lidlu", amount: 94.50, date: new Date(now - 2 * day), budgetId: budgetZakupy.id, familyId: nowak.id, paidById: ewaMember.id },
      { title: "Prad", amount: 210.00, date: new Date(now - 5 * day), budgetId: budgetRachunki.id, familyId: nowak.id, paidById: ewaMember.id },
      // wydatek bez przypisanego budzetu - budgetId jest opcjonalne
      { title: "Prezent urodzinowy dla Kuby", amount: 150.00, date: new Date(now - 6 * day), familyId: nowak.id, paidById: kasiaMemberNowak.id },
    ],
  });

  const wakacjeGoal = await prisma.savingGoal.create({
    data: { name: "Wakacje w gorach", targetAmount: 5000, deadline: new Date(now + 150 * day), familyId: nowak.id, createdById: marekMember.id },
  });
  await prisma.goalContribution.createMany({
    data: [
      { goalId: wakacjeGoal.id, amount: 500, note: "Pierwsza wplata", memberId: marekMember.id },
      { goalId: wakacjeGoal.id, amount: 300, note: "Tez cos dorzucam", memberId: ewaMember.id },
    ],
  });

  // cel juz osiagniety - pokazuje stan isAchieved: true
  const rowerGoal = await prisma.savingGoal.create({
    data: { name: "Nowy rower dla Kuby", targetAmount: 800, isAchieved: true, familyId: nowak.id, createdById: ewaMember.id },
  });
  await prisma.goalContribution.create({
    data: { goalId: rowerGoal.id, amount: 800, note: "Caly budzet na raz", memberId: ewaMember.id },
  });

  // --- ALBUMS (bez MediaFile - te dojda po wgraniu zdjec do MinIO) ---
  await prisma.album.create({
    data: { name: "Wszystkie zdjecia", type: AlbumType.DEFAULT, familyId: nowak.id },
  });
  await prisma.album.create({
    data: { name: "Wakacje 2025", type: AlbumType.CUSTOM, familyId: nowak.id, createdById: marekMember.id },
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
