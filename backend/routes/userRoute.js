import { loginUser, registerUser,logoutUser } from "../controllers/userController.js";
import express from "express";

const userRouter = express.Router();


userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout",logoutUser)

export default userRouter;

