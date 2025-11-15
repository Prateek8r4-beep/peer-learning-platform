# 🚀 Complete Setup Guide - Peer Learning Platform

This guide will walk you through setting up the entire peer-learning platform from scratch.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **MongoDB** 6+ ([Download](https://www.mongodb.com/try/download/community))
- **Redis** 7+ ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/downloads))
- **Docker** (Optional, for containerized setup) ([Download](https://www.docker.com/))

## 🎯 Quick Start (Docker - Recommended)

The fastest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/Prateek8r4-beep/peer-learning-platform.git
cd peer-learning-platform

# Start all services
docker-compose up -d

# Wait for services to be ready (30-60 seconds)
# Access the application at http://localhost:3000
```

That's it! The application should now be running with:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432
- MongoDB: localhost:27017
- Redis: localhost:6379

## 🔧 Manual Setup (Development)

### Step 1: Clone Repository

```bash
git clone https://github.com/Prateek8r4-beep/peer-learning-platform.git
cd peer-learning-platform
```

### Step 2: Database Setup

#### PostgreSQL Setup

```bash
# Create database
createdb peerlearn

# Or using psql
psql -U postgres
CREATE DATABASE peerlearn;
\q
```

#### MongoDB Setup

MongoDB should be running on default port 27017. No additional setup needed.

#### Redis Setup

Redis should be running on default port 6379. No additional setup needed.

### Step 3: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

**Important Environment Variables to Configure:**

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/peerlearn
MONGODB_URL=mongodb://localhost:27017/peerlearn
REDIS_URL=redis://localhost:6379

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# AWS S3 (Optional - for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=peerlearn-files

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Twilio (Optional - for phone auth)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_VERIFY_SERVICE_SID=your-verify-service-sid

# Email (Optional - for email auth)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Run Database Migrations:**

```bash
npm run migrate
```

**Seed Initial Data:**

```bash
npm run seed
```

**Start Backend Server:**

```bash
npm run dev
```

Backend should now be running on http://localhost:5000

### Step 4: Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Frontend Environment Variables:**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

**Start Frontend Development Server:**

```bash
npm run dev
```

Frontend should now be running on http://localhost:3000

## 🧪 Testing the Setup

1. **Open Browser:** Navigate to http://localhost:3000
2. **Create Account:** Click "Get Started" and register with email or phone
3. **Explore Features:**
   - Browse study rooms
   - Upload notes
   - Join a room and test chat
   - View your profile

## 🔑 Optional Services Setup

### AWS S3 (File Storage)

1. Create AWS account at https://aws.amazon.com
2. Create S3 bucket named `peerlearn-files`
3. Create IAM user with S3 permissions
4. Add credentials to backend `.env`

### Stripe (Payments)

1. Create Stripe account at https://stripe.com
2. Get test API keys from Dashboard
3. Add keys to backend `.env` and frontend `.env.local`
4. Set up webhook endpoint: `http://your-domain/api/payments/webhook`

### Twilio (Phone Authentication)

1. Create Twilio account at https://twilio.com
2. Get Account SID and Auth Token
3. Create Verify Service
4. Add credentials to backend `.env`

### Email (SMTP)

For Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password
3. Add to backend `.env`

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check Redis is running
redis-cli ping
```

### Port Already in Use

```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Migration Errors

```bash
# Drop and recreate database
dropdb peerlearn
createdb peerlearn
npm run migrate
npm run seed
```

## 📚 Development Workflow

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
npm start
```

## 🚀 Deployment

### Deploy to Vercel (Frontend)

```bash
cd frontend
vercel
```

### Deploy to Heroku (Backend)

```bash
cd backend
heroku create peerlearn-api
git push heroku main
```

### Deploy with Docker

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📖 API Documentation

Once the backend is running, API documentation is available at:
- Swagger UI: http://localhost:5000/api-docs
- Postman Collection: Import from `/backend/postman_collection.json`

## 🎨 Customization

### Change Theme Colors

Edit `frontend/tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "hsl(262 83% 58%)", // Change this
      }
    }
  }
}
```

### Add New Subjects

Edit `backend/src/seeds/subjects.json` and run:

```bash
npm run seed
```

### Modify Database Schema

1. Edit `backend/src/migrations/001_initial_schema.sql`
2. Drop and recreate database
3. Run migrations again

## 🆘 Getting Help

- **Issues:** https://github.com/Prateek8r4-beep/peer-learning-platform/issues
- **Discussions:** https://github.com/Prateek8r4-beep/peer-learning-platform/discussions
- **Email:** prateekpc36@gmail.com

## 📝 Next Steps

After setup, check out:
- [User Guide](./docs/USER_GUIDE.md)
- [API Reference](./docs/API.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)

---

**Happy Learning! 🎓**
