import fs from "fs";
import slugify from "slugify"; // slugify is a function that converts a string into a slug (a string that can be used in a URL)

import CategoryModel from "../models/Category.js";

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await CategoryModel.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/v1/categories/:slug
// @access  Public
const getCategory = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const category = await CategoryModel.findOne({ slug });

    if (!category) {
      throw new Error("Category not found");
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  const { name } = req.body;
  try {
    // Check if category already exists
    const exisringCategoty = await CategoryModel.findOne({ name });

    if (exisringCategoty) {
      throw new Error("Category already exists");
    }

    // Create category
    const category = new CategoryModel({
      name,
      slug: slugify(name),
    });

    await category.save();
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/v1/categories/:slug
// @access  Private/Admin

const updateCategory = async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;
  try {
    const updartedCategory = await CategoryModel.findByIdAndUpdate(
      id,
      {
        name,
        slug: slugify(name),
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updartedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  const { id } = req.params;
  console.log('id',id);
  try {
    const deletedCat = await CategoryModel.findOne({ _id: id });

    if (!deletedCat) {
      throw new Error("Category not found");
    }

    await deletedCat.deleteOne();
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      category: deletedCat,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
