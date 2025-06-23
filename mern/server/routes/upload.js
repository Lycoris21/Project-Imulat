import express from 'express';
import { storage } from '../config/cloudinary.js';
import multer from 'multer';
import { User } from '../models/index.js';

const router = express.Router();

const upload = multer({ storage });

// Route to handle profile picture upload
router.put('/profile-picture/:userId', upload.single('image'), async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const imageUrl = req.file.path;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePictureUrl: imageUrl }, // This should match your schema field name
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error("Error during upload:", error);
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
});

export default router;