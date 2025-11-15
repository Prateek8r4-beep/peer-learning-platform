const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getPool } = require('../config/database');

// Create payment intent for lecture
router.post('/create-intent', authMiddleware, async (req, res, next) => {
  try {
    const { lectureId } = req.body;
    const pool = getPool();

    // Get lecture details
    const lectureResult = await pool.query(
      'SELECT * FROM lectures WHERE id = $1',
      [lectureId]
    );

    if (lectureResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    const lecture = lectureResult.rows[0];

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(lecture.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: req.user.userId,
        lectureId: lectureId,
        paymentFor: 'lecture'
      }
    });

    // Store payment record
    await pool.query(
      `INSERT INTO payments (user_id, amount, currency, transaction_id, status, payment_for, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [req.user.userId, lecture.price, 'usd', paymentIntent.id, 'pending', 'lecture', lectureId]
    );

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: lecture.price
      }
    });
  } catch (error) {
    next(error);
  }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const pool = getPool();

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      // Update payment status
      await pool.query(
        'UPDATE payments SET status = $1, updated_at = NOW() WHERE transaction_id = $2',
        ['completed', paymentIntent.id]
      );

      // Enroll user in lecture
      if (paymentIntent.metadata.paymentFor === 'lecture') {
        await pool.query(
          `INSERT INTO lecture_enrollments (lecture_id, user_id, payment_status, payment_id)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (lecture_id, user_id) DO UPDATE SET payment_status = $3`,
          [paymentIntent.metadata.lectureId, paymentIntent.metadata.userId, 'completed', paymentIntent.id]
        );
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

// Get user's payment history
router.get('/history', authMiddleware, async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT p.*, l.title as lecture_title
       FROM payments p
       LEFT JOIN lectures l ON p.reference_id = l.id AND p.payment_for = 'lecture'
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
