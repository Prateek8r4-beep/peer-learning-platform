const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getPool } = require('../config/database');

// Get current user profile
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT u.*, 
        array_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name, 'proficiency', us.proficiency_level)) 
        FILTER (WHERE s.id IS NOT NULL) as subjects
       FROM users u
       LEFT JOIN user_subjects us ON u.id = us.user_id
       LEFT JOIN subjects s ON us.subject_id = s.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    delete user.password_hash;

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/me', authMiddleware, async (req, res, next) => {
  try {
    const { fullName, bio, educationLevel, institution } = req.body;
    const pool = getPool();

    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           bio = COALESCE($2, bio),
           education_level = COALESCE($3, education_level),
           institution = COALESCE($4, institution),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, phone, full_name, username, bio, education_level, institution`,
      [fullName, bio, educationLevel, institution, req.user.userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Add subject to user profile
router.post('/subjects', authMiddleware, async (req, res, next) => {
  try {
    const { subjectId, proficiencyLevel, canTeach } = req.body;
    const pool = getPool();

    const result = await pool.query(
      `INSERT INTO user_subjects (user_id, subject_id, proficiency_level, can_teach)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, subject_id) 
       DO UPDATE SET proficiency_level = $3, can_teach = $4
       RETURNING *`,
      [req.user.userId, subjectId, proficiencyLevel, canTeach || false]
    );

    res.json({
      success: true,
      message: 'Subject added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Remove subject from user profile
router.delete('/subjects/:subjectId', authMiddleware, async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.query(
      'DELETE FROM user_subjects WHERE user_id = $1 AND subject_id = $2',
      [req.user.userId, req.params.subjectId]
    );

    res.json({
      success: true,
      message: 'Subject removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:userId', async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.username, u.bio, u.profile_picture_url, 
              u.education_level, u.institution, u.created_at,
        array_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name)) 
        FILTER (WHERE s.id IS NOT NULL) as subjects
       FROM users u
       LEFT JOIN user_subjects us ON u.id = us.user_id
       LEFT JOIN subjects s ON us.subject_id = s.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Search users
router.get('/', async (req, res, next) => {
  try {
    const { search, subject, limit = 20, offset = 0 } = req.query;
    const pool = getPool();

    let query = `
      SELECT DISTINCT u.id, u.full_name, u.username, u.profile_picture_url, u.bio
      FROM users u
      LEFT JOIN user_subjects us ON u.id = us.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (u.full_name ILIKE $${paramCount} OR u.username ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (subject) {
      query += ` AND us.subject_id = $${paramCount}`;
      params.push(subject);
      paramCount++;
    }

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rowCount
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
