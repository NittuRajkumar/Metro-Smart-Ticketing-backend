# Auth App Backend Server

Complete Node.js/Express backend with MongoDB integration for user authentication.

## Features

✅ **User Registration** - Create new user accounts with validation
✅ **User Login** - Authenticate with email and password
✅ **JWT Authentication** - Secure token-based authentication
✅ **Password Hashing** - Bcrypt password hashing with salt
✅ **Email Validation** - Unique email enforcement
✅ **CORS Support** - Cross-origin requests handled
✅ **Error Handling** - Comprehensive error messages
✅ **Input Validation** - Express-validator for data validation

## Installation

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the server directory:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/auth-app

# Server Port
PORT=5000

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Start MongoDB

```bash
# Windows
mongod

# Mac/Linux
brew services start mongodb-community
sudo systemctl start mongodb
```

### 4. Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-03-09T10:30:00Z"
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "message": "Email already registered"
}
```

**Validation Rules:**
- fullName: Required, minimum 2 characters
- email: Required, valid email format, unique
- password: Required, minimum 6 characters
- confirmPassword: Required, must match password

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-03-09T10:30:00Z"
  }
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "message": "Invalid email or password"
}
```

### 3. Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-03-09T10:30:00Z"
  }
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "message": "Invalid token"
}
```

### 4. Health Check

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "message": "Server is running",
  "status": "OK"
}
```

## Project Structure

```
server/
├── models/
│   └── User.js              # MongoDB User schema
├── routes/
│   └── auth.js              # Authentication routes
├── .env                     # Environment variables
├── .env.example             # Example env file
├── .gitignore               # Git ignore patterns
├── package.json             # Dependencies
└── server.js                # Main server file
```

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,                    // MongoDB ID
  fullName: {
    type: String,
    required: true,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /regex/                 // Email regex validation
  },
  password: {
    type: String,
    required: true,
    select: false                  // Hidden by default
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

## Dependencies

### Production
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation
- **dotenv** - Environment variables
- **cors** - Cross-origin support
- **express-validator** - Input validation

### Development
- **nodemon** - Auto-reload on file changes

## Security Considerations

### Implemented Security Features

1. **Password Hashing**
   - Bcrypt with 10 salt rounds
   - Passwords never sent in responses
   - Passwords selected only when needed

2. **JWT Authentication**
   - 7-day token expiration
   - Secure secret key required
   - Token validation on protected routes

3. **Input Validation**
   - Email format validation
   - Password strength requirements
   - Body parameter validation
   - Unique email constraint

4. **CORS Protection**
   - Configured for frontend URL
   - Prevents unauthorized cross-origin requests

### Production Recommendations

1. **Change JWT Secret**
   ```
   Use a strong, minimum 32-character secret
   ```

2. **Use HTTPS**
   ```
   Deploy with SSL/TLS certificates
   ```

3. **Environment Variables**
   ```
   Never commit .env to version control
   Use production secret management services
   ```

4. **Rate Limiting**
   ```
   Consider adding for production:
   npm install express-rate-limit
   ```

5. **CORS Configuration**
   ```
   Specify exact frontend URL instead of localhost
   ```

## Error Handling

The API returns standardized error responses:

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid email or password"
}
```

### 500 Server Error
```json
{
  "message": "Server error during operation"
}
```

## Debugging

### Enable Console Logs

Add debugging to see what's happening:

```javascript
// In auth.js routes
console.log('Register attempt:', { email, fullName });
console.log('User created:', user);
```

### Check MongoDB Connection

```bash
# Connect to MongoDB shell
mongosh

# List databases
show databases

# Use auth database
use auth-app

# Find all users
db.users.find()

# Find specific user
db.users.findOne({ email: "test@example.com" })
```

### Test Endpoints with cURL or Postman

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Issue: MongoDB Connection Failed
**Solution:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify port 27017 is available

### Issue: Port 5000 Already in Use
**Solution:**
- Change PORT in .env
- Or kill process: `lsof -ti:5000 | xargs kill`

### Issue: CORS Error
**Solution:**
- Ensure frontend URL in CORS config
- Check that backend is running
- Verify API endpoint URL

### Issue: JWT Token Invalid
**Solution:**
- Verify JWT_SECRET matches
- Check token hasn't expired
- Regenerate token by logging in again

## API Testing Examples

### Using Thunder Client / Postman

1. **Register New User**
   - Method: POST
   - URL: http://localhost:5000/api/auth/register
   - Body (JSON):
   ```json
   {
     "fullName": "Test User",
     "email": "test@example.com",
     "password": "test123456",
     "confirmPassword": "test123456"
   }
   ```

2. **Login**
   - Method: POST
   - URL: http://localhost:5000/api/auth/login
   - Body (JSON):
   ```json
   {
     "email": "test@example.com",
     "password": "test123456"
   }
   ```

3. **Get User Data**
   - Method: GET
   - URL: http://localhost:5000/api/auth/me
   - Headers: Authorization: Bearer <token_from_login_response>

## Performance Tips

1. **Database Indexing**
   - Email field is indexed for faster lookups
   - Consider adding indexes for frequently queried fields

2. **Connection Pooling**
   - Mongoose handles connection pooling
   - Default max connections: 100

3. **Caching**
   - Consider adding Redis for token validation cache

## Deployment Guide

### Deploy to Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your-production-secret
heroku config:set MONGODB_URI=your-atlas-connection-string

# Deploy
git push heroku main
```

### Deploy to Railway / Render

Similar process:
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Auto-deploys on push

## Support & Issues

For issues or questions:
1. Check the error message carefully
2. Review MongoDB logs
3. Check browser console for frontend errors
4. Verify all environment variables are set
5. Ensure all services are running

---

**Version**: 1.0.0
**Last Updated**: March 2024
