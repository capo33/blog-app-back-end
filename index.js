import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import cors from "cors";
import fs from "fs";

import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import BlogModel from "./models/Blog.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import upload from "./middlewares/uploadMiddleware.js";

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Init express
const app = express();

// Port
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
// get the path of the uploads folder
app.use("/uploads", express.static("uploads"));

// File upload
app.post("/upload", upload.single("image"), (req, res) => {
  res.status(200).json({
    message: "File uploaded successfully",
  });
});

// Welcome route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/categories", categoryRoutes);

// Error handler middleware
app.use(notFound);
app.use(errorHandler);

// Serve static assets in production
// if (process.env.NODE_ENV === "production") {
//   // Set static folder
//   app.use(express.static("frontend/build"));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
//   });
// }

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
