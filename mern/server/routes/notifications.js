// routes/notificationRoutes.js
import express from "express";
import NotificationController from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", NotificationController.create);
router.get("/:userId", NotificationController.getByUser);
router.patch("/read/:id", NotificationController.markRead);
router.patch("/read-all/:userId", NotificationController.markAllRead);

export default router;