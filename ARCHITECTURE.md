# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js 14 + React + TypeScript + Tailwind CSS     │  │
│  │  - Pages: Landing, Auth, Dashboard, Rooms, Notes    │  │
│  │  - Components: UI, Chat, File Upload, Profile       │  │
│  │  - State: Zustand + React Query                     │  │
│  │  - Real-time: Socket.io Client                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway / Load Balancer             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Node.js + Express + Socket.io                       │  │
│  │                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │   Routes    │  │ Controllers │  │  Services   │ │  │
│  │  │             │  │             │  │             │ │  │
│  │  │ - Auth      │→ │ - Auth      │→ │ - Auth      │ │  │
│  │  │ - Users     │  │ - Users     │  │ - File      │ │  │
│  │  │ - Rooms     │  │ - Rooms     │  │ - Email     │ │  │
│  │  │ - Notes     │  │ - Notes     │  │ - Twilio    │ │  │
│  │  │ - Lectures  │  │ - Lectures  │  │ - Payment   │ │  │
│  │  │ - Messages  │  │ - Messages  │  │ - AI Match  │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐│  │
│  │  │           Socket Handlers                        ││  │
│  │  │  - Chat Handler (Messages, Typing, Reactions)   ││  │
│  │  │  - Room Handler (Join, Leave, Active Members)   ││  │
│  │  └─────────────────────────────────────────────────┘│  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │   MongoDB    │  │    Redis     │     │
│  │              │  │              │  │              │     │
│  │ - Users      │  │ - Messages   │  │ - Sessions   │     │
│  │ - Rooms      │  │ - Direct Msg │  │ - Cache      │     │
│  │ - Notes      │  │ - Chat Logs  │  │ - Pub/Sub    │     │
│  │ - Lectures   │  │              │  │ - Active     │     │
│  │ - Payments   │  │              │  │   Users      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  AWS S3  │  │  Stripe  │  │  Twilio  │  │   SMTP   │   │
│  │  Files   │  │ Payments │  │   SMS    │  │  Email   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand + React Query
- **Real-time:** Socket.io Client
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** JavaScript (ES6+)
- **Real-time:** Socket.io
- **Validation:** Joi
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer + AWS SDK

### Databases
- **Primary DB:** PostgreSQL 15 (Relational data)
- **Chat DB:** MongoDB 6 (Messages, logs)
- **Cache:** Redis 7 (Sessions, real-time data)

### External Services
- **Storage:** AWS S3
- **Payments:** Stripe
- **SMS:** Twilio Verify
- **Email:** SMTP (Gmail, SendGrid, etc.)

## Data Flow

### Authentication Flow
```
User → Frontend → POST /api/auth/register
                ↓
            Backend validates
                ↓
            Hash password (bcrypt)
                ↓
            Store in PostgreSQL
                ↓
            Send verification (Email/SMS)
                ↓
            Generate JWT tokens
                ↓
            Return to Frontend
                ↓
            Store in localStorage
```

### Real-time Chat Flow
```
User types message → Frontend
                    ↓
            Socket.io emit 'send_message'
                    ↓
            Backend receives event
                    ↓
            Save to MongoDB
                    ↓
            Broadcast to room (Socket.io)
                    ↓
            All clients receive 'new_message'
                    ↓
            Update UI instantly
```

### File Upload Flow
```
User selects file → Frontend
                   ↓
            Validate (type, size)
                   ↓
            Upload to backend (multipart/form-data)
                   ↓
            Backend validates
                   ↓
            Upload to S3
                   ↓
            Get S3 URL
                   ↓
            Save metadata to PostgreSQL
                   ↓
            Return URL to frontend
```

## Database Schema

### PostgreSQL Tables

**users**
- id (UUID, PK)
- email, phone (unique)
- password_hash
- full_name, username
- profile_picture_url
- bio, education_level, institution
- is_verified, is_premium
- timestamps

**subjects**
- id (UUID, PK)
- name (unique)
- category, description
- icon_url

**study_rooms**
- id (UUID, PK)
- name, description
- subject_id (FK)
- created_by (FK)
- room_type, max_participants
- logo_url
- is_active

**notes**
- id (UUID, PK)
- title, description
- file_url, file_type, file_size
- uploaded_by (FK)
- subject_id (FK)
- room_id (FK)
- is_public
- download_count, view_count

**lectures**
- id (UUID, PK)
- title, description
- instructor_id (FK)
- subject_id (FK)
- price, duration_minutes
- scheduled_at
- meeting_link, recording_url
- status

### MongoDB Collections

