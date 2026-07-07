
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from './env.js';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// Create upload directories if not exist
// ============================================
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// ============================================
// Storage Configuration
// ============================================
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
 
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const isValidType = allowedTypes.test(file.mimetype);
  const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (isValidType && isValidExt) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg)'), false);
  }
};
 
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB default
  }
});

// ============================================
// Single File Upload Middleware
// ============================================
export const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// ============================================
// Multiple Files Upload Middleware
// ============================================
export const uploadMultiple = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

// ============================================
// Multiple Fields Upload Middleware
// ============================================
export const uploadFields = (fields) => {
  return upload.fields(fields);
};

// ============================================
// Error Handler for Multer
// ============================================
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum size is ${env.MAX_FILE_SIZE / (1024 * 1024)}MB.`
      });
    }
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum size is ${env.MAX_FILE_SIZE / (1024 * 1024)}MB.`
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Unexpected file field. Expected: ${err.field}`
      });
    }
    
    if (err.code === 'LIMIT_FIELD_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  // Other errors
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};


export const deleteUploadedFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};


export const getFileUrl = (req, filename, folder = '') => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const uploadPath = folder ? `${folder}/${filename}` : filename;
  return `${baseUrl}/uploads/${uploadPath}`;
};

export default {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleMulterError,
  deleteUploadedFile,
  getFileUrl
};