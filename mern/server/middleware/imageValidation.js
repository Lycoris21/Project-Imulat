import { body } from 'express-validator';

// Enhanced image validation that accepts both URLs and file paths
export const validateImageUrl = (fieldName, displayName) => {
  return body(fieldName)
    .optional()
    .custom((value) => {
      if (!value) return true; // Optional field
      
      // Check if it's a valid URL
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      // Check if it's a valid uploaded file path
      const filePathPattern = /^uploads\/images\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      
      if (urlPattern.test(value) || filePathPattern.test(value)) {
        return true;
      }
      
      throw new Error(`${displayName} must be a valid image URL or uploaded file path (jpg, jpeg, png, gif, webp)`);
    });
};

// Middleware to process uploaded files and update req.body
export const processUploadedImages = (req, res, next) => {
  // If files were uploaded, update the URLs in req.body
  if (req.files) {
    if (req.files.profilePicture) {
      req.body.profilePictureUrl = req.files.profilePicture[0].path.replace(/\\/g, '/');
    }
    if (req.files.backgroundImage) {
      req.body.backgroundImageUrl = req.files.backgroundImage[0].path.replace(/\\/g, '/');
    }
  } else if (req.file) {
    // Single file upload
    if (req.file.fieldname === 'profilePicture') {
      req.body.profilePictureUrl = req.file.path.replace(/\\/g, '/');
    } else if (req.file.fieldname === 'backgroundImage') {
      req.body.backgroundImageUrl = req.file.path.replace(/\\/g, '/');
    }
  }
  
  next();
};
