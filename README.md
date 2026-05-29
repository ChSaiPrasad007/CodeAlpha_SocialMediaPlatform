# CodeAlpha_SocialMediaPlatform

SocialSphere is the application built inside the `CodeAlpha_SocialMediaPlatform` project for the CodeAlpha Full Stack Development Internship. It uses a vanilla HTML, CSS, and JavaScript frontend with a Node.js, Express.js, MongoDB, and Mongoose backend. Authentication is handled with JWT tokens and bcrypt password hashing.

## Project Overview

The application allows users to register, log in, create posts, edit or delete their own posts, like posts, comment on posts, follow other users, and view a personalized home feed. The interface is responsive and works across desktop and mobile screens.

## Features

- User registration with secure password hashing
- User login and stateless logout with JWT authentication
- Authenticated user profile pages
- Create, edit, and delete own posts
- Like and unlike posts
- Comment creation and deletion
- Follow and unfollow users
- Personalized home feed with followed users and own posts
- User search
- Responsive mobile-friendly design
- RESTful Express API
- Centralized authentication and error handling middleware

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens
- bcryptjs
- Vercel

## Installation Steps

1. Clone the repository.

   ```bash
   git clone https://github.com/ChSaiPrasad007/CodeAlpha_SocialMediaPlatform.git
   cd CodeAlpha_SocialMediaPlatform
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example`.

   ```bash
   cp .env.example .env
   ```

4. Add your MongoDB connection string and JWT secret to `.env`.

5. Start the server.

   ```bash
   npm start
   ```

6. Open the app at `http://localhost:3000`.

## Environment Variables

```env
PORT=3000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

## API Routes

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in and receive a JWT
- `GET /api/auth/me` - Get the authenticated user
- `POST /api/auth/logout` - Log out on the client

### Users

- `GET /api/users/search?q=query` - Search users by name or username
- `GET /api/users/:username` - Get a user profile
- `GET /api/users/:username/posts` - Get posts for a profile
- `POST /api/users/:id/follow` - Follow a user
- `DELETE /api/users/:id/follow` - Unfollow a user

### Posts

- `GET /api/posts` - Get the authenticated user's feed
- `POST /api/posts` - Create a post
- `PUT /api/posts/:id` - Edit own post
- `DELETE /api/posts/:id` - Delete own post
- `POST /api/posts/:id/like` - Like a post
- `DELETE /api/posts/:id/like` - Unlike a post

### Comments

- `GET /api/posts/:postId/comments` - Get comments for a post
- `POST /api/posts/:postId/comments` - Add a comment
- `DELETE /api/comments/:id` - Delete own comment or a comment on own post

## Database Collections

- `users` - account credentials, profile details, and secure password hashes
- `posts` - user-authored posts and like references
- `comments` - comments linked to posts and authors
- `follows` - follower and following relationships between users

## Deployment Instructions

1. Create a MongoDB Atlas database or provide another MongoDB connection string.
2. In MongoDB Atlas, open Network Access and allow your deployed server to connect. For Vercel, use an allowed deployment egress setup or add `0.0.0.0/0` for internship/demo use.
3. Add the required environment variables in Vercel Project Settings:

   - `MONGODB_URI`
   - `JWT_SECRET`

4. Deploy to Vercel from the project root.

   ```bash
   vercel --prod
   ```

The included `vercel.json` routes static frontend files and all `/api/*` requests to the Express serverless adapter in `api/index.js`.

## Project Structure

```text
.
├── api/
│   └── index.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── Comment.js
│   ├── Follow.js
│   ├── Post.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── comments.js
│   ├── posts.js
│   └── users.js
├── .env.example
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── script.js
├── server.js
├── styles.css
└── vercel.json
```
