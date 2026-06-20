import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import prisma from "../config/database";
import { generateToken } from "../utils/jwt";
import { sendEmail, getPasswordResetTemplate } from "../utils/email";
import { sendResponse, sendError } from "../utils/response";
import { env } from "../config/env";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return sendError(res, 401, "Invalid email or password");
  }

  const isValidPassword = await bcryptjs.compare(password, admin.password);

  if (!isValidPassword) {
    return sendError(res, 401, "Invalid email or password");
  }

  const token = generateToken({
    adminId: admin.id,
    email: admin.email,
  });

  return sendResponse(res, 200, "Login successful", {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return sendResponse(
      res,
      200,
      "If an account exists, a reset link has been sent",
    );
  }

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      adminId: admin.id,
      token,
      expiresAt,
    },
  });

  const resetUrl = `${env.FRONTEND_URL}/admin/reset-password?token=${token}`;

  await sendEmail({
    to: admin.email,
    subject: "Password Reset - West Main Tire & Lube",
    html: getPasswordResetTemplate(resetUrl),
  });

  return sendResponse(
    res,
    200,
    "If an account exists, a reset link has been sent",
  );
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
    return sendError(res, 400, "Invalid or expired token");
  }

  const hashedPassword = await bcryptjs.hash(password, 12);

  await prisma.$transaction([
    prisma.admin.update({
      where: { id: resetToken.adminId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),
  ]);

  return sendResponse(res, 200, "Password reset successful");
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const adminId = req.admin!.adminId;

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
  });

  if (!admin) {
    return sendError(res, 404, "Admin not found");
  }

  const isValidPassword = await bcryptjs.compare(
    currentPassword,
    admin.password,
  );

  if (!isValidPassword) {
    return sendError(res, 401, "Current password is incorrect");
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 12);

  await prisma.admin.update({
    where: { id: adminId },
    data: { password: hashedPassword },
  });

  return sendResponse(res, 200, "Password changed successfully");
};

export const getProfile = async (req: Request, res: Response) => {
  const adminId = req.admin!.adminId;

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!admin) {
    return sendError(res, 404, "Admin not found");
  }

  return sendResponse(res, 200, "Profile fetched", admin);
};

export const updateProfile = async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const adminId = req.admin!.adminId;

  const admin = await prisma.admin.update({
    where: { id: adminId },
    data: { name, email },
  });

  return sendResponse(res, 200, "Profile updated", {
    id: admin.id,
    name: admin.name,
    email: admin.email,
  });
};
