import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiveSocketIds, io } from "../lib/socket.js";
import { set } from "mongoose";


export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUserForSidebar controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  const { text, image,type } = req.body;
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    if(image){
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image:imageUrl,
        type:type || "text",
    });

    await newMessage.save();

    const receiverSocketIds = getReceiveSocketIds(receiverId);
    receiverSocketIds.forEach((socketId) => {
      io.to(socketId).emit("newMessage", newMessage);
    });
    // if(receiverSocketIds) {
    //   io.to(receiverSocketIds).emit("newMessage", newMessage);
    // }
    const senderSocketIds = getReceiveSocketIds(senderId);
    senderSocketIds.forEach((socketId) => {
      io.to(socketId).emit("newMessage", newMessage);
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const updateMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const updatedData = req.body;

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      updatedData,
      { new: true }
    );
    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }
    const receiverSocketIds = getReceiveSocketIds(updatedMessage.receiverId);
    receiverSocketIds.forEach((socketId) => {
      io.to(socketId).emit("messageUpdated", updatedMessage);
    });
    const senderSocketIds = getReceiveSocketIds(updatedMessage.senderId);
    senderSocketIds.forEach((socketId) => {
      io.to(socketId).emit("messageUpdated", updatedMessage);
    });
    res.status(200).json(updatedMessage);
  }
  catch (error) {
    console.log("Error in updateMessage controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
