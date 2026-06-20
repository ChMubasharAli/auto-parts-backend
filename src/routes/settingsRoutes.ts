import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getShopSettings,
  updateShopSettings,
} from "../controllers/settingsController";
import { updateShopStatusSchema } from "../validators/settings";

const router = Router();

// Public route
router.get("/", getShopSettings);

// Protected admin route
router.put(
  "/",
  authenticate,
  validate(updateShopStatusSchema),
  updateShopSettings,
);

export default router;
