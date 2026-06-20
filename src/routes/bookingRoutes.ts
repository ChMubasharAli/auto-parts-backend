import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getAllBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  updateBookingStatus,
} from "../controllers/bookingController";
import {
  createBookingSchema,
  cancelBookingSchema,
  updateBookingStatusSchema,
} from "../validators/booking";

const router = Router();

// Public routes (customer)
router.post("/", validate(createBookingSchema), createBooking);

// Protected admin routes
router.get("/", authenticate, getAllBookings);
router.get("/:id", authenticate, getBookingById);
router.patch(
  "/:id/status",
  authenticate,
  validate(updateBookingStatusSchema),
  updateBookingStatus,
);
router.post(
  "/:id/cancel",
  authenticate,
  validate(cancelBookingSchema),
  cancelBooking,
);

export default router;
