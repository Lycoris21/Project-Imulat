import express from "express";
import UserController from "../controllers/userController.js";
import { validateUser, validateUserUpdate, validateObjectId } from "../middleware/validation.js";
import { uploadUserImages, handleUploadError } from "../middleware/upload.js";
import { processUploadedImages, validateImageUrl } from "../middleware/imageValidation.js";

const router = express.Router();

// Get all users
router.get("/", UserController.getAllUsers);

// Get a single user by ID
router.get("/:id", validateObjectId, UserController.getUserById);

// Create a new user (JSON only)
router.post("/", validateUser, UserController.createUser);

// Create a new user with file uploads
router.post("/with-images", 
  uploadUserImages,
  handleUploadError,
  processUploadedImages,
  [
    ...validateUser.slice(0, -1), // All validations except handleValidationErrors
    validateImageUrl('profilePictureUrl', 'Profile picture'),
    validateImageUrl('backgroundImageUrl', 'Background image'),
    validateUser[validateUser.length - 1] // handleValidationErrors
  ],
  UserController.createUser
);

// Update a user (JSON only)
router.patch("/:id", validateObjectId, validateUserUpdate, UserController.updateUser);

// Update a user with file uploads
router.patch("/:id/with-images", 
  validateObjectId,
  uploadUserImages,
  handleUploadError,
  processUploadedImages,
  [
    ...validateUserUpdate.slice(0, -1), // All validations except handleValidationErrors
    validateImageUrl('profilePictureUrl', 'Profile picture'),
    validateImageUrl('backgroundImageUrl', 'Background image'),
    validateUserUpdate[validateUserUpdate.length - 1] // handleValidationErrors
  ],
  UserController.updateUser
);

// Delete a user
router.delete("/:id", validateObjectId, UserController.deleteUser);

export default router;
