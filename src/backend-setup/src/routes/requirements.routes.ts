import express from 'express';
import {
  getStudentRequirements,
  uploadRequirement,
  tagHardCopySubmitted,
  submitOvrRequest,
  getRequirementsForReview,
  updateRequirementStatus,
  confirmHardCopyReceipt,
  getOvrRequests,
  evaluateOvrRequest,
} from '../controllers/requirements.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for requirement file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads', 'documents'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'req-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/i;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images (JPG, PNG), PDF, and Word documents are allowed'));
  }
});

// ─── Student Routes ───
router.get('/student/list', authenticate, authorize('student'), getStudentRequirements);
router.post('/student/upload', authenticate, authorize('student'), upload.single('file'), uploadRequirement);
router.put('/student/:requirement_id/hard-copy', authenticate, authorize('student'), tagHardCopySubmitted);
router.post('/student/ovr', authenticate, authorize('student'), submitOvrRequest);

// ─── Registrar Routes ───
router.get('/registrar/list', authenticate, authorize('registrar', 'superadmin'), getRequirementsForReview);
router.put('/registrar/:id/status', authenticate, authorize('registrar', 'superadmin'), updateRequirementStatus);
router.put('/registrar/:id/hard-copy-confirm', authenticate, authorize('registrar', 'superadmin'), confirmHardCopyReceipt);
router.get('/registrar/ovr', authenticate, authorize('registrar', 'superadmin'), getOvrRequests);
router.put('/registrar/ovr/:id', authenticate, authorize('registrar', 'superadmin'), evaluateOvrRequest);

export default router;
