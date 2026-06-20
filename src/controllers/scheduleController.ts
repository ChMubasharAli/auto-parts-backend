import { Request, Response } from "express";
import prisma from "../config/database";
import { sendResponse, sendError } from "../utils/response";

import { parseDateString, getDayNameFromDateString } from "../utils/date";
import { Day } from "../../generated/prisma/enums";

export const getSchedule = async (req: Request, res: Response) => {
  const schedule = await prisma.scheduleSetting.findMany({
    orderBy: { day: "asc" },
  });

  const shopSettings = await prisma.shopSetting.findFirst();

  return sendResponse(res, 200, "Schedule fetched", {
    schedule,
    slotInterval: shopSettings?.slotInterval || 30,
  });
};

export const updateSchedule = async (req: Request, res: Response) => {
  const { day } = req.params;
  const { isOpen, startTime, endTime } = req.body;

  const dayEnum = day as Day;
  if (!Object.values(Day).includes(dayEnum)) {
    return sendError(res, 400, "Invalid day");
  }

  const updated = await prisma.scheduleSetting.upsert({
    where: { day: dayEnum },
    update: { isOpen, startTime, endTime },
    create: { day: dayEnum, isOpen, startTime, endTime },
  });

  return sendResponse(res, 200, "Schedule updated", updated);
};

export const getBlockedSlots = async (req: Request, res: Response) => {
  const date = req.query.date as string;

  const where: any = {};
  if (date) {
    where.date = parseDateString(date);
  }

  const blockedSlots = await prisma.blockedSlot.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return sendResponse(res, 200, "Blocked slots fetched", blockedSlots);
};

export const createBlockedSlot = async (req: Request, res: Response) => {
  const { date, startTime, endTime, reason } = req.body;

  const blockedSlot = await prisma.blockedSlot.create({
    data: {
      date: parseDateString(date),
      startTime,
      endTime,
      reason,
    },
  });

  return sendResponse(res, 201, "Blocked slot created", blockedSlot);
};

export const deleteBlockedSlot = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return sendError(res, 400, "Invalid ID format provided");
  }

  await prisma.blockedSlot.delete({
    where: { id },
  });

  return sendResponse(res, 200, "Blocked slot deleted");
};

export const getDayOffs = async (req: Request, res: Response) => {
  const dayOffs = await prisma.dayOff.findMany({
    orderBy: { date: "asc" },
  });

  return sendResponse(res, 200, "Day offs fetched", dayOffs);
};

export const createDayOff = async (req: Request, res: Response) => {
  const { date, reason } = req.body;

  const dayOff = await prisma.dayOff.create({
    data: {
      date: parseDateString(date),
      reason,
    },
  });

  return sendResponse(res, 201, "Day off created", dayOff);
};

export const deleteDayOff = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return sendError(res, 400, "Invalid ID format provided");
  }

  await prisma.dayOff.delete({
    where: { id },
  });

  return sendResponse(res, 200, "Day off deleted");
};

export const updateSlotInterval = async (req: Request, res: Response) => {
  const { slotInterval } = req.body;

  const shopSettings = await prisma.shopSetting.findFirst();

  if (!shopSettings) {
    return sendError(res, 404, "Shop settings not found");
  }

  const updated = await prisma.shopSetting.update({
    where: { id: shopSettings.id },
    data: { slotInterval: Number(slotInterval) },
  });

  return sendResponse(res, 200, "Slot interval updated", updated);
};

export const getAvailableSlots = async (req: Request, res: Response) => {
  const { date, serviceIds } = req.query;

  if (!date || !serviceIds) {
    return sendError(res, 400, "Date and serviceIds are required");
  }

  const dateStr = date as string;
  const dayOfWeek = getDayNameFromDateString(dateStr) as Day;

  const dayOff = await prisma.dayOff.findUnique({
    where: { date: parseDateString(dateStr) },
  });

  if (dayOff) {
    return sendResponse(
      res,
      200,
      "No slots available - shop is closed on this day",
      [],
    );
  }

  const schedule = await prisma.scheduleSetting.findUnique({
    where: { day: dayOfWeek },
  });

  if (!schedule || !schedule.isOpen) {
    return sendResponse(
      res,
      200,
      "No slots available - shop is closed on this day",
      [],
    );
  }

  const shopSettings = await prisma.shopSetting.findFirst();
  const slotInterval = shopSettings?.slotInterval || 30;

  const serviceIdsArray = (serviceIds as string).split(",");
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIdsArray }, isActive: true },
  });

  if (services.length === 0) {
    return sendError(res, 400, "No valid services found");
  }

  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);

  const existingBookings = await prisma.appointment.findMany({
    where: {
      appointmentDate: parseDateString(dateStr),
      status: { in: ["Confirmed", "Pending"] },
    },
  });

  const blockedSlots = await prisma.blockedSlot.findMany({
    where: { date: parseDateString(dateStr) },
  });

  const [startHour, startMin] = schedule.startTime.split(":").map(Number);
  const [endHour, endMin] = schedule.endTime.split(":").map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  const slots: string[] = [];

  for (
    let current = startMinutes;
    current + totalDuration <= endMinutes;
    current += slotInterval
  ) {
    const slotStartHour = Math.floor(current / 60);
    const slotStartMin = current % 60;
    const slotTime = `${String(slotStartHour).padStart(2, "0")}:${String(slotStartMin).padStart(2, "0")}`;

    const slotEndMinutes = current + totalDuration;

    const overlapsBooking = existingBookings.some((booking) => {
      const [bStartHour, bStartMin] = booking.startTime.split(":").map(Number);
      const [bEndHour, bEndMin] = booking.endTime.split(":").map(Number);
      const bStart = bStartHour * 60 + bStartMin;
      const bEnd = bEndHour * 60 + bEndMin;
      return current < bEnd && slotEndMinutes > bStart;
    });

    const overlapsBlocked = blockedSlots.some((slot) => {
      const [bsStartHour, bsStartMin] = slot.startTime.split(":").map(Number);
      const [bsEndHour, bsEndMin] = slot.endTime.split(":").map(Number);
      const bsStart = bsStartHour * 60 + bsStartMin;
      const bsEnd = bsEndHour * 60 + bsEndMin;
      return current < bsEnd && slotEndMinutes > bsStart;
    });

    if (!overlapsBooking && !overlapsBlocked) {
      slots.push(slotTime);
    }
  }

  return sendResponse(res, 200, "Available slots fetched", slots);
};
