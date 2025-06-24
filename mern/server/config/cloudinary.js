import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'general-uploads'; // default fallback

    if (req.originalUrl.includes('profile-picture')) {
      folder = 'pfps';
    } else if (req.originalUrl.includes('report-cover')) {
      folder = 'report-covers';
    } else if (req.originalUrl.includes('cover-photo')) {
      folder = 'cover-photos';
    }

    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    };
  }
});

export { cloudinary, storage };
