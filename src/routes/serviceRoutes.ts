import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
} from "../controllers/serviceController";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../validators/service";

const router = Router();

// Public routes (customer side will need these too)
router.get("/", getAllServices);
router.get("/:id", getServiceById);

// Protected admin routes
router.post("/", authenticate, validate(createServiceSchema), createService);
router.put("/:id", authenticate, validate(updateServiceSchema), updateService);
router.delete("/:id", authenticate, deleteService);
router.patch("/:id/toggle", authenticate, toggleServiceStatus);

export default router;
