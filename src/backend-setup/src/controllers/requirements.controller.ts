import { Request, Response } from 'express';
import { query, run, get } from '../database/connection';

// ─── STUDENT ENDPOINTS ───

/**
 * Get all requirements for the logged-in student
 * Returns initial requirements list (based on student_type) + INC requirements + hard copy status
 */
export const getStudentRequirements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const student: any = await get(
      'SELECT id, student_type, form137_status, form138_status, tor_status, certificate_transfer_status, birth_certificate_status, moral_certificate_status FROM students WHERE user_id = ?',
      [userId]
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Get uploaded requirement records
    const requirements = await query(
      'SELECT * FROM student_requirements WHERE student_id = ? ORDER BY created_at DESC',
      [student.id]
    );

    // Get OVR requests
    const ovrRequests = await query(
      'SELECT * FROM ovr_requests WHERE student_id = ? ORDER BY created_at DESC',
      [student.id]
    );

    // Build initial requirements list based on student_type
    const studentType = student.student_type?.toLowerCase();
    let initialRequirements: any[] = [];

    if (studentType === 'new') {
      initialRequirements = [
        { name: 'Form 137', db_field: 'form137_status', status: student.form137_status || 'Pending' },
        { name: 'Form 138', db_field: 'form138_status', status: student.form138_status || 'Pending' },
        { name: 'Birth Certificate', db_field: 'birth_certificate_status', status: student.birth_certificate_status || 'Pending' },
        { name: 'Certificate of Good Moral', db_field: 'moral_certificate_status', status: student.moral_certificate_status || 'Pending' },
      ];
    } else if (studentType === 'transferee') {
      initialRequirements = [
        { name: 'Transcript of Records (TOR)', db_field: 'tor_status', status: student.tor_status || 'Pending' },
        { name: 'Certificate of Transfer', db_field: 'certificate_transfer_status', status: student.certificate_transfer_status || 'Pending' },
        { name: 'Birth Certificate', db_field: 'birth_certificate_status', status: student.birth_certificate_status || 'Pending' },
        { name: 'Certificate of Good Moral', db_field: 'moral_certificate_status', status: student.moral_certificate_status || 'Pending' },
      ];
    } else if (studentType === 'returning') {
      initialRequirements = [
        { name: 'Birth Certificate', db_field: 'birth_certificate_status', status: student.birth_certificate_status || 'Pending' },
        { name: 'Certificate of Good Moral', db_field: 'moral_certificate_status', status: student.moral_certificate_status || 'Pending' },
      ];
    } else {
      // Continuing / Scholar
      initialRequirements = [
        { name: 'Birth Certificate', db_field: 'birth_certificate_status', status: student.birth_certificate_status || 'Pending' },
        { name: 'Certificate of Good Moral', db_field: 'moral_certificate_status', status: student.moral_certificate_status || 'Pending' },
      ];
    }

    // Merge uploaded files with initial requirements
    for (const req of initialRequirements) {
      const uploaded = requirements.find(
        (r: any) => r.requirement_name === req.name && r.requirement_type === 'Initial'
      );
      if (uploaded) {
        req.uploaded = true;
        req.file_name = uploaded.file_name;
        req.file_path = uploaded.file_path;
        req.upload_status = uploaded.status;
        req.hard_copy_submitted = uploaded.hard_copy_submitted;
        req.hard_copy_received_at = uploaded.hard_copy_received_at;
        req.requirement_id = uploaded.id;
        req.remarks = uploaded.remarks;
      }
    }

    // INC requirements
    const incRequirements = requirements.filter((r: any) => r.requirement_type === 'INC');

    res.json({
      success: true,
      studentType: student.student_type,
      initialRequirements,
      incRequirements,
      ovrRequests,
    });
  } catch (error: any) {
    console.error('Error fetching student requirements:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Upload a requirement document (Initial or INC)
 */
export const uploadRequirement = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const student: any = await get('SELECT id FROM students WHERE user_id = ?', [userId]);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const { requirement_name, requirement_type } = req.body;
    const file = (req as any).file;

    if (!requirement_name || !requirement_type) {
      return res.status(400).json({ success: false, message: 'requirement_name and requirement_type are required' });
    }
    if (!file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    // Check if already submitted for Initial type
    if (requirement_type === 'Initial') {
      const existing: any = await get(
        'SELECT id FROM student_requirements WHERE student_id = ? AND requirement_name = ? AND requirement_type = ?',
        [student.id, requirement_name, 'Initial']
      );
      if (existing) {
        // Update existing record
        await run(
          `UPDATE student_requirements SET file_path = ?, file_name = ?, status = 'Submitted', updated_at = datetime('now') WHERE id = ?`,
          [file.path, file.originalname, existing.id]
        );
        return res.json({ success: true, message: 'Requirement updated successfully' });
      }
    }

    await run(
      `INSERT INTO student_requirements (student_id, requirement_name, requirement_type, file_path, file_name, status) VALUES (?, ?, ?, ?, ?, 'Submitted')`,
      [student.id, requirement_name, requirement_type, file.path, file.originalname]
    );

    res.json({ success: true, message: 'Requirement uploaded successfully' });
  } catch (error: any) {
    console.error('Error uploading requirement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Tag a requirement as hard copy submitted
 */
export const tagHardCopySubmitted = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const student: any = await get('SELECT id FROM students WHERE user_id = ?', [userId]);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const { requirement_id } = req.params;
    
    const existing: any = await get(
      'SELECT id FROM student_requirements WHERE id = ? AND student_id = ?',
      [requirement_id, student.id]
    );
    if (!existing) return res.status(404).json({ success: false, message: 'Requirement not found' });

    await run(
      `UPDATE student_requirements SET hard_copy_submitted = 1, updated_at = datetime('now') WHERE id = ?`,
      [requirement_id]
    );

    res.json({ success: true, message: 'Hard copy submission tagged' });
  } catch (error: any) {
    console.error('Error tagging hard copy:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit an OVR (overload) request
 */
export const submitOvrRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const student: any = await get('SELECT id FROM students WHERE user_id = ?', [userId]);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const { school_year, semester, requested_units, reason } = req.body;

    if (!requested_units || !reason) {
      return res.status(400).json({ success: false, message: 'requested_units and reason are required' });
    }

    await run(
      `INSERT INTO ovr_requests (student_id, school_year, semester, requested_units, reason) VALUES (?, ?, ?, ?, ?)`,
      [student.id, school_year || '', semester || '', requested_units, reason]
    );

    res.json({ success: true, message: 'OVR request submitted' });
  } catch (error: any) {
    console.error('Error submitting OVR request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── REGISTRAR ENDPOINTS ───

/**
 * Get all student requirements for registrar review (with student info)
 */
export const getRequirementsForReview = async (req: Request, res: Response) => {
  try {
    const { status, type } = req.query;
    let sql = `
      SELECT sr.*, s.student_id as student_number, s.first_name, s.last_name, s.student_type, s.course
      FROM student_requirements sr
      JOIN students s ON sr.student_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (status) {
      sql += ' AND sr.status = ?';
      params.push(status);
    }
    if (type) {
      sql += ' AND sr.requirement_type = ?';
      params.push(type);
    }
    sql += ' ORDER BY sr.created_at DESC';

    const requirements = await query(sql, params);
    res.json({ success: true, requirements });
  } catch (error: any) {
    console.error('Error getting requirements for review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Registrar updates a requirement status (verify / reject)
 */
export const updateRequirementStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const reviewerId = (req as any).user?.id;

    if (!['Verified', 'Rejected', 'Incomplete'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Get the requirement to update the flat columns too
    const requirement: any = await get('SELECT * FROM student_requirements WHERE id = ?', [id]);
    if (!requirement) return res.status(404).json({ success: false, message: 'Requirement not found' });

    await run(
      `UPDATE student_requirements SET status = ?, remarks = ?, reviewed_by = ?, reviewed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
      [status, remarks || null, reviewerId, id]
    );

    // Also update the flat status column on students table for Initial requirements
    if (requirement.requirement_type === 'Initial') {
      const fieldMap: Record<string, string> = {
        'Form 137': 'form137_status',
        'Form 138': 'form138_status',
        'Transcript of Records (TOR)': 'tor_status',
        'Certificate of Transfer': 'certificate_transfer_status',
        'Birth Certificate': 'birth_certificate_status',
        'Certificate of Good Moral': 'moral_certificate_status',
      };
      const dbField = fieldMap[requirement.requirement_name];
      if (dbField) {
        const flatStatus = status === 'Verified' ? 'Submitted' : status === 'Rejected' ? 'Pending' : 'Pending';
        await run(`UPDATE students SET ${dbField} = ? WHERE id = ?`, [flatStatus, requirement.student_id]);
      }
    }

    res.json({ success: true, message: `Requirement ${status.toLowerCase()} successfully` });
  } catch (error: any) {
    console.error('Error updating requirement status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Registrar confirms hard copy receipt
 */
export const confirmHardCopyReceipt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await run(
      `UPDATE student_requirements SET hard_copy_received_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
      [id]
    );

    res.json({ success: true, message: 'Hard copy receipt confirmed' });
  } catch (error: any) {
    console.error('Error confirming hard copy:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all OVR requests for registrar review
 */
export const getOvrRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT ovr.*, s.student_id as student_number, s.first_name, s.last_name, s.student_type, s.course
      FROM ovr_requests ovr
      JOIN students s ON ovr.student_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (status) {
      sql += ' AND ovr.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY ovr.created_at DESC';

    const requests = await query(sql, params);
    res.json({ success: true, ovrRequests: requests });
  } catch (error: any) {
    console.error('Error getting OVR requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Registrar evaluates an OVR request (approve/deny)
 */
export const evaluateOvrRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, registrar_remarks } = req.body;
    const reviewerId = (req as any).user?.id;

    if (!['Approved', 'Denied'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Use Approved or Denied.' });
    }

    await run(
      `UPDATE ovr_requests SET status = ?, registrar_remarks = ?, reviewed_by = ?, reviewed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
      [status, registrar_remarks || null, reviewerId, id]
    );

    res.json({ success: true, message: `OVR request ${status.toLowerCase()}` });
  } catch (error: any) {
    console.error('Error evaluating OVR request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
