const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { getPool } = require('../config/database');

// Create doubt session
router.post('/', authMiddleware, validate(schemas.createDoubtSession), async (req, res, next) => {
  try {
    const { mentorId, subjectId, question, scheduledAt } = req.body;
    const pool = getPool();

    const result = await pool.query(
      `INSERT INTO doubt_sessions (student_id, mentor_id, subject_id, question, scheduled_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.userId, mentorId, subjectId, question, scheduledAt || null]
    );

    res.status(201).json({
      success: true,
      message: 'Doubt session created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Get user's doubt sessions
router.get('/my-sessions', authMiddleware, async (req, res, next) => {
  try {
    const { role = 'student' } = req.query;
    const pool = getPool();

    const field = role === 'student' ? 'student_id' : 'mentor_id';
    const result = await pool.query(
      `SELECT ds.*, s.name as subject_name,
              student.full_name as student_name, mentor.full_name as mentor_name
       FROM doubt_sessions ds
       LEFT JOIN subjects s ON ds.subject_id = s.id
       LEFT JOIN users student ON ds.student_id = student.id
       LEFT JOIN users mentor ON ds.mentor_id = mentor.id
       WHERE ds.${field} = $1
       ORDER BY ds.created_at DESC`,
      [req.user.userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// Update doubt session status
router.patch('/:sessionId/status', authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    const pool = getPool();

    const result = await pool.query(
      `UPDATE doubt_sessions
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND (student_id = $3 OR mentor_id = $3)
       RETURNING *`,
      [status, req.params.sessionId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Session status updated',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
