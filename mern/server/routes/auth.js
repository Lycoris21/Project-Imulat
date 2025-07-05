import express from "express";
import {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import { validateUser } from "../middleware/validation.js"; // or your actual path

const router = express.Router();

router.post("/login", loginUser);
router.post("/signup", validateUser, registerUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
