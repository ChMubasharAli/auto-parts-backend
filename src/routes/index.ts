import { Router } from "express";
import authRoutes from "./authRoutes";
import serviceRoutes from "./serviceRoutes";
import bookingRoutes from "./bookingRoutes";
import scheduleRoutes from "./scheduleRoutes";
import settingsRoutes from "./settingsRoutes";
import dashboardRoutes from "./dashboardRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/services", serviceRoutes);
router.use("/bookings", bookingRoutes);
router.use("/schedule", scheduleRoutes);
router.use("/settings", settingsRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
