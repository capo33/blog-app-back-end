import express from "express";
import multer from "multer";

import * as authController from "../controllers/authControllers.js";
import {
  adminMiddleware,
  authMiddleware,
} from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
const uploadMiddleware = multer({ dest: "uploads/" });

const router = express.Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);

router.get("/profile", authMiddleware, authController.profile);

 
router.get("/users", authMiddleware, adminMiddleware, authController.getUsers);

router.get("/logout", authMiddleware, authController.logout);

router.put("/update-profile", authMiddleware, authController.updateProfile);
// router.put("/update-profile", authMiddleware, upload.single("avatar"), authController.updateProfile);
// router.put("/update-profile", authMiddleware, uploadMiddleware.single("avatar"), authController.updateProfile);

router.delete("/user", authMiddleware, authController.deleteUserByUser);

router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  authController.deleteUserByAdmin
);
export default router;
