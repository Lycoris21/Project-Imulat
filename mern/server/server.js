import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import http from 'http';
import { Server } from 'socket.io';

// Import routes
import auth from "./routes/auth.js";
import claims from "./routes/claims.js";
import comments from "./routes/comments.js";
import notifications from "./routes/notifications.js";
import reactions from "./routes/reactions.js";
import reports from "./routes/reports.js";
import users from "./routes/users.js";
import usersWithUpload from "./routes/usersWithUpload.js";
import uploads from "./routes/uploads.js";


// Load environment variables
dotenv.config({ path: './config.env' });

const PORT = process.env.PORT || 5050;
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Or set to your frontend URL
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId); // user joins their personal room
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


// // Serve static files (uploaded images)
// app.use('/uploads', express.static('uploads'));

// API Routes
app.use("/api/auth", auth);
app.use("/api/claims", claims);
app.use("/api/comments", comments);
app.use("/api/notifications", notifications);
app.use("/api/reactions", reactions);
app.use("/api/reports", reports);
app.use('/api/uploads', uploads);
app.use("/api/users", users);
app.use("/api/users-upload", usersWithUpload);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});

export { io };
export default server;