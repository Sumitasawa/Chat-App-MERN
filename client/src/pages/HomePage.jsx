import React, { useContext } from "react";
import SideBar from "../components/SideBar";
import ChatContainer from "../components/ChatContainer";
import RightSideBar from "../components/RightSideBar";
import { ChatContext } from "../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`backdrop-blur-xl border border-gray-600 rounded-2xl 
        overflow-hidden h-full grid transition-all duration-300
        ${
          selectedUser
            ? "grid-cols-[280px_1fr_320px]"
            : "grid-cols-[280px_1fr]"
        }`}
      >
        <SideBar />
        <ChatContainer />
        {selectedUser && <RightSideBar />}
      </div>
    </div>
  );
};

export default HomePage;
