// import { PrismaClient, Day, ShopStatus } from "@prisma/client";

import { Day, ShopStatus } from "../generated/prisma/enums";

import bcryptjs from "bcryptjs";
import prisma from "../src/config/database";

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Create Admin
  const adminPassword = await bcryptjs.hash("admin123", 12);
  const admin = await prisma.admin.upsert({
    where: { email: "kenelson1909p@yahoo.com.sg" },
    update: {},
    create: {
      name: "System Administrator",
      email: "kenelson1909p@yahoo.com.sg",
      password: adminPassword,
    },
  });
  console.log("✅ Admin created:", admin.email, "(password: Admin@1234)");

  // 2. Create Default Schedule (Mon-Fri: 7AM-5PM, Sat-Sun: Closed)
  const defaultSchedule = [
    { day: Day.Monday, isOpen: true, startTime: "07:00", endTime: "17:00" },
    { day: Day.Tuesday, isOpen: true, startTime: "07:00", endTime: "17:00" },
    { day: Day.Wednesday, isOpen: true, startTime: "07:00", endTime: "17:00" },
    { day: Day.Thursday, isOpen: true, startTime: "07:00", endTime: "17:00" },
    { day: Day.Friday, isOpen: true, startTime: "07:00", endTime: "17:00" },
    { day: Day.Saturday, isOpen: false, startTime: "00:00", endTime: "00:00" },
    { day: Day.Sunday, isOpen: false, startTime: "00:00", endTime: "00:00" },
  ];

  for (const schedule of defaultSchedule) {
    await prisma.scheduleSetting.upsert({
      where: { day: schedule.day },
      update: {},
      create: schedule,
    });
  }
  console.log("✅ Default schedule created (Mon-Fri 7AM-5PM, Sat-Sun Closed)");

  // 3. Create Shop Settings
  await prisma.shopSetting.upsert({
    where: { id: "1" },
    update: {},
    create: {
      shopStatus: ShopStatus.Open,
      maintenanceMessage: "We are currently not accepting appointments.",
      timeZone: "America/New_York",
      slotInterval: 30,
    },
  });
  console.log(
    "✅ Default shop settings created (Status: Open, TimeZone: America/New_York, SlotInterval: 30min)",
  );

  console.log("\n🎉 Seed completed successfully!");
  console.log("   Login: admin@westmaintire.com / admin123");
  console.log("   IMPORTANT: Change the admin password after first login!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
