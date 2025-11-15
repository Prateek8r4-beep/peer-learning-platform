# 🎓 Peer Learning Platform

A comprehensive peer-learning platform where students can collaborate, share knowledge, and learn together.

## ✨ Features

- 🔐 **Multi-Auth System** - Login via Email or Phone Number
- 📚 **Study Rooms** - Subject-wise rooms with custom logos
- 💬 **Real-time Chat** - Instant messaging with typing indicators
- 📁 **File Management** - Upload, download, and share study materials
- 🎯 **AI Peer Matching** - Smart algorithm to connect compatible learners
- 💰 **Premium Lectures** - Monetization for skilled students/mentors
- 🎨 **Beautiful UI** - Modern, responsive design with Tailwind CSS
- 🔔 **Notifications** - Real-time updates and alerts
- 👥 **User Profiles** - Showcase subjects, notes, and activity

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Socket.io Client** - Real-time communication
- **React Query** - Data fetching
- **Zustand** - State management

### Backend
- **Node.js + Express** - REST API
- **Socket.io** - WebSocket server
- **PostgreSQL** - Primary database
- **MongoDB** - Chat messages
- **Redis** - Caching & sessions
- **AWS S3** - File storage
- **Stripe** - Payment processing
- **JWT** - Authentication

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- MongoDB 6+
- Redis 7+
- AWS Account (for S3)
- Stripe Account (for payments)

### 1. Clone Repository
```bash
git clone https://github.com/Prateek8r4-beep/peer-learning-platform.git
cd peer-learning-platform
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run migrate
npm run seed
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

### 4. Docker Setup (Alternative)
```bash
docker-compose up -d
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/peerlearn
MONGODB_URL=mongodb://localhost:27017/peerlearn
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=peerlearn-files

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio (for phone auth)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

## 📁 Project Structure

```
peer-learning-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   └── utils/
│   ├── migrations/
│   ├── seeds/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   └── store/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🚀 Deployment

### Using Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
1. Set up PostgreSQL, MongoDB, Redis on cloud
2. Configure AWS S3 bucket
3. Deploy backend to AWS/DigitalOcean/Heroku
4. Deploy frontend to Vercel/Netlify
5. Set up environment variables
6. Run migrations

## 📱 Features Walkthrough

### Authentication
- Email/Password login
- Phone number OTP verification
- Social login (Google, GitHub)
- Password reset via email

### Study Rooms
- Browse rooms by subject
- Join public rooms instantly
- Create private rooms
- Room-specific chat
- Member management

### File Sharing
- Upload PDFs, DOCs, PPTs
- Preview files in browser
- Download materials
- Search and filter
- Track downloads

### Real-time Chat
- Instant messaging
- Typing indicators
- File attachments
- Message reactions
- Read receipts

### AI Matching
- Find compatible peers
- Based on subjects & proficiency
- Activity-based scoring
- Connection suggestions

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📊 Database Schema

See [DATABASE.md](./DATABASE.md) for complete schema documentation.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 👥 Authors

- **Prateek Chaudhary** - Initial work

## 🙏 Acknowledgments

- Icons from [Lucide Icons](https://lucide.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Inspiration from Discord, Slack, and Notion

## 📞 Support

For support, email prateekpc36@gmail.com or join our Discord server.

---

Made with ❤️ by the Peer Learning Team
