import express from "express";
import multer from "multer";

import * as blogController from "../controllers/blogControllers.js";
import {
  adminMiddleware,
  authMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", blogController.getBlogs);

router.get("/featured", blogController.getFeaturedBlogs);

router.get("/:id", blogController.getBlog);

router.get("/tag/:tag", blogController.getBlogsByTag);

router.get("/related", blogController.getRelatedBlogs);

router.get("/search", blogController.searchBlogs);

router.post("/", authMiddleware, blogController.createBlog);

router.put("/:id", authMiddleware, blogController.updateBlog);

router.patch("/like/:id", authMiddleware, blogController.likeBlog);

router.delete("/:id", authMiddleware, blogController.deleteBlog);

export default router;
