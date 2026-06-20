import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getSchedule,
  updateSchedule,
  getBlockedSlots,
  createBlockedSlot,
  deleteBlockedSlot,
  getDayOffs,
  createDayOff,
  deleteDayOff,
  updateSlotInterval,
  getAvailableSlots,
} from "../controllers/scheduleController";
import {
  updateScheduleSchema,
  createBlockedSlotSchema,
  createDayOffSchema,
  updateSlotIntervalSchema,
} from "../validators/schedule";

const router = Router();

// Public routes (customer side needs these)
router.get("/", getSchedule);
router.get("/blocked-slots", getBlockedSlots);
router.get("/day-offs", getDayOffs);
router.get("/available-slots", getAvailableSlots);

// Protected admin routes
router.put(
  "/:day",
  authenticate,
  validate(updateScheduleSchema),
  updateSchedule,
);
router.post(
  "/blocked-slots",
  authenticate,
  validate(createBlockedSlotSchema),
  createBlockedSlot,
);
router.delete("/blocked-slots/:id", authenticate, deleteBlockedSlot);
router.post(
  "/day-offs",
  authenticate,
  validate(createDayOffSchema),
  createDayOff,
);
router.delete("/day-offs/:id", authenticate, deleteDayOff);
router.put(
  "/slot-interval",
  authenticate,
  validate(updateSlotIntervalSchema),
  updateSlotInterval,
);

export default router;
