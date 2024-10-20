import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express(); // Initialize the Express app
const server = http.createServer(app); // Create an HTTP server from the Express app

// Initialize Socket.IO server with CORS options
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"], // Allow requests from the specified origin
        methods: ["GET", "POST"], // Specify allowed HTTP methods
        credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    },
});

const userSocketMap = {}; // To map user IDs to their respective socket IDs

// Function to get the receiver's socket ID
export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

// Socket.IO connection event
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    const userId = socket.handshake.query.userId; // Get userId from handshake query
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id; // Map userId to socket ID
    }

    // Emit the list of online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Listen for disconnect event
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete userSocketMap[userId]; // Remove userId from map
        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Update online users list
    });
});

// Export app and server for use in server.js
export { app, io, server };
