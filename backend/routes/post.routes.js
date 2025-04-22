import express from "express";
import { protectedRoutes } from "../middleware/protectedRoutes.js";
import { createPost, deletePost, commentOnPost, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts } from "../controllers/post.controllers.js";

const router = express.Router();

router.get("/", protectedRoutes, getAllPosts);
router.get("/following", protectedRoutes, getFollowingPosts)
router.get("/liked/:id", protectedRoutes, getLikedPosts)
router.get("/user/:username", protectedRoutes, getUserPosts)
router.post("/create", protectedRoutes, createPost);
router.post("/like/:id", protectedRoutes, likeUnlikePost);
router.post("/comment/:id", protectedRoutes, commentOnPost);
router.delete("/:id", protectedRoutes, deletePost);

export default router;