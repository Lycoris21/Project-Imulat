import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import records from "./routes/record.js";
import users from "./routes/users.js";
import reports from "./routes/reports.js";

// Load environment variables
dotenv.config({ path: './config.env' });

const PORT = process.env.PORT || 5050;
const app = express();

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/record", records);
app.use("/users", users);
app.use("/reports", reports);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})
