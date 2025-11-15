const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/database');
const twilioService = require('./twilioService');
const emailService = require('./emailService');

class AuthService {
  async register(userData) {
    const { email, phone, password, fullName, username } = userData;
    const pool = getPool();
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Insert user
    const query = `
      INSERT INTO users (email, phone, password_hash, full_name, username)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, phone, full_name, username, role, created_at
    `;
    
    const result = await pool.query(query, [
      email || null,
      phone || null,
      passwordHash,
      fullName,
      username
    ]);
    
    const user = result.rows[0];
    
    // Send verification
    if (email) {
      await emailService.sendVerificationEmail(email, user.id);
    } else if (phone) {
      await twilioService.sendVerificationCode(phone);
    }
    
    // Generate tokens
    const tokens = this.generateTokens(user);
    
    return { user, ...tokens };
  }

  async login(credentials) {
    const { email, phone, password } = credentials;
    const pool = getPool();
    
    // Get user
    const query = email 
      ? 'SELECT * FROM users WHERE email = $1'
      : 'SELECT * FROM users WHERE phone = $1';
    
    const result = await pool.query(query, [email || phone]);
    
    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = result.rows[0];
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Remove password from response
    delete user.password_hash;
    
    // Generate tokens
    const tokens = this.generateTokens(user);
    
    return { user, ...tokens };
  }

  async loginWithPhone(phone, code) {
    const pool = getPool();
    
    // Verify OTP
    const isValid = await twilioService.verifyCode(phone, code);
    
    if (!isValid) {
      throw new Error('Invalid verification code');
    }
    
    // Get or create user
    let result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    
    let user;
    if (result.rows.length === 0) {
      // Create new user
      const insertQuery = `
        INSERT INTO users (phone, username, full_name, is_verified)
        VALUES ($1, $2, $3, true)
        RETURNING id, phone, username, full_name, role, created_at
      `;
      const username = `user_${phone.slice(-6)}`;
      result = await pool.query(insertQuery, [phone, username, username]);
      user = result.rows[0];
    } else {
      user = result.rows[0];
      // Mark as verified
      await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [user.id]);
      delete user.password_hash;
    }
    
    // Generate tokens
    const tokens = this.generateTokens(user);
    
    return { user, ...tokens };
  }

  async sendPhoneOTP(phone) {
    await twilioService.sendVerificationCode(phone);
    return { message: 'Verification code sent' };
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
    );
    
    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken, 
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
      );
      
      const pool = getPool();
      const result = await pool.query(
        'SELECT id, email, phone, role FROM users WHERE id = $1',
        [decoded.userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const user = result.rows[0];
      const tokens = this.generateTokens(user);
      
      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async verifyEmail(userId, token) {
    // Implementation for email verification
    const pool = getPool();
    await pool.query(
      'UPDATE users SET is_verified = true WHERE id = $1',
      [userId]
    );
    return { message: 'Email verified successfully' };
  }
}

module.exports = new AuthService();
