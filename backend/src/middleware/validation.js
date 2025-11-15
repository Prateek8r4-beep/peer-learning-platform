const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }
    
    next();
  };
};

// Common validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    password: Joi.string().min(8).required(),
    fullName: Joi.string().min(2).max(100).required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
  }).xor('email', 'phone'),

  login: Joi.object({
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    password: Joi.string().required(),
  }).xor('email', 'phone'),

  verifyOTP: Joi.object({
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    code: Joi.string().length(6).required(),
  }),

  createRoom: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    subjectId: Joi.string().uuid().required(),
    description: Joi.string().max(500),
    roomType: Joi.string().valid('public', 'private', 'premium'),
    maxParticipants: Joi.number().integer().min(2).max(100),
  }),

  uploadNote: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000),
    subjectId: Joi.string().uuid().required(),
    roomId: Joi.string().uuid(),
    isPublic: Joi.boolean(),
  }),

  createLecture: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().max(2000).required(),
    subjectId: Joi.string().uuid().required(),
    price: Joi.number().min(0).required(),
    durationMinutes: Joi.number().integer().min(15).max(180).required(),
    scheduledAt: Joi.date().iso().greater('now').required(),
    maxAttendees: Joi.number().integer().min(1).max(100),
  }),

  createDoubtSession: Joi.object({
    mentorId: Joi.string().uuid().required(),
    subjectId: Joi.string().uuid().required(),
    question: Joi.string().min(10).max(1000).required(),
    scheduledAt: Joi.date().iso().greater('now'),
  }),
};

module.exports = { validate, schemas };
