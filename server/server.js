import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import connectDB from './libs/db.js';
import userRouter from './routes/user.js';
import messageRouter from './routes/message.js';
import {Server} from 'socket.io';
import cookieParser from "cookie-parser";

dotenv.config();

const app=express();

const server=http.createServer(app);

export const io=new Server(server,{
    cors:{
        origin: process.env.FRONTEND_URL,
    }
})

export const userSocketMap={};

io.on("connection",(socket)=>{
    const userId=socket.handshake.query.userId;
   // console.log("user connected",userId);

    if(userId){
        userSocketMap[userId]=socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("user disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
    
})


app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true,limit:'10mb' }));

app.use('/api/status',(req,res)=> res.send("API is running.."));
app.use('/api/auth',userRouter);
app.use('/api/messages',messageRouter);

await connectDB();

const PORT=process.env.PORT || 5000;
server.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
