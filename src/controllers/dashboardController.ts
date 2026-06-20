import { Request, Response } from "express";
import prisma from "../config/database";
import { sendResponse } from "../utils/response";
import { AppointmentStatus } from "../../generated/prisma/enums";

export const getDashboardStats = async (req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalBookings,
    todaysBookings,
    upcomingBookings,
    cancelledBookings,
    totalActiveServices,
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({
      where: {
        appointmentDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    }),
    prisma.appointment.count({
      where: {
        appointmentDate: { gte: today },
        status: {
          in: [AppointmentStatus.Pending, AppointmentStatus.Confirmed],
        },
      },
    }),
    prisma.appointment.count({
      where: { status: AppointmentStatus.Cancelled },
    }),
    prisma.service.count({
      where: { isActive: true },
    }),
  ]);

  return sendResponse(res, 200, "Dashboard stats fetched", {
    totalBookings,
    todaysBookings,
    upcomingBookings,
    cancelledBookings,
    totalActiveServices,
  });
};

export const getRecentBookings = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;

  const bookings = await prisma.appointment.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: { name: true, email: true, phone: true },
      },
      appointmentServices: {
        select: { serviceName: true },
      },
    },
  });

  const formatted = bookings.map((b) => ({
    id: b.id,
    customerName: b.customer.name,
    date: b.appointmentDate.toISOString().split("T")[0],
    time: b.startTime,
    services: b.appointmentServices.map((s) => s.serviceName),
    status: b.status,
    createdAt: b.createdAt,
  }));

  return sendResponse(res, 200, "Recent bookings fetched", formatted);
};