**messages**
```json
{
  "_id": ObjectId,
  "roomId": String,
  "senderId": String,
  "senderName": String,
  "content": String,
  "messageType": String,
  "attachments": Array,
  "reactions": Array,
  "isEdited": Boolean,
  "createdAt": Date
}
```

**direct_messages**
```json
{
  "_id": ObjectId,
  "conversationId": String,
  "participants": [String],
  "senderId": String,
  "content": String,
  "isRead": Boolean,
  "createdAt": Date
}
```

### Redis Keys

- `user:{userId}:socket` - User's socket ID
- `socket:{socketId}:user` - Socket's user ID
- `room:{roomId}:active` - Set of active users in room
- `session:{sessionId}` - User session data

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/phone/send-otp` - Send OTP to phone
- `POST /api/auth/phone/verify` - Verify OTP and login
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/:userId` - Get user by ID
- `POST /api/users/subjects` - Add subject
- `DELETE /api/users/subjects/:id` - Remove subject

### Rooms
- `GET /api/rooms` - List all rooms
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create room
- `POST /api/rooms/:id/join` - Join room
- `POST /api/rooms/:id/leave` - Leave room
- `GET /api/rooms/:id/members` - Get members

### Notes
- `GET /api/notes` - List all notes
- `GET /api/notes/:id` - Get note details
- `POST /api/notes` - Upload note
- `GET /api/notes/:id/download` - Download note
- `DELETE /api/notes/:id` - Delete note

### Messages
- `GET /api/messages/room/:roomId` - Get room messages
- `GET /api/messages/direct/:userId` - Get direct messages
- `GET /api/messages/conversations` - Get all conversations

### Lectures
- `GET /api/lectures` - List lectures
- `GET /api/lectures/:id` - Get lecture details
- `POST /api/lectures` - Create lecture
- `GET /api/lectures/:id/enrollment` - Check enrollment

### Payments
- `POST /api/payments/create-intent` - Create payment
- `POST /api/payments/webhook` - Stripe webhook
- `GET /api/payments/history` - Payment history

## WebSocket Events

### Client → Server
- `join_room` - Join a study room
- `leave_room` - Leave a study room
- `send_message` - Send message to room
- `send_direct_message` - Send DM
- `typing` - Typing indicator
- `add_reaction` - React to message
- `edit_message` - Edit message
- `delete_message` - Delete message

### Server → Client
- `new_message` - New message received
- `new_direct_message` - New DM received
- `user_joined` - User joined room
- `user_left` - User left room
- `user_typing` - User is typing
- `message_updated` - Message edited/deleted
- `room_stats_updated` - Room stats changed

## Security Measures

### Authentication
- Password hashing with bcrypt (12 rounds)
- JWT with expiration (7 days access, 30 days refresh)
- Token refresh mechanism
- Email/Phone verification

### API Security
- CORS configuration
- Helmet.js security headers
- Rate limiting (100 req/15min)
- Input validation (Joi/Zod)
- SQL injection prevention (parameterized queries)
- XSS protection

### File Security
- File type validation
- File size limits (10MB default)
- Virus scanning (optional)
- Signed URLs for downloads

## Performance Optimizations

### Caching
- Redis for session storage
- API response caching
- Static asset caching
- Database query caching

### Database
- Indexed columns
- Connection pooling
- Query optimization
- Pagination

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization

## Scalability

### Horizontal Scaling
- Stateless backend servers
- Load balancer distribution
- Redis for shared state
- Database replication

### Vertical Scaling
- Increase server resources
- Database optimization
- Connection pool tuning

## Monitoring & Logging

### Application Logs
- Morgan for HTTP logging
- Winston for application logging
- Error tracking with Sentry (optional)

### Metrics
- API response times
- Database query performance
- WebSocket connections
- Active users

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│           CDN (CloudFront)              │
│         Static Assets + Images          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Load Balancer (ALB/Nginx)          │
└─────────────────────────────────────────┘
         ↓                    ↓
┌──────────────┐      ┌──────────────┐
│  Frontend    │      │   Backend    │
│  (Vercel)    │      │  (Heroku/    │
│              │      │   AWS EC2)   │
└──────────────┘      └──────────────┘
                             ↓
         ┌───────────────────┴───────────────────┐
         ↓                   ↓                   ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ PostgreSQL   │    │   MongoDB    │    │    Redis     │
│   (RDS)      │    │   (Atlas)    │    │ (ElastiCache)│
└──────────────┘    └──────────────┘    └──────────────┘
```

---

This architecture is designed for:
- **Scalability** - Handle thousands of concurrent users
- **Reliability** - 99.9% uptime with redundancy
- **Performance** - Sub-second response times
- **Security** - Enterprise-grade protection
- **Maintainability** - Clean, modular codebase
