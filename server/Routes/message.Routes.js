import express from "express"
import { protectRoute } from "../middleware/auth.Middleware.js";
import { getAllMsgForUser, getAllUsers, markMessageAsSeen, sendMessage } from "../controllers/message.Conroller.js";

const messageRouter=express.Router();

messageRouter.get('/users',protectRoute,getAllUsers);
messageRouter.get('/:id',protectRoute,getAllMsgForUser);
messageRouter.put('/mark/:id',protectRoute,markMessageAsSeen);
messageRouter.post('/send/:id',protectRoute,sendMessage);
export default messageRouter;