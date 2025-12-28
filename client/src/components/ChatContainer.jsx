import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utilis";
import { AuthContext } from "@/context/AuthContext";
import { ChatContext } from '@/context/ChatContext.jsx'

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    getMessages,
    sendMessage,
  } = useContext(ChatContext );

  const { authUser } = useContext(AuthContext);

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const scrollEnd = useRef(null);

  /* Load messages */
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  /* Auto scroll */
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full">
        <img src={assets.logo_icon} className="max-w-16" alt="logo" />
        <p className="text-lg font-medium text-white">
          Chat anytime, anywhere
        </p>
      </div>
    );
  }

  const handleSend = async () => {
    if (!text && !image) return;

    let imageBase64;
    if (image) {
      imageBase64 = await toBase64(image);
    }

    await sendMessage({ text, image: imageBase64 });

    setText("");
    setImage(null);
  };

  return (
    <div className="h-full overflow-hidden relative backdrop-blur-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt="user"
          className="w-8 rounded-full"
        />

        <p className="flex-1 text-lg text-white">
          {selectedUser.userName}
        </p>

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="back"
          className="md:hidden max-w-7 cursor-pointer"
        />
      </div>

      {/* Messages */}
      <div className="flex flex-col flex-1 overflow-y-scroll p-3 pb-20">
        {messages
          .filter(Boolean)
          .map((msg) => {
            const senderId =
              msg?.senderId && typeof msg.senderId === "object"
                ? msg.senderId._id
                : msg?.senderId;

            const isMe = senderId === authUser?._id;

            return (
              <div
                key={msg._id}
                className={`flex items-end gap-2 mb-4 ${
                  isMe ? "justify-end" : "flex-row-reverse justify-end"
                }`}
              >
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="sent"
                    className="max-w-[230px] border border-gray-700 rounded-lg"
                  />
                ) : (
                  <p
                    className={`p-2 max-w-[200px] md:text-sm font-light break-words text-white
                      ${
                        isMe
                          ? "bg-violet-500/30 rounded-lg rounded-br-none"
                          : "bg-gray-500/30 rounded-lg rounded-bl-none"
                      }`}
                  >
                    {msg.text}
                  </p>
                )}

                <div className="text-center text-xs">
                  <img
                    src={
                      isMe
                        ? authUser.profilePic || assets.avatar_icon
                        : selectedUser.profilePic || assets.avatar_icon
                    }
                    alt="avatar"
                    className="w-7 rounded-full mx-auto"
                  />
                  <p className="text-gray-500">
                    {formatMessageTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        <div ref={scrollEnd} />
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            className="flex-1 text-sm p-3 pr-10 border-none outline-none text-white placeholder-gray-400 bg-transparent"
            type="text"
            placeholder="Send a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <input
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
            onChange={(e) => setImage(e.target.files[0])}
          />

          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="gallery"
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>

        <img
          src={assets.send_button}
          alt="send"
          className="w-7 cursor-pointer"
          onClick={handleSend}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
