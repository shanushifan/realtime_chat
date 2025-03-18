import ConversationModel from "../models/Converstion.js";
import MessageModel from "../models/Messages.js";
import PendingMessageModel from "../models/pendingMessages.js";
import UserModel from "../models/Auth.js"; // Assuming you have a User model
export const SendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: "Sender ID, Receiver ID, and Message are required.",
      });
    }

    // Save the message
    const newMessage = await new MessageModel({
      senderId,
      receiverId,
      message,
      delivered: false, // Initially set to false
    }).save();

    // Find or create conversation
    const conversation = await ConversationModel.findOneAndUpdate(
      { members: { $all: [senderId, receiverId] } },
      { $push: { messages: newMessage._id } },
      { new: true, upsert: true }
    );

    // Check if receiver is online
    const receiver = await UserModel.findById(receiverId);
    if (!receiver?.isOnline) {
      await PendingMessageModel.findOneAndUpdate(
        { receiverId },
        { $push: { messages: newMessage._id } },
        { new: true, upsert: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: { newMessage, conversation },
    });
  } catch (error) {
    console.error("Message error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again.",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "Sender ID and Receiver ID are required.",
      });
    }

    // Fetch conversation messages
    const conversation = await ConversationModel.findOne({
      members: { $all: [senderId, receiverId] }
    }).populate("messages").lean();

    // Fetch pending messages
    const pendingMessages = await PendingMessageModel.findOne({ receiverId }).populate("messages").lean();

    // Combine all messages
    let messages = [...(conversation?.messages || []), ...(pendingMessages?.messages || [])];

    // Get all messages that were not delivered and mark them as delivered
    const undeliveredMessageIds = messages
      .filter(msg => !msg.delivered)
      .map(msg => msg._id);

    if (undeliveredMessageIds.length > 0) {
      await MessageModel.updateMany(
        { _id: { $in: undeliveredMessageIds } },
        { $set: { delivered: true } }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve messages. Please try again.",
    });
  }
};
