const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { getPool } = require('../config/database');

// Get all lectures
router.get('/', async (req, res, next) => {
  try {
    const { subject, status, limit = 20, offset = 0 } = req.query;
    const pool = getPool();

    let query = `
      SELECT l.*, s.name as subject_name, u.full_name as instructor_name, u.username as instructor_username,
             COUNT(DISTINCT le.user_id) as enrolled_count
      FROM lectures l
      LEFT JOIN subjects s ON l.subject_id = s.id
      LEFT JOIN users u ON l.instructor_id = u.id
      LEFT JOIN lecture_enrollments le ON l.id = le.lecture_id AND le.payment_status = 'completed'
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (subject) {
      query += ` AND l.subject_id = $${paramCount}`;
      params.push(subject);
      paramCount++;
    }

    if (status) {
      query += ` AND l.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` GROUP BY l.id, s.id, u.id ORDER BY l.scheduled_at ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: { limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    next(error);
  }
});

// Create lecture
router.post('/', authMiddleware, validate(schemas.createLecture), async (req, res, next) => {
  try {
    const { title, description, subjectId, price, durationMinutes, scheduledAt, maxAttendees } = req.body;
    const pool = getPool();

    const result = await pool.query(
      `INSERT INTO lectures (title, description, instructor_id, subject_id, price, duration_minutes, scheduled_at, max_attendees)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, req.user.userId, subjectId, price, durationMinutes, scheduledAt, maxAttendees || 50]
    );

    res.status(201).json({
      success: true,
      message: 'Lecture created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Get lecture by ID
router.get('/:lectureId', async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT l.*, s.name as subject_name, u.full_name as instructor_name,
              COUNT(DISTINCT le.user_id) as enrolled_count
       FROM lectures l
       LEFT JOIN subjects s ON l.subject_id = s.id
       LEFT JOIN users u ON l.instructor_id = u.id
       LEFT JOIN lecture_enrollments le ON l.id = le.lecture_id AND le.payment_status = 'completed'
       WHERE l.id = $1
       GROUP BY l.id, s.id, u.id`,
      [req.params.lectureId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Check enrollment status
router.get('/:lectureId/enrollment', authMiddleware, async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM lecture_enrollments WHERE lecture_id = $1 AND user_id = $2',
      [req.params.lectureId, req.user.userId]
    );

    res.json({
      success: true,
      data: {
        isEnrolled: result.rows.length > 0,
        enrollment: result.rows[0] || null
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
