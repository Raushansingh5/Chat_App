import { Router } from "express";
import { signup,login,logout,updateProfile,checkAuth } from "../controllers/UserController.js";
import { authMiddleware } from "../middleware/auth.js";

const userRouter=Router();

userRouter.post('/signup',signup);
userRouter.post('/login',login);
userRouter.post('/logout',logout);
userRouter.put('/update-profile',authMiddleware,updateProfile);
userRouter.get('/check-auth',authMiddleware,checkAuth);

export default userRouter;