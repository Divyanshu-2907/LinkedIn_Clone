# 🚀 LinkedIn Clone - Full Stack Social Media Platform

A complete full-stack social media web application built with the MERN stack (MongoDB, Express.js, React, Node.js), featuring user authentication, post creation, real-time feed updates, likes, comments, and more.

![LinkedIn Clone](https://img.shields.io/badge/LinkedIn-Clone-0A66C2?style=for-the-badge&logo=linkedin)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge)

## ✨ Features

### Core Features
- ✅ **User Authentication**
  - Email and password-based registration
  - Secure login with JWT tokens
  - Session management
  - Protected routes
  - Automatic logout on token expiration

- ✅ **Post Management**
  - Create posts with text content (1-500 characters)
  - Optional image URL support
  - Edit your own posts
  - Delete your own posts
  - Real-time feed updates

- ✅ **Social Interactions**
  - Like/Unlike posts
  - Comment on posts
  - Delete your own comments
  - View like and comment counts

- ✅ **User Experience**
  - Global feed with all posts
  - Posts sorted by latest first
  - User profile page with statistics
  - Responsive design (mobile-first)
  - Beautiful UI with Tailwind CSS
  - Toast notifications for user feedback
  - Loading states and error handling

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **State Management:** React Context API
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Date Formatting:** date-fns

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **CORS:** Enabled for cross-origin requests

## 📁 Project Structure

```
linkedin-clone/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Navigation bar with user info
│   │   │   ├── PostCard.jsx         # Individual post display
│   │   │   ├── PostForm.jsx         # Create new post form
│   │   │   └── ProtectedRoute.jsx   # Route protection wrapper
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Signup.jsx           # Registration page
│   │   │   ├── Feed.jsx             # Main feed page
│   │   │   └── Profile.jsx          # User profile page
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication context
│   │   ├── services/
│   │   │   └── api.js               # API service layer
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   └── Post.js                  # Post schema
│   ├── routes/
│   │   ├── auth.js                  # Authentication routes
│   │   └── posts.js                 # Post routes
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication middleware
│   ├── config/
│   │   └── db.js                    # Database connection
│   ├── server.js                    # Express server setup
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd linkedin-clone
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Create Backend Environment File**
Create a `.env` file in the `backend` directory:
```env
MONGODB_URI=mongodb://localhost:27017/linkedin-clone
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/linkedin-clone?retryWrites=true&w=majority
```

4. **Start Backend Server**
```bash
npm run dev
```
Backend will run on `http://localhost:5000`

5. **Frontend Setup**
Open a new terminal:
```bash
cd frontend
npm install
```

6. **Create Frontend Environment File**
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

7. **Start Frontend Development Server**
```bash
npm run dev
```
Frontend will run on `http://localhost:3000`

8. **Access the Application**
Open your browser and navigate to `http://localhost:3000`

## 📡 API Endpoints

### Authentication Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| POST | `/api/auth/logout` | Logout user | Public |

### Posts Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/posts` | Get all posts | Public |
| POST | `/api/posts` | Create new post | Private |
| PUT | `/api/posts/:id` | Update post | Private (Author) |
| DELETE | `/api/posts/:id` | Delete post | Private (Author) |
| POST | `/api/posts/:id/like` | Like/Unlike post | Private |
| POST | `/api/posts/:id/comment` | Add comment | Private |
| DELETE | `/api/posts/:postId/comment/:commentId` | Delete comment | Private (Author) |

## 🎨 Features Showcase

### Authentication
- Secure registration with email validation
- Password strength requirements (min 6 characters)
- JWT-based authentication
- Automatic avatar generation using UI Avatars
- Session persistence with localStorage

### Post Creation
- Rich text area with character counter (500 max)
- Optional image URL support with preview
- Real-time validation
- Success notifications
- Automatic feed refresh

### Feed Display
- Chronological sorting (newest first)
- Infinite scroll-ready design
- Like and comment counts
- Relative timestamps ("2 hours ago")
- Refresh button for manual updates

### Social Features
- Like/Unlike with visual feedback
- Nested comments with timestamps
- Edit/Delete for own content
- User attribution with avatars
- Comment threading

### User Profile
- Personal statistics dashboard
- Posts count
- Total likes received
- Total comments
- Filtered view of user's posts

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- CORS configuration
- XSS protection through React
- MongoDB injection prevention

## 🎯 Best Practices Implemented

- **Code Organization:** Modular structure with separation of concerns
- **Error Handling:** Comprehensive error handling on both client and server
- **Validation:** Client-side and server-side validation
- **User Feedback:** Toast notifications for all actions
- **Loading States:** Loading indicators for async operations
- **Responsive Design:** Mobile-first approach with Tailwind CSS
- **Clean Code:** Consistent naming conventions and code formatting
- **RESTful API:** Standard REST conventions for API design

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- 📱 Mobile devices (320px and up)
- 📱 Tablets (768px and up)
- 💻 Desktops (1024px and up)
- 🖥️ Large screens (1280px and up)

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the frontend**
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel**
```bash
npm i -g vercel
vercel
```

3. **Environment Variables**
Add `VITE_API_URL` pointing to your backend URL

### Backend Deployment (Render/Railway)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Render**
- Connect your GitHub repository
- Set environment variables (MONGODB_URI, JWT_SECRET, PORT)
- Deploy

3. **MongoDB Atlas Setup**
- Create a cluster on MongoDB Atlas
- Whitelist all IPs (0.0.0.0/0) for production
- Get connection string and add to environment variables

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration with valid/invalid data
- [ ] User login with correct/incorrect credentials
- [ ] Create post with text only
- [ ] Create post with text and image
- [ ] Edit own post
- [ ] Delete own post
- [ ] Like/Unlike posts
- [ ] Add comments
- [ ] Delete own comments
- [ ] View profile page
- [ ] Logout functionality
- [ ] Protected route redirection

## 🐛 Known Issues & Future Improvements

### Future Enhancements
- [ ] File upload for images (not just URLs)
- [ ] User profile editing
- [ ] Follow/Unfollow users
- [ ] Personalized feed based on connections
- [ ] Search functionality
- [ ] Hashtags support
- [ ] Direct messaging
- [ ] Notifications system
- [ ] Email verification
- [ ] Password reset functionality
- [ ] OAuth integration (Google, LinkedIn)
- [ ] Post sharing
- [ ] Rich text editor
- [ ] Video support
- [ ] Dark mode

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created with ❤️ as a demonstration of full-stack development skills.

## 🙏 Acknowledgments

- LinkedIn for design inspiration
- MERN stack community
- Tailwind CSS for amazing utility classes
- Lucide React for beautiful icons

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Happy Coding! 🚀**
