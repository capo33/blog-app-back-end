import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: [true, "Please enter your answer"]
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    interests: {
      type: Array,
      default: [],
    },
    about: {
      type: String,
      default: "",
    },
    blogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    birthday: {
      type: Date,
      default: "",
    },

  },

  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
