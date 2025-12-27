import React, { useContext, useEffect } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "/context/AuthContext";
import { ChatContext  } from '/context/chatContext.jsx'
const SideBar = () => {
  const navigate = useNavigate();

  const { onlineUsers, logout } = useContext(AuthContext);
  const {
    users,
    unseenMessages,
    selectedUser,
    setSelectedUser,
    getUsers,
  } = useContext(ChatContext );

  /* Load users once */
  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* Header */}
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />

          {/* Menu */}
          <div className="relative py-2 group">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
            />
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
              <p
                className="cursor-pointer text-sm"
                onClick={() => navigate("/profile")}
              >
                Edit Profile
              </p>
              <hr className="my-2 border-t border-gray-500" />
              <p
                className="cursor-pointer text-sm text-red-400"
                onClick={logout}
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Search (UI only) */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-2 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            type="text"
            placeholder="Search User..."
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex flex-col">
        {users.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const unseenCount = unseenMessages[user._id] || 0;

          return (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center gap-3 p-2 pl-4 rounded cursor-pointer max-sm:text-sm
                ${
                  selectedUser?._id === user._id
                    ? "bg-[#282142]/50"
                    : ""
                }`}
            >
              {/* Avatar */}
              <img
                src={user.profilePic || assets.avatar_icon}
                alt={user.userName}
                className="w-[35px] aspect-square rounded-full"
              />

              {/* Name & Status */}
              <div className="flex flex-col leading-5">
                <p className="font-medium">{user.userName}</p>
                <span
                  className={`text-xs ${
                    isOnline ? "text-green-400" : "text-neutral-400"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>

              {/* Unseen Messages */}
              {unseenCount > 0 && (
                <span className="ml-auto bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  {unseenCount}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SideBar;
