# 🔧 Real Estate Platform - Backend API

Express.js REST API for the Real Estate Platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Run development server
npm run dev

# Run production server
npm start
```

## 📋 Environment Variables

Create a `.env` file with:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/realestate
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/properties` | Get all properties |
| GET | `/api/properties/:id` | Get single property |
| POST | `/api/properties` | Create property (auth) |
| PUT | `/api/properties/:id` | Update property (auth) |
| DELETE | `/api/properties/:id` | Delete property (auth) |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| GET | `/api/leads` | Get leads (auth) |
| POST | `/api/contact` | Submit contact form |

## 🚀 Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set FRONTEND_URL=https://your-frontend.vercel.app

# Deploy
git push heroku main
```

## 📁 Structure

```
backend/
├── config/
│   └── db.js           # MongoDB connection
├── controllers/
│   └── propertyController.js
├── middleware/
│   ├── auth.js         # JWT authentication
│   ├── errorHandler.js
│   └── upload.js       # Multer file upload
├── models/
│   ├── Property.js
│   ├── User.js
│   ├── Lead.js
│   └── ...
├── routes/
│   ├── auth.js
│   ├── properties.js
│   └── ...
├── seeder/
│   └── seedProperties.js
├── server.js           # Entry point
├── package.json
├── Procfile           # Heroku config
└── .env.example
```

## 🛠 Tech Stack

- Node.js 18+
- Express.js 4
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)
- CORS enabled
