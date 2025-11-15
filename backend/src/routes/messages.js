const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getDB } = require('../config/mongodb');

// Get messages for a room
router.get('/room/:roomId', authMiddleware, async (req, res, next) => {
  try {
    const { limit = 50, before } = req.query;
    const db = getDB();
    
    const query = { roomId: req.params.roomId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await db.collection('messages')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();

    res.json({
      success: true,
      data: messages.reverse()
    });
  } catch (error) {
    next(error);
  }
});

// Get direct messages between two users
router.get('/direct/:userId', authMiddleware, async (req, res, next) => {
  try {
    const { limit = 50, before } = req.query;
    const db = getDB();
    
    const conversationId = [req.user.userId, req.params.userId].sort().join('_');
    
    const query = { conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await db.collection('direct_messages')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();

    // Mark messages as read
    await db.collection('direct_messages').updateMany(
      {
        conversationId,
        senderId: req.params.userId,
        isRead: false
      },
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );

    res.json({
      success: true,
      data: messages.reverse()
    });
  } catch (error) {
    next(error);
  }
});

// Get user's conversations
router.get('/conversations', authMiddleware, async (req, res, next) => {
  try {
    const db = getDB();
    
    const conversations = await db.collection('direct_messages').aggregate([
      {
        $match: {
          participants: req.user.userId
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isRead', false] },
                    { $ne: ['$senderId', req.user.userId] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]).toArray();

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
});

// Delete message
router.delete('/:messageId', authMiddleware, async (req, res, next) => {
  try {
    const db = getDB();
    
    const result = await db.collection('messages').updateOne(
      {
        _id: req.params.messageId,
        senderId: req.user.userId
      },
      {
        $set: { isDeleted: true, content: 'This message was deleted' }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Message not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
