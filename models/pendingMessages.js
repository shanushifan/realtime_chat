import mongoose from "mongoose";

const PendingMessageSchema = new mongoose.Schema({
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }]
});

export default mongoose.model("PendingMessage", PendingMessageSchema);
