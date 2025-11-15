const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { getPool } = require('../config/database');

// Get all study rooms
router.get('/', async (req, res, next) => {
  try {
    const { subject, type, search, limit = 20, offset = 0 } = req.query;
    const pool = getPool();

    let query = `
      SELECT r.*, s.name as subject_name, s.category as subject_category,
             u.full_name as creator_name, u.username as creator_username,
             COUNT(DISTINCT rm.user_id) as member_count
      FROM study_rooms r
      LEFT JOIN subjects s ON r.subject_id = s.id
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN room_members rm ON r.id = rm.room_id
      WHERE r.is_active = true
    `;
    const params = [];
    let paramCount = 1;

    if (subject) {
      query += ` AND r.subject_id = $${paramCount}`;
      params.push(subject);
      paramCount++;
    }

    if (type) {
      query += ` AND r.room_type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (search) {
      query += ` AND (r.name ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` GROUP BY r.id, s.id, u.id ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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

// Get room by ID
router.get('/:roomId', async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT r.*, s.name as subject_name, u.full_name as creator_name,
              COUNT(DISTINCT rm.user_id) as member_count
       FROM study_rooms r
       LEFT JOIN subjects s ON r.subject_id = s.id
       LEFT JOIN users u ON r.created_by = u.id
       LEFT JOIN room_members rm ON r.id = rm.room_id
       WHERE r.id = $1
       GROUP BY r.id, s.id, u.id`,
      [req.params.roomId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Create study room
router.post('/', authMiddleware, validate(schemas.createRoom), async (req, res, next) => {
  try {
    const { name, subjectId, description, roomType, maxParticipants } = req.body;
    const pool = getPool();

    const result = await pool.query(
      `INSERT INTO study_rooms (name, subject_id, description, created_by, room_type, max_participants)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, subjectId, description, req.user.userId, roomType || 'public', maxParticipants || 50]
    );

    // Add creator as admin member
    await pool.query(
      `INSERT INTO room_members (room_id, user_id, role)
       VALUES ($1, $2, 'admin')`,
      [result.rows[0].id, req.user.userId]
    );

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Join room
router.post('/:roomId/join', authMiddleware, async (req, res, next) => {
  try {
    const pool = getPool();

    // Check if room exists and has space
    const roomResult = await pool.query(
      `SELECT r.*, COUNT(rm.user_id) as current_members
       FROM study_rooms r
       LEFT JOIN room_members rm ON r.id = rm.room_id
       WHERE r.id = $1 AND r.is_active = true
       GROUP BY r.id`,
      [req.params.roomId]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const room = roomResult.rows[0];
    if (room.current_members >= room.max_participants) {
      return res.status(400).json({ success: false, message: 'Room is full' });
    }

    // Add member
    await pool.query(
      `INSERT INTO room_members (room_id, user_id, role)
       VALUES ($1, $2, 'member')
       ON CONFLICT (room_id, user_id) DO NOTHING`,
      [req.params.roomId, req.user.userId]
    );

    res.json({
      success: true,
      message: 'Joined room successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Leave room
router.post('/:roomId/leave', authMiddleware, async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.query(
      'DELETE FROM room_members WHERE room_id = $1 AND user_id = $2',
      [req.params.roomId, req.user.userId]
    );

    res.json({
      success: true,
      message: 'Left room successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get room members
router.get('/:roomId/members', async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.username, u.profile_picture_url, rm.role, rm.joined_at
       FROM room_members rm
       JOIN users u ON rm.user_id = u.id
       WHERE rm.room_id = $1
       ORDER BY rm.joined_at DESC`,
      [req.params.roomId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
