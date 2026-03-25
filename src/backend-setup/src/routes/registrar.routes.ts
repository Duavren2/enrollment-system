import express from 'express';
import {
  getAllCORs,
  generateCOR,
  approveCOR,
  getAllClearances,
  createClearance,
  resolveClearance,
  getRegistrarDashboardStats,
  getPendingSubjectAssessments,
  getEnrollmentForAssessment,
  approveSubjectAssessment,
  downloadScholarshipLetter,
  searchEnrolledStudents,
  getEnrollmentSubjectsForEdit,
  registrarAddSubject,
  registrarDropSubject,
  getSubjectAuditTrail
} from '../controllers/registrar.controller';
import { assessEnrollment, verifyPayment, approveEnrollment, rejectEnrollment } from '../controllers/enrollment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Dashboard
router.get('/dashboard/stats', authenticate, authorize('registrar', 'superadmin'), getRegistrarDashboardStats);

// Subject Assessment (new step after subject selection, before dean approval)
router.get('/enrollments/pending-assessment', authenticate, authorize('registrar', 'superadmin'), getPendingSubjectAssessments);
router.get('/enrollments/:id/assessment-details', authenticate, authorize('registrar', 'superadmin'), getEnrollmentForAssessment);
router.put('/enrollments/:id/approve-assessment', authenticate, authorize('registrar', 'superadmin'), approveSubjectAssessment);

// Enrollment Assessment & Payment Verification
router.put('/enrollments/:id/assess', authenticate, authorize('registrar', 'superadmin'), assessEnrollment);
router.put('/enrollments/:id/approve', authenticate, authorize('registrar', 'superadmin'), approveEnrollment);
router.put('/enrollments/:id/reject', authenticate, authorize('registrar', 'superadmin'), rejectEnrollment);
router.put('/enrollments/:id/verify-payment', authenticate, authorize('registrar', 'superadmin'), verifyPayment);

// CORs
router.get('/cors', authenticate, authorize('registrar', 'superadmin'), getAllCORs);
router.post('/cors/generate', authenticate, authorize('registrar', 'superadmin'), generateCOR);
router.put('/cors/:id/approve', authenticate, authorize('registrar', 'superadmin'), approveCOR);

// Clearances
router.get('/clearances', authenticate, authorize('registrar', 'superadmin'), getAllClearances);
router.post('/clearances', authenticate, authorize('registrar', 'superadmin'), createClearance);
router.put('/clearances/:id/resolve', authenticate, authorize('registrar', 'superadmin'), resolveClearance);

// Section assignment
import { assignStudentToSection, getEnrollmentReport } from '../controllers/registrar.controller';
router.post('/sections/assign', authenticate, authorize('registrar', 'admin', 'superadmin'), assignStudentToSection);

// Reports
router.get('/reports/enrollments', authenticate, authorize('registrar', 'admin', 'superadmin'), getEnrollmentReport);

// Scholarship Downloads
router.get('/scholarships/download/:filename', authenticate, authorize('registrar', 'superadmin'), downloadScholarshipLetter);

// Adding / Dropping of Subjects
router.get('/subject-management/search', authenticate, authorize('registrar', 'superadmin'), searchEnrolledStudents);
router.get('/subject-management/:id/subjects', authenticate, authorize('registrar', 'superadmin'), getEnrollmentSubjectsForEdit);
router.post('/subject-management/:id/add-subject', authenticate, authorize('registrar', 'superadmin'), registrarAddSubject);
router.delete('/subject-management/:id/drop-subject/:subjectId', authenticate, authorize('registrar', 'superadmin'), registrarDropSubject);
router.get('/subject-management/:id/audit-trail', authenticate, authorize('registrar', 'superadmin'), getSubjectAuditTrail);

export default router;
