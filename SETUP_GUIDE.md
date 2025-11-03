# 🚀 Quick Setup Guide

This guide will help you get the LinkedIn Clone up and running in minutes.

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js (v16+) - Check with `node --version`
- ✅ npm or yarn - Check with `npm --version`
- ✅ MongoDB installed locally OR MongoDB Atlas account

## Step-by-Step Setup

### 1️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

### 2️⃣ Configure Backend Environment

Create `backend/.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/linkedin-clone
JWT_SECRET=my_super_secret_jwt_key_12345
PORT=5000
NODE_ENV=development
```

**Using MongoDB Atlas?** Replace MONGODB_URI with:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/linkedin-clone
```

### 3️⃣ Start Backend Server

```bash
# From backend directory
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

### 4️⃣ Install Frontend Dependencies

Open a **new terminal**:

```bash
cd frontend
npm install
```

### 5️⃣ Configure Frontend Environment

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6️⃣ Start Frontend Server

```bash
# From frontend directory
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 7️⃣ Open Application

Open your browser and go to: **http://localhost:3000**

## 🎉 First Steps

1. **Create an account** - Click "Sign up" and register
2. **Create your first post** - Share something with the community
3. **Explore features** - Like, comment, and interact with posts

## 🐛 Troubleshooting

### Backend won't start
- **Check MongoDB:** Make sure MongoDB is running
  ```bash
  # For local MongoDB
  mongod
  ```
- **Check port 5000:** Make sure nothing else is using port 5000
- **Check .env file:** Verify all environment variables are set

### Frontend won't start
- **Check port 3000:** Make sure port 3000 is available
- **Check .env file:** Verify VITE_API_URL is correct
- **Clear cache:** Delete `node_modules` and run `npm install` again

### Can't connect to database
- **Local MongoDB:** Start MongoDB service
  ```bash
  # Windows
  net start MongoDB
  
  # Mac
  brew services start mongodb-community
  
  # Linux
  sudo systemctl start mongod
  ```
- **MongoDB Atlas:** 
  - Check your connection string
  - Whitelist your IP address in Atlas dashboard
  - Verify username and password

### CORS errors
- Make sure backend is running on port 5000
- Check that VITE_API_URL in frontend/.env is correct
- Restart both servers

## 📝 Quick Commands Reference

### Backend
```bash
npm run dev      # Start development server
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🔐 Test Credentials

After creating your first account, you can use it to login. There are no pre-seeded accounts.

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API endpoints
- Customize the styling
- Add new features

## 💡 Tips

- Keep both terminals open (backend and frontend)
- Use `Ctrl+C` to stop servers
- Check browser console for frontend errors
- Check terminal for backend errors
- Use MongoDB Compass to view database

## 🆘 Need Help?

If you're still having issues:
1. Check all environment variables are set correctly
2. Make sure all dependencies are installed
3. Verify MongoDB is running
4. Check for error messages in terminal and browser console
5. Try restarting both servers

---

**Happy Coding! 🚀**
