import { v2 as cloudinary } from 'cloudinary';
import cloudinaryStorage from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = cloudinaryStorage({
  cloudinary,
});

const parser = multer({ storage, limits: { fileSize: 3000000 } });

export { parser }