/* eslint-disable no-unused-vars */
import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formateTime } from "../lib/utils";
import { VideoIcon } from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    updateMessage,
    isMessagesLoading,
    selectedUser,
    isMessageSend,
    subscribeToMessage,
    unsubscribeFromMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessage();

    return () => {
      unsubscribeFromMessage();
    };
  }, [
    selectedUser._id,
    getMessages,
    unsubscribeFromMessage,
    subscribeToMessage,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isMessageSend]);

  const navigate = useNavigate();
  const handleJoinCall = async (message) => {
    if (message.type !== "video") return;
    try {
      navigate(`/video/${message.text}`);
      toast.success("Joining video call...");
    } catch (error) {
      toast.error("Failed to join video call:");
      console.error("Failed to join video call:", error);
    }
  };

  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    (message.senderId === authUser._id
                      ? authUser.profilePic
                      : selectedUser.profilePic) || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formateTime(message.createdAt)}
              </time>
            </div>
            {message.type !== "video" && message.type !== "endVideo" && (

                <div className="chat-bubble flex flex-col">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              
            )}

            {(message.type === "video" || message.type === "endVideo") && (
              <div className="chat-bubble flex flex-col">
              <div
                className={`flex items-center gap-2 text-md opacity-40 mt-1 border p-2 rounded-md border-primary cursor-pointer ${
                  message.type == "video" &&
                  "opacity-60 hover:opacity-80 transition"
                }`}
                onClick={() => handleJoinCall(message)}
              >
                <span className="text-primary">
                  {message.type == "video"
                    ? "Join Video Call"
                    : "Ended Video Call"}
                </span>
                <VideoIcon
                  size={30}
                  className="cursor-pointer text-primary"
                  // Replace with your function
                />
              </div>
            </div>
            )}
          </div>
        ))}

        {/* Skeleton */}
        {isMessageSend && (
          <div className={`chat chat-end`}>
            <div className="chat-image avatar">
              <div className="size-10 rounded-full">
                <div className="skeleton w-full h-full rounded-full" />
              </div>
            </div>

            <div className="chat-header mb-1">
              <div className="skeleton h-4 w-18" />
            </div>

            <div className="chat-bubble bg-transparent p-0">
              <div className="skeleton h-14 w-[250px]" />
            </div>
          </div>
        )}

        {/* Scroll to bottom ref */}
        <div ref={bottomRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
