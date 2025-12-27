import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { socket, axios, authUser } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  /* USERS  */
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMsg || {});
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /*  MESSAGE */
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /*SEND MESSAGE  */
  const sendMessage = async (messageData) => {
    if (!selectedUser) return;

    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      //  SENDER UI UPDATE (NO SOCKET)
      if (data.success && data.newMessage) {
        setMessages((prev) => [...prev, data.newMessage]);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* SOCKET*/
  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", async (newMessage) => {
      if (!newMessage || !newMessage.senderId) return;

      const senderId =
        typeof newMessage.senderId === "object"
          ? newMessage.senderId._id
          : newMessage.senderId;

      // Chat open → show message
      if (selectedUser && senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);

        // mark as seen
        try {
          await axios.put(`/api/messages/mark/${newMessage._id}`);
        } catch {}
      } else {
        // Chat closed → increase unseen count
        setUnseenMessages((prev) => ({
          ...prev,
          [senderId]: prev[senderId] ? prev[senderId] + 1 : 1,
        }));
      }
    });

    return () => socket.off("newMessage");
  }, [socket, selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        users,
        messages,
        selectedUser,
        unseenMessages,
        setSelectedUser,
        getUsers,
        getMessages,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
