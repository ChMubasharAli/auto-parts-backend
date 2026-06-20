import { Request, Response } from "express";
import prisma from "../config/database";
import { sendResponse, sendError } from "../utils/response";

export const getShopSettings = async (req: Request, res: Response) => {
  const settings = await prisma.shopSetting.findFirst();

  if (!settings) {
    return sendError(res, 404, "Shop settings not found");
  }

  return sendResponse(res, 200, "Shop settings fetched", settings);
};

export const updateShopSettings = async (req: Request, res: Response) => {
  const { shopStatus, maintenanceMessage } = req.body;

  const settings = await prisma.shopSetting.findFirst();

  if (!settings) {
    return sendError(res, 404, "Shop settings not found");
  }

  const updated = await prisma.shopSetting.update({
    where: { id: settings.id },
    data: {
      ...(shopStatus !== undefined && { shopStatus }),
      ...(maintenanceMessage !== undefined && { maintenanceMessage }),
    },
  });

  return sendResponse(res, 200, "Shop settings updated", updated);
};
