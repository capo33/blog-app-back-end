import jwt from "jsonwebtoken";

import UserModel from "../models/User.js";

// auth middleware
const authMiddleware = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from headers
      const token = req.headers.authorization.split(" ")[1];
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
       // Get user
      const user = await UserModel.findById(decoded.id);
       // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      let err = new Error(`Not authorized, token failed: ${error.message}`);
      err.status = 401;
      next(err);
    }
  } else {
    let err = new Error("Not authorized to access this route");
    err.status = 401;
    next(err);
  }
};

// admin middleware based on role
const adminMiddleware = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    let err = new Error("Not authorized as an admin");
    err.status = 401;
    next(err);
  }
};


export { authMiddleware, adminMiddleware };
