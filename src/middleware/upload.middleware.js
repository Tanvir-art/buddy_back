
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';

// Create upload directories
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = env.UPLOAD_DIR || 'uploads/';
    
    if (req.originalUrl && req.originalUrl.includes('/posts')) {
      uploadPath = path.join(uploadPath, 'posts');
    } else if (req.originalUrl && (req.originalUrl.includes('/users') || req.originalUrl.includes('/profile-image'))) {
      uploadPath = path.join(uploadPath, 'profiles');
    } else {
      uploadPath = path.join(uploadPath, 'temp');
    }
    
    createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter - Only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const isValidType = allowedTypes.test(file.mimetype);
  const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (isValidType && isValidExt) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

// Multer upload instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE || 5 * 1024 * 1024,
  }
});

// Single file upload middleware
export const uploadSingle = (fieldName) => upload.single(fieldName);

// Multiple files upload middleware
export const uploadMultiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);


export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({ 
        success: false,
        message: 'File too large. Max size 5MB.' 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        success: false,
        message: 'Unexpected file field. Please check the field name.' 
      });
    }
    return res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
  if (err) {
    return res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
  next();
};

export default { upload, uploadSingle, uploadMultiple, handleMulterError };