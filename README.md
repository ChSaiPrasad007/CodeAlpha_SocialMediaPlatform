<<<<<<< HEAD
# CodeAlpha Social Media Platform

A complete MERN-style social media web application built with React, Vite, Tailwind CSS, Node.js, Express, MongoDB, Mongoose, JWT authentication, and bcrypt password hashing.

The app includes authentication, user profiles, post creation, image previews, comments, likes, follow/unfollow behavior, responsive navigation, production environment configuration, and automated backend/frontend checks.

## Features

- Register, login, logout, JWT authentication, and protected routes
- Password hashing with bcryptjs
- Edit profile, upload profile picture, and add a bio
- Follow and unfollow users with follower/following counts
- Create, edit, delete, and view posts
- Upload an image with a post
- Like/unlike posts
- Add comments to posts
- Responsive feed, profile, settings, login, and register screens
- Loading states, error handling, and toast notifications
- MongoDB Atlas ready backend
- Vercel ready frontend
- Render ready backend deployment blueprint
- GitHub Actions CI for backend tests and frontend build

## Tech Stack

Frontend:

- React.js
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- React Hot Toast
- Lucide React icons

Backend:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- dotenv
- cors

Testing and checks:

- Vitest
- Supertest
- mongodb-memory-server
- GitHub Actions

## Project Structure

```text
CodeAlpha_SocialMediaPlatform/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vercel.json
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── app.js
│   ├── server.js
│   └── package.json
├── screenshots/
├── .github/workflows/ci.yml
├── .gitignore
├── render.yaml
└── README.md
```

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/codealpha_social_media
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

For local development, the backend can start with an in-memory MongoDB database if `MONGODB_URI` is not set. In production, `MONGODB_URI` is required.

## Installation

Clone the repository and install dependencies separately:

```bash
cd CodeAlpha_SocialMediaPlatform/backend
npm install

cd ../frontend
npm install
```

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Open the frontend at:

```text
http://localhost:5173
```

## API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Users:

- `GET /api/users`
- `GET /api/users/profile`
- `GET /api/users/profile/:id`
- `PUT /api/users/profile`
- `PUT /api/users/:id/follow`
- `PUT /api/users/:id/unfollow`

Posts:

- `POST /api/posts`
- `GET /api/posts/feed`
- `GET /api/posts/user/:userId`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `PUT /api/posts/:id/like`
- `POST /api/posts/:id/comment`

Health:

- `GET /api/health`

## Testing

Run backend integration tests:

```bash
cd backend
npm test
```

Build the frontend:

```bash
cd frontend
npm run build
```

The backend test suite verifies:

- Database connection
- User registration
- User login
- Post creation and persistence
- Comment creation and persistence
- Like/unlike behavior
- Follow/unfollow behavior

## Deployment Guide

### Database: MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Add your IP address or allow Render access.
4. Copy the connection string.
5. Use it as `MONGODB_URI` in Render.

### Backend: Render

1. Push this project to GitHub.
2. Create a new Render Web Service from the repository.
3. Set the root directory to `backend`, or use the included `render.yaml` blueprint from the repository root.
4. Set build command:

```bash
npm ci
```

5. Set start command:

```bash
npm start
```

6. Add environment variables:

```env
NODE_ENV=production
MONGODB_URI=<your MongoDB Atlas URI>
JWT_SECRET=<your long random secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=<your Vercel frontend URL>
```

### Frontend: Vercel

1. Import the GitHub repository in Vercel.
2. Set the project root directory to `frontend`.
3. Set build command:

```bash
npm run build
```

4. Set output directory:

```text
dist
```

5. Add environment variable:

```env
VITE_API_URL=<your Render backend URL>/api
```

## GitHub Repo Setup

The initial local Git setup is:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

To push after creating an empty GitHub repository:

```bash
git remote add origin <your-github-repository-url>
git push -u origin main
```

## Screenshots

Add screenshots to the `screenshots/` folder after running the project locally or after deployment. Recommended screenshots:

- Register page
- Login page
- Feed page
- Profile page
- Edit profile page
- Mobile layout

## Important Files

- `backend/server.js`: starts the API server
- `backend/app.js`: Express app configuration and route mounting
- `backend/models/User.js`: user model with followers and following
- `backend/models/Post.js`: post model with likes and comments
- `backend/models/Comment.js`: comment model
- `frontend/src/context/AuthContext.jsx`: auth state and session management
- `frontend/src/pages/Feed.jsx`: feed, create post, like, comment, edit, delete
- `frontend/src/pages/Profile.jsx`: profile, posts, follow/unfollow
- `frontend/src/pages/EditProfile.jsx`: profile editing and picture upload

## Author

Built for CodeAlpha by the project author.

## License

MIT
=======
# CodeAlpha_SocialMediaPlatform
# CodeAlpha Social Media Platform  A complete MERN-style social media web application built with React, Vite, Tailwind CSS, Node.js, Express, MongoDB, Mongoose, JWT authentication, and bcrypt password hashing.  The app includes authentication, user profiles, post creation, image previews, comments, likes, follow/unfollow 
>>>>>>> 294d7cb2e6c69e8109c2b43006da58c3d9ae010d
