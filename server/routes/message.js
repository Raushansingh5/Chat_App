import { Router } from "express";
import { getMessages,getAllUsers,markMessageAsSeen, sendMessage } from "../controllers/MessageController.js";
import { authMiddleware } from "../middleware/auth.js";
const messageRouter=Router();


messageRouter.get('/users', authMiddleware, getAllUsers);
messageRouter.post('/send/:id', authMiddleware, sendMessage);
messageRouter.put('/mark/:messageId', authMiddleware, markMessageAsSeen);
messageRouter.get('/chat/:id', authMiddleware, getMessages);   




export default messageRouter;
