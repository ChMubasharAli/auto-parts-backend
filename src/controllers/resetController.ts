import { Request, Response } from "express";
import prisma from "../config/database";

export const resetDatabase = async (req: Request, res: Response) => {
  try {
    console.log("🗑️ Starting database reset...");

    // Delete in correct order (children first, parents later)
    await prisma.passwordResetToken.deleteMany();
    await prisma.appointmentService.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.blockedSlot.deleteMany();
    await prisma.dayOff.deleteMany();
    await prisma.scheduleSetting.deleteMany();
    await prisma.service.deleteMany();
    await prisma.shopSetting.deleteMany();
    // Admin preserved for login

    console.log("✅ Database reset completed!");

    res.status(200).json({
      success: true,
      message: "Database reset successfully. Admin preserved.",
    });
  } catch (error) {
    console.error("❌ Reset failed:", error);
    res.status(500).json({
      success: false,
      message: "Reset failed",
      error: error,
    });
  }
};
