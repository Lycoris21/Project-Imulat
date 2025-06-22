import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";

// Import routes
import records from "./routes/record.js";
import users from "./routes/users.js";
import usersWithUpload from "./routes/usersWithUpload.js";
import reports from "./routes/reports.js";

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

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// API Routes
app.use("/api/record", records);
app.use("/api/users", users);
app.use("/api/users-upload", usersWithUpload);
app.use("/api/reports", reports);
app.use("/api/auth", authRoutes);

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

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});
