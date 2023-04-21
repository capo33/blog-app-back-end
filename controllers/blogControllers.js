import mongoose from "mongoose";
import BlogModel from "../models/Blog.js";
import UserModel from "../models/User.js";
import slugify from "slugify";
import fs from "fs";

// @desc    Get all blogs
// @route   GET /api/v1/blogs
// @access  Public
const getBlogs = async (req, res, next) => {
  try {
    const blogs = await BlogModel.find({})
      .populate("author", "-password")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog
// @route   GET /api/v1/blogs/:id
// @access  Public
const getBlog = async (req, res, next) => {
  const { id } = req.params;
  try {
    const blog = await BlogModel.findById(id).populate("author", "-password");
    // Incriment views
    const views = blog.views + 1;

    // Check if blog exists
    if (!blog) {
      throw new Error("Blog not found");
    }

    // Update views
    await blog.updateOne({ views });
    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Featured blogs
// @route   GET /api/v1/blogs/featured
// @access  Public
const getFeaturedBlogs = async (req, res, next) => {
  try {
    const blogs = await BlogModel.find({ featured: true })
      .populate("author", "-password")
      .limit(3);

    res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create blog
// @route   POST /api/v1/blogs
// @access  Private
const createBlog = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error("You are not authenticated");
    }
    // check if user the photo is uploaded or not then add it as default image

    // Create blog
    const blog = await BlogModel.create({
      ...req.body,
      author: req.user,
    });

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blog
// @route   PUT /api/v1/blogs/:id
// @access  Private
const updateBlog = async (req, res, next) => {
  const { id } = req.params;
  try {
    const blog = await BlogModel.findById(id);

    // Check if blog exists
    if (!blog) {
      throw new Error("Blog not found");
    }

    // Check if user is authorized to update the blog
    if (
      blog?.author?.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw new Error("You are not authorized to update this blog");
    }

    // Update blog
    const updatedBlog = await BlogModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blog
// @route   DELETE /api/v1/blogs/:id
// @access  Private
const deleteBlog = async (req, res, next) => {
  const { id } = req.params;
  try {
    const blog = await BlogModel.findById(id);

    // check if user is authenticated
    if (!req.user) {
      throw new Error("You are not authenticated");
    }

    //  Check if user is authorized to delete the blog
    if (
      blog?.author?.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw new Error("You are not authorized to update this blog");
    }

    // Delete blog
    await BlogModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like blog
// @route   PUT /api/v1/blogs/like/:id
// @access  Private
const likeBlog = async (req, res, next) => {
  const { id } = req.params;
  try {
    // check if user is authenticated
    if (!req.user) {
      throw new Error("You are not authenticated");
    }

    // check if blog exists
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Blog not found");
    }
    const blog = await BlogModel.findById(id);

    // check if user has already liked the blog then unlike it
    const index = blog.likes.findIndex((id) => id === String(req.user._id));
    // if the user has not liked the blog, add user id to likes array
    if (index === -1) {
      // blog.likes.splice(index, 1);
      // blog.likes.pull(req.user._id);
      blog.likes.push(req.user._id);
    } else {
      // if the user has liked the blog, remove user id from likes array
      blog.likes = blog.likes.filter(
        (like) => like !== String(req.user._id) // String() is used to convert the object id to string
      );
    }

    // await blog.save();
    const updatedLikeBlog = await BlogModel.findByIdAndUpdate(id, blog, {
      new: true,
    });

    res.status(200).json(updatedLikeBlog);
  } catch (error) {
    next(error);
  }
};

// @desc    Get blogs by tag
// @route   GET /api/v1/blogs/tag/:tag
// @access  Public
const getBlogsByTag = async (req, res, next) => {
  const { tag } = req.params;

  try {
    // $in is a mongoDB operator that searches for all occurences of the tag in the tags array
    const blogs = await BlogModel.find({ tags: { $in: tag } }).populate(
      "author",
      "-password"
    );

    res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related blogs
// @route   GET /api/v1/blogs/related
// @access  Public
const getRelatedBlogs = async (req, res, next) => {
  const tags = req.body;

  try {
    // $in is a mongoDB operator that searches for all occurences of the tag in the tags array
    const blogs = await BlogModel.find({ tags: { $in: tags } }).populate(
      "author",
      "-password"
    );

    res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get blogs by search query
// @route   GET /api/v1/blogs/search
// @access  Public
const searchBlogs = async (req, res, next) => {
  const { query } = req.query;
  try {
    const title = new RegExp(query, "i"); // i is for case insensitive search and g is for global search (searches for all occurences of the query)
    const blogs = await BlogModel.find({ title }).populate(
      "author",
      "-password"
    );

    // const blogs = await BlogModel.find({
    //   $text: { $search: query },
    // }).populate("author", "-password");

    res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getBlogs,
  getBlog,
  getFeaturedBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  getBlogsByTag,
  getRelatedBlogs,
  searchBlogs,
};
