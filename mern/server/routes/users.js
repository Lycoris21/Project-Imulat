import express from "express";
import UserController from "../controllers/userController.js";
import { validateUser, validateUserUpdate, validateObjectId } from "../middleware/validation.js";

const router = express.Router();

// Get all users
router.get("/", UserController.getAllUsers);

// Get a single user by ID
router.get("/:id", validateObjectId, UserController.getUserById);

// Create a new user
router.post("/", validateUser, UserController.createUser);

// Update a user
router.patch("/:id", validateObjectId, validateUserUpdate, UserController.updateUser);

// Change user password
router.put("/change-password", UserController.changePassword);

// Delete a user
router.delete("/:id", validateObjectId, UserController.deleteUser);

export default router;
