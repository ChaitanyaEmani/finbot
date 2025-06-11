// ✅ userModel.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  sender: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  chatData: { type: [chatSchema], default: [] },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
