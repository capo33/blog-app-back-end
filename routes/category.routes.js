import express from "express";

import * as categoryController from "../controllers/categoryControllers.js";
import {
  adminMiddleware,
  authMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", categoryController.getCategories);

router.get("/:slug", categoryController.getCategory);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  categoryController.createCategory
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  categoryController.updateCategory
);

router.delete( 
  "/:id",
  authMiddleware,
  adminMiddleware,
  categoryController.deleteCategory
);

export default router;
