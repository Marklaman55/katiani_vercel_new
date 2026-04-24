import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const configureCloudinary = (config) => {
  const cloud_name = config.cloud_name || process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = config.api_key || process.env.CLOUDINARY_API_KEY;
  const api_secret = config.api_secret || process.env.CLOUDINARY_API_SECRET;

  if (cloud_name && api_key && api_secret) {
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret
    });
    console.log('Cloudinary configured');
  }
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (!cloudinary.config().api_key) {
      throw new Error("Cloudinary is not configured. Please add CLOUDINARY_API_KEY to your environment variables.");
    }
    return {
      folder: "katiani-styles",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    };
  },
});

export const upload = multer({ storage });
export default cloudinary;
