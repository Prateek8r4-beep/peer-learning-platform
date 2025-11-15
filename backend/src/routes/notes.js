const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const upload = require('../middleware/upload');
const fileUploadService = require('../services/fileUploadService');
const { getPool } = require('../config/database');

// Get all notes
router.get('/', async (req, res, next) => {
  try {
    const { subject, room, search, limit = 20, offset = 0 } = req.query;
    const pool = getPool();

    let query = `
      SELECT n.*, s.name as subject_name, u.full_name as uploader_name, u.username as uploader_username,
             r.name as room_name
      FROM notes n
      LEFT JOIN subjects s ON n.subject_id = s.id
      LEFT JOIN users u ON n.uploaded_by = u.id
      LEFT JOIN study_rooms r ON n.room_id = r.id
      WHERE n.is_public = true
    `;
    const params = [];
    let paramCount = 1;

    if (subject) {
      query += ` AND n.subject_id = $${paramCount}`;
      params.push(subject);
      paramCount++;
    }

    if (room) {
      query += ` AND n.room_id = $${paramCount}`;
      params.push(room);
      paramCount++;
    }

    if (search) {
      query += ` AND (n.title ILIKE $${paramCount} OR n.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY n.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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

// Get note by ID
router.get('/:noteId', async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT n.*, s.name as subject_name, u.full_name as uploader_name, u.username as uploader_username
       FROM notes n
       LEFT JOIN subjects s ON n.subject_id = s.id
       LEFT JOIN users u ON n.uploaded_by = u.id
       WHERE n.id = $1`,
      [req.params.noteId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Increment view count
    await pool.query(
      'UPDATE notes SET view_count = view_count + 1 WHERE id = $1',
      [req.params.noteId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Upload note
router.post('/', authMiddleware, upload.single('file'), validate(schemas.uploadNote), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const { title, description, subjectId, roomId, isPublic } = req.body;
    
    // Upload file to S3
    const fileData = await fileUploadService.uploadFile(req.file, 'notes');
    
    // Save to database
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO notes (title, description, file_url, file_type, file_size, uploaded_by, subject_id, room_id, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        title,
        description,
        fileData.url,
        fileData.type,
        fileData.size,
        req.user.userId,
        subjectId,
        roomId || null,
        isPublic !== 'false'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Download note
router.get('/:noteId/download', async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM notes WHERE id = $1',
      [req.params.noteId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const note = result.rows[0];

    // Increment download count
    await pool.query(
      'UPDATE notes SET download_count = download_count + 1 WHERE id = $1',
      [req.params.noteId]
    );

    // Redirect to file URL or generate signed URL
    res.json({
      success: true,
      data: {
        downloadUrl: note.file_url,
        fileName: note.title,
        fileType: note.file_type
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete note
router.delete('/:noteId', authMiddleware, async (req, res, next) => {
  try {
    const pool = getPool();
    
    // Check ownership
    const result = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND uploaded_by = $2',
      [req.params.noteId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found or unauthorized' });
    }

    // Delete from database
    await pool.query('DELETE FROM notes WHERE id = $1', [req.params.noteId]);

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get user's uploaded notes
router.get('/user/:userId', async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT n.*, s.name as subject_name
       FROM notes n
       LEFT JOIN subjects s ON n.subject_id = s.id
       WHERE n.uploaded_by = $1
       ORDER BY n.created_at DESC`,
      [req.params.userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
