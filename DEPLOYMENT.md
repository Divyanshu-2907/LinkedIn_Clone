# 🚀 Deployment Guide

This guide covers deploying your LinkedIn Clone to production.

## 📋 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] MongoDB Atlas cluster created
- [ ] Git repository created
- [ ] Code pushed to GitHub

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (Free tier is sufficient)

### Step 2: Configure Database Access
1. Go to **Database Access**
2. Click **Add New Database User**
3. Create username and password (save these!)
4. Set privileges to **Read and write to any database**

### Step 3: Configure Network Access
1. Go to **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
4. Confirm

### Step 4: Get Connection String
1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `linkedin-clone`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/linkedin-clone?retryWrites=true&w=majority
```

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Backend
1. Make sure your code is pushed to GitHub
2. Ensure `package.json` has correct start script:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### Step 2: Deploy to Render
1. Go to [Render](https://render.com)
2. Sign up/Login with GitHub
3. Click **New +** → **Web Service**
4. Connect your repository
5. Configure:
   - **Name:** linkedin-clone-api
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### Step 3: Add Environment Variables
In Render dashboard, add:
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_change_this
PORT=5000
NODE_ENV=production
```

### Step 4: Deploy
1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL (e.g., `https://linkedin-clone-api.onrender.com`)

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
1. Update `frontend/.env.example` with production API URL
2. Make sure code is pushed to GitHub

### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **Add New** → **Project**
4. Import your repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 3: Add Environment Variables
Add in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Step 4: Deploy
1. Click **Deploy**
2. Wait for deployment (2-5 minutes)
3. Your site will be live at `https://your-project.vercel.app`

## 🔄 Alternative: Frontend on Netlify

### Step 1: Deploy to Netlify
1. Go to [Netlify](https://netlify.com)
2. Sign up/Login with GitHub
3. Click **Add new site** → **Import an existing project**
4. Connect to GitHub and select repository
5. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`

### Step 2: Environment Variables
Add in Netlify dashboard:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Step 3: Deploy
Click **Deploy site** and wait for completion

## 🔄 Alternative: Backend on Railway

### Step 1: Deploy to Railway
1. Go to [Railway](https://railway.app)
2. Sign up/Login with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your repository
5. Select the `backend` directory

### Step 2: Add Environment Variables
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
NODE_ENV=production
```

### Step 3: Deploy
Railway will automatically deploy. Copy your backend URL.

## ✅ Post-Deployment Testing

### Test Backend
1. Visit `https://your-backend-url.onrender.com`
2. You should see: `{"message": "LinkedIn Clone API is running"}`

### Test API Endpoints
```bash
# Test signup
curl -X POST https://your-backend-url.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Test Frontend
1. Visit your frontend URL
2. Try to sign up
3. Create a post
4. Test all features

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB Atlas has proper access controls
- [ ] CORS is configured correctly
- [ ] Environment variables are not in code
- [ ] API rate limiting considered
- [ ] HTTPS enabled (automatic on Vercel/Render)

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:

1. **Push to GitHub** → Automatic deployment
2. **Pull Request** → Preview deployment
3. **Merge to main** → Production deployment

## 📊 Monitoring

### Render
- View logs in Render dashboard
- Monitor resource usage
- Set up alerts

### Vercel
- View deployment logs
- Monitor performance
- Analytics available

### MongoDB Atlas
- Monitor database performance
- Set up alerts for storage
- View connection metrics

## 🐛 Troubleshooting

### Backend Issues
- **503 Error:** Backend is starting (wait 1-2 minutes on free tier)
- **Database connection failed:** Check MongoDB Atlas connection string
- **CORS errors:** Verify CORS configuration in backend

### Frontend Issues
- **API calls failing:** Check VITE_API_URL environment variable
- **Build failed:** Check for TypeScript/ESLint errors
- **404 on refresh:** Configure redirects (automatic on Vercel)

### Common Fixes
```bash
# Clear build cache (Vercel)
# Go to Settings → General → Clear Cache

# Redeploy (Render)
# Go to Manual Deploy → Deploy latest commit

# Check logs
# Both platforms have log viewers in dashboard
```

## 💰 Cost Considerations

### Free Tier Limits
- **MongoDB Atlas:** 512MB storage
- **Render:** 750 hours/month, sleeps after 15min inactivity
- **Vercel:** 100GB bandwidth/month
- **Netlify:** 100GB bandwidth/month

### Upgrade When Needed
- More storage needed → Upgrade MongoDB Atlas
- No sleep time needed → Upgrade Render ($7/month)
- More bandwidth → Upgrade Vercel/Netlify

## 🎉 Success!

Your LinkedIn Clone is now live! Share the URL:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend.onrender.com`

## 📝 Maintenance

### Regular Tasks
- Monitor error logs weekly
- Check database storage monthly
- Update dependencies quarterly
- Review security advisories

### Updating Code
1. Make changes locally
2. Test thoroughly
3. Push to GitHub
4. Automatic deployment triggers
5. Verify in production

---

**Congratulations on deploying your app! 🎊**
