const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { validate, schemas } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Register with email/password
router.post('/register', authLimiter, validate(schemas.register), async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Login with email/password
router.post('/login', authLimiter, validate(schemas.login), async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Send OTP to phone
router.post('/phone/send-otp', authLimiter, async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await authService.sendPhoneOTP(phone);
    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Verify OTP and login
router.post('/phone/verify', authLimiter, validate(schemas.verifyOTP), async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    const result = await authService.loginWithPhone(phone, code);
    res.json({
      success: true,
      message: 'Phone verification successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Refresh access token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Verify email
router.get('/verify-email', async (req, res, next) => {
  try {
    const { userId, token } = req.query;
    const result = await authService.verifyEmail(userId, token);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
