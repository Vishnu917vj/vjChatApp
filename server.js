// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const http = require('http');
const socketIo = require("socket.io");

dotenv.config();

// Connect to the database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

// Middleware to parse JSON bodies
app.use(express.json());

// Use the user routes for /api/users endpoint
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

// Root route to check if the server is running
app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

// Socket.io setup
io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(`User ${userData._id} connected`);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat.users) return;

    chat.users.forEach((user) => {
      if (user._id !== newMessageReceived.sender._id) {
        socket.in(user._id).emit("message received", newMessageReceived);
        console.log("Message received:", newMessageReceived);
      }
    });
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
    console.log("User is typing", room);
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
    console.log("User stopped typing", room);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});


// Start server and listen on specified port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
