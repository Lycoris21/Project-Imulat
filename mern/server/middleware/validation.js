import { body, param, validationResult } from 'express-validator';

// Validation middleware to check for errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUser = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('profilePictureUrl')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL'),
  body('coverPhotoUrl')
    .optional()
    .isURL()
    .withMessage('Background image must be a valid URL'),
  handleValidationErrors
];

// User update validation (password not required)
export const validateUserUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('profilePictureUrl')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL'),
  body('coverPhotoUrl')
    .optional()
    .isURL()
    .withMessage('Background image must be a valid URL'),
  handleValidationErrors
];

// Report validation rules
export const validateReport = [
  body('userId')
    .isMongoId()
    .withMessage('Please provide a valid user ID'),
  body('reportTitle')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Report title is required and must not exceed 200 characters'),
  body('reportContent')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Report content is required'),
  body('truthVerdict')
    .isIn(['true', 'false', 'partially_true', 'misleading', 'unverified', 'disputed'])
    .withMessage('Please provide a valid truth verdict'),
  body('reportConclusion')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Report conclusion is required'),
  body('claimIds')
    .optional()
    .isArray()
    .withMessage('Claim IDs must be an array'),
  body('claimIds.*')
    .optional()
    .isMongoId()
    .withMessage('Each claim ID must be a valid MongoDB ObjectId'),
  handleValidationErrors
];

// ID parameter validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid ID'),
  handleValidationErrors
];
