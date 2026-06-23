import { Request, Response } from "express";
import prisma from "../config/database";
import { sendResponse, sendError } from "../utils/response";

export const getAllServices = async (req: Request, res: Response) => {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
  });

  return sendResponse(res, 200, "Services fetched", services);
};

export const getServiceById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return sendError(res, 400, "Invalid ID format provided");
  }

  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    return sendError(res, 404, "Service not found");
  }

  return sendResponse(res, 200, "Service fetched", service);
};

export const createService = async (req: Request, res: Response) => {
  const { name, description, duration, price, isActive } = req.body;

  const service = await prisma.service.create({
    data: {
      name,
      description: description || null,
      duration,
      price: price || null,
      isActive: isActive ?? true,
    },
  });

  return sendResponse(res, 201, "Service created", service);
};

export const updateService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, duration, price, isActive } = req.body;

  if (!id || typeof id !== "string") {
    return sendError(res, 400, "Invalid ID format provided");
  }

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description: description || null }),
      ...(duration !== undefined && { duration }),
      ...(price !== undefined && { price: price || null }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return sendResponse(res, 200, "Service updated", service);
};

export const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return sendError(res, 400, "Invalid ID format provided");
  }

  await prisma.service.delete({
    where: { id },
  });

  return sendResponse(res, 200, "Service deleted");
};

export const toggleServiceStatus = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return sendError(res, 400, "Invalid ID format provided");
  }

  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    return sendError(res, 404, "Service not found");
  }

  const updated = await prisma.service.update({
    where: { id },
    data: { isActive: !service.isActive },
  });

  return sendResponse(
    res,
    200,
    `Service ${updated.isActive ? "enabled" : "disabled"}`,
    updated,
  );
};
