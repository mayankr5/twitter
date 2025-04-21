import express from "express";
import { protectedRoutes } from "../middleware/protectedRoutes.js";
import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectedRoutes, getUserProfile)
router.get("/suggest-users", protectedRoutes, getSuggestedUsers)
router.post("/follow/:id", protectedRoutes, followUnfollowUser)
router.post("/update", protectedRoutes, updateUser)

export default router;