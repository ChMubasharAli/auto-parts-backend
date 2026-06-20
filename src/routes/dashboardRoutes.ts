import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getDashboardStats,
  getRecentBookings,
} from "../controllers/dashboardController";

const router = Router();

router.get("/stats", authenticate, getDashboardStats);
router.get("/recent-bookings", authenticate, getRecentBookings);

export default router;
