import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Create upload directories if they don't exist
const createDirectories = () => {
  const baseDir = path.join(__dirname, '../../../uploads');
  const loansDir = path.join(baseDir, 'loans');
  const documentsDir = path.join(loansDir, 'documents');
  
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  if (!fs.existsSync(loansDir)) {
    fs.mkdirSync(loansDir, { recursive: true });
  }
  
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
  }
};

// Create directories on startup
try {
  createDirectories();
} catch (error) {
  console.error('Error creating upload directories:', error);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Determine destination based on file type or route
    let uploadPath = path.join(__dirname, '../../../uploads');
    
    if (req.path.includes('/loans/') || req.path.includes('/documents/')) {
      uploadPath = path.join(uploadPath, 'loans/documents');
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const uniqueId = uuidv4();
    const fileExt = path.extname(file.originalname);
    const fileName = `${uniqueId}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only certain file types
  const allowedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and DOC/DOCX files are allowed.'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Export function to get file URL
export const getFileUrl = (filename: string, type: 'document' | 'profile' = 'document'): string => {
  let basePath = '/uploads';
  
  if (type === 'document') {
    basePath = `${basePath}/loans/documents`;
  } else if (type === 'profile') {
    basePath = `${basePath}/profiles`;
  }
  
  return `${basePath}/${filename}`;
};