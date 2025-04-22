import express from "express";

import { protectedRoutes } from "../middleware/protectedRoutes.js";
import { deleteNotification, deleteNotifications, getNotifications } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectedRoutes, getNotifications);
router.delete("/", protectedRoutes, deleteNotifications);
router.delete("/:id", protectedRoutes, deleteNotification);

export default router;