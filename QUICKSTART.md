# ⚡ Quick Start Guide

Get the peer-learning platform running in **5 minutes**!

## 🚀 Option 1: Docker (Easiest)

```bash
# Clone and start
git clone https://github.com/Prateek8r4-beep/peer-learning-platform.git
cd peer-learning-platform
docker-compose up -d

# Wait 30 seconds, then open:
# http://localhost:3000
```

**That's it!** 🎉

## 💻 Option 2: Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- MongoDB 6+
- Redis 7+

### Setup (5 commands)

```bash
# 1. Clone
git clone https://github.com/Prateek8r4-beep/peer-learning-platform.git
cd peer-learning-platform

# 2. Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your database URLs
npm run migrate && npm run seed
npm run dev &

# 3. Frontend setup
cd ../frontend
npm install
cp .env.example .env.local
npm run dev

# Open http://localhost:3000
```

## 🎯 First Steps

1. **Register Account** - Click "Get Started"
2. **Choose Auth Method** - Email or Phone
3. **Complete Profile** - Add subjects and bio
4. **Explore Rooms** - Browse study rooms
5. **Upload Notes** - Share study materials
6. **Start Chatting** - Join a room and connect!

## 🔑 Default Credentials

For testing with seeded data:

```
Email: demo@peerlearn.com
Password: Demo123!
```

## 📚 Key URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/health

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill processes
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:5000 | xargs kill -9  # Backend
```

### Database Connection Failed
```bash
# Check services are running
pg_isready              # PostgreSQL
mongosh --eval "db.adminCommand('ping')"  # MongoDB
redis-cli ping          # Redis
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📖 Next Steps

- Read [SETUP.md](./SETUP.md) for detailed setup
- Check [FEATURES.md](./FEATURES.md) for all features
- View [README.md](./README.md) for documentation

## 🎨 Customize

### Change Theme
Edit `frontend/tailwind.config.js`:
```js
colors: {
  primary: "hsl(262 83% 58%)" // Your color
}
```

### Add Subjects
Edit `backend/src/seeds/subjects.json` and run:
```bash
npm run seed
```

## 🚢 Deploy

### Vercel (Frontend)
```bash
cd frontend
vercel
```

### Heroku (Backend)
```bash
cd backend
heroku create
git push heroku main
```

---

**Need help?** Open an issue: https://github.com/Prateek8r4-beep/peer-learning-platform/issues

**Happy Learning! 🎓**
