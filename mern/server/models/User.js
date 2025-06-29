import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  passwordHash: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  birthdate: {
    type: Date,
    required: false
  },
  bio: {
    type: String,
    maxlength: 500,
    trim: true
  },
  profilePictureUrl: {
    type: String,
    trim: true,
  default:
    null,
    validate: {
      validator: function (v) {
        if (!v)
          return true;
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Profile picture must be a valid image URL (jpg, jpeg, png, gif, webp)'
    }
  },
  coverPhotoUrl: {
    type: String,
    trim: true,
  default:
    null,
    validate: {
      validator: function (v) {
        if (!v)
          return true;
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Cover photo must be a valid image URL (jpg, jpeg, png, gif, webp)'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'researcher'],
  default:
    'user'
  },

  // Password reset fields
  resetToken: {
    type: String,
  default:
    null
  },
  resetTokenExpiry: {
    type: Date,
  default:
    null
  },

  deletedAt: {
    type: Date,
  default:
    null
  }

}, {
  timestamps: true
});

// Create indexes for better query performance
// Note: unique: true in schema definition already creates indexes
// userSchema.index({ username: 1 });
// userSchema.index({ email: 1 });

// Virtual to get user's age from birthdate
userSchema.virtual('age').get(function () {
  if (this.birthdate) {
    return Math.floor((Date.now() - this.birthdate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }
  return null;
});

const User = mongoose.model('User', userSchema);

export default User;
