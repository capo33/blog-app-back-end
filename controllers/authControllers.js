import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";

import UserModel from "../models/User.js";
import BlogModel from "../models/Blog.js";

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  const { name, email, password, answer } = req.body;

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await UserModel.create({
      name,
      email,
      answer,
      password: hashedPassword,
    });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Take out password from response
    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      throw new Error("User does not exist");
    }

    // Check if password matches
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      throw new Error("Invalid credentials");
    }

    // Generate an auth token for the user
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Take out password from response
    const { password: _, ...userWithoutPassword } = existingUser._doc;

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const profile = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user)
      .populate("blogs")
      .select("-password");
    const blog = await BlogModel.findOne({ author: req.user?._id }).populate(
      "author",
      "-password"
    );
    user.blogs.push(blog);
    // req.user is set by the auth middleware
    if (!user) {
      throw new Error("User not found");
    }

    // get the token from the request header
    const token = req.headers.authorization.split(" ")[1];

    res.status(200).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    next(error); // This will be handled by the error handler middleware
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/update
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    // Check if user exists
    const user = await UserModel.findById(req.user?._id); // req.user?._id is set by the auth middleware

    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user?._id,
      { ...req.body },
      { new: true }
    );
    // Create token
    const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Take out password from response
    const { password: _, ...userWithoutPassword } = updatedUser._doc;

    res.status(200).send({
      success: true,
      message: "User updated successfully",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/v1/auth/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await UserModel.find({});
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/auth/user/:id
// @access  Private/Admin or User
const deleteUserByUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user._id);

    // Check if user exists with the given id
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is authorized to delete the user
    if (
      user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw new Error("You are not authorized to delete this user");
    }
    // Delete user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "Sad to see you go, user deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete users
// @route   DELETE /api/v1/auth/users/:id
// @access  Private/Admin
const deleteUserByAdmin = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    // Check if user exists
    if (!user) {
      throw new Error("User not found");
    }
    // Check if admin is authorized to delete the user
    if (req.user.role !== "admin") {
      throw new Error("You are not authorized to delete this user");
    }

    // Delete user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   GET /api/v1/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  const { email, answer, newPassword } = req.body;
  try {
    // Check if user exists
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Check if email is provided
    if (!email) {
      throw new Error("Email is required");
    }

    // Check if answer is provided
    if (!answer) {
      throw new Error("Answer is required");
    }

    // Check if the answer is matching
    if (existingUser.answer !== answer) {
      throw new Error("Answer is not matching");
    }

    // Check if new password is provided
    if (!newPassword) {
      throw new Error("New password is required");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    const user = await UserModel.findByIdAndUpdate(existingUser._id, {
      password: hashedPassword,
    });

    // // Create token
    // const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
    //   expiresIn: process.env.JWT_EXPIRES_IN,
    // });

    // // Take out password from response
    // const { password: _, ...userWithoutPassword } = updatedUser._doc;

    res.status(200).send({
      success: true,
      message: "Password updated successfully",
      user,
      // user: userWithoutPassword,
      // token,
    });
  } catch (error) {
    next(error);
  }
};

export {
  register,
  login,
  profile,
  updateProfile,
  getUsers,
  deleteUserByUser,
  deleteUserByAdmin,
  logout,
  forgotPassword,
};
