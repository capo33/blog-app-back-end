import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    photo: {
      type: String,
      default:
        "https://t4.ftcdn.net/jpg/04/99/93/31/360_F_499933117_ZAUBfv3P1HEOsZDrnkbNCt4jc3AodArl.jpg",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    likes: {
      type: [String], // array of user ids who liked the post
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: Array,
      default: [],
    },
    slug: {
      type: String,
      lowercase: true,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", BlogSchema);

export default Blog;
