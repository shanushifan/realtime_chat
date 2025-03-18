import mongoose from "mongoose";



const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
  message: { type: String, required: true },
  time: { type: Number },
  delivered: { type: Boolean, default: false }
});

const MessageModel = mongoose.model("Message", MessageSchema);

export default MessageModel;
