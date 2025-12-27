import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "/context/AuthContext";
import { ChatContext } from "/context/ChatContext";

const RightSideBar = () => {
  const { axios, logout, onlineUsers } = useContext(AuthContext);
  const { selectedUser } = useContext(ChatContext);

  const [mediaMessages, setMediaMessages] = useState([]);

  /* Fetch media messages */
  useEffect(() => {
    if (!selectedUser) return;
    const fetchMedia = async () => {
      try {
        const { data } = await axios.get(
          `/api/messages/${selectedUser._id}`
        );

        if (data.success) {
          const imagesOnly = data.messages
            .filter(Boolean)
            .filter((msg) => msg.image);

          setMediaMessages(imagesOnly);
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchMedia();
  }, [selectedUser, axios]);

  //  No selected use → hide sidebar
  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  const openImage = (imageUrl) => {
    window.open(imageUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-[#8185B2]/10 text-white w-[320px] relative overflow-y-scroll max-md:hidden">
      {/* User Info */}
      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt="user"
          className="w-20 aspect-square rounded-full"
        />

        <h1 className="text-xl font-medium flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          ></span>
          {selectedUser.userName}
        </h1>

        <p className="px-10 text-center text-gray-300">
          {selectedUser.bio || "No bio available"}
        </p>
      </div>

      {/* Media Section */}
      <div className="mt-8 px-4">
        <h2 className="text-sm font-medium text-gray-300 mb-3">
          Media
        </h2>

        {mediaMessages.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {mediaMessages.map((msg) => (
              <img
                key={msg._id}
                src={msg.image}
                alt="media"
                onClick={() => openImage(msg.image)}
                className="w-full aspect-square object-cover rounded-md cursor-pointer hover:opacity-80 transition"
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            No media shared yet
          </p>
        )}
      </div>

      {/* Logout */}
      <div className="flex justify-center mt-6">
        <button
          onClick={logout}
          className="px-6 py-2 rounded-full bg-red-500/80 hover:bg-red-600 text-sm font-medium transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default RightSideBar;
