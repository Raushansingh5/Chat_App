import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../libs/cloudinary.js";
import { io, userSocketMap } from "../server.js";

export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const users = await User.find({ _id: { $ne: userId } }).select("-password");

    const unseenMessagesCount = {};
    const promises = users.map(async (user) => {
      const messageCount = await Message.countDocuments({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      unseenMessagesCount[user._id] = messageCount;
    });

    await Promise.all(promises);
    res.json({ success: true, users, unseenMessagesCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    );

    res.status(200).json({ success: true, messages });
   
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markMessageAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params;
    await Message.findByIdAndUpdate(messageId, { seen: true });
    res.status(200).json({ success: true, message: "Message marked as seen" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;

    const receiverId = req.params.id;
   

    const senderId = req.user._id;
    let imageUrl = "";
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Message sent successfully",
        newMessage,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
