# CodeAlpha_SocialMediaPlatform

A full-stack **Social Media Platform** built for the **CodeAlpha Full Stack Development Internship**. Users can register, post updates, like, comment, follow each other and see a personalized news feed — all backed by a Node/Express API and MongoDB.

## ✨ Features

- 🔐 JWT authentication with bcrypt password hashing
- 👤 User registration, login & logout
- 📝 Create, edit and delete your own posts
- ❤️ Like / unlike posts
- 💬 Comment system (add & delete)
- ➕ Follow / unfollow users
- 🏠 Personalized news feed (your posts + followed users)
- 🔎 Explore page to discover users
- 📱 Fully responsive UI (mobile & desktop)

## 🛠 Technologies

**Frontend:** HTML, CSS, Vanilla JavaScript
**Backend:** Node.js, Express.js
**Database:** MongoDB + Mongoose
**Auth:** JWT, bcryptjs

## 📦 Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/CodeAlpha_SocialMediaPlatform.git
cd CodeAlpha_SocialMediaPlatform

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# then edit .env with your MongoDB URI & JWT secret

# 4. Run in development
npm run dev

# Or production
npm start
```

App runs at **http://localhost:3000**.

## 🔑 Environment Variables

| Variable      | Description                            |
|---------------|----------------------------------------|
| `PORT`        | Server port (default: 3000)            |
| `MONGODB_URI` | MongoDB connection string              |
| `JWT_SECRET`  | Secret key used to sign JWT tokens     |

## 🌐 API Routes

### Auth
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| POST   | `/api/auth/register`  | Register a new user   |
| POST   | `/api/auth/login`     | Login & get JWT       |
| GET    | `/api/auth/me`        | Current logged-in user |

### Users
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/users`              | List users (discover)    |
| GET    | `/api/users/:id`          | Get profile + their posts|
| PUT    | `/api/users/me/update`    | Update own profile       |

### Posts
| Method | Endpoint                  | Description                |
|--------|---------------------------|----------------------------|
| GET    | `/api/posts`              | News feed                  |
| GET    | `/api/posts/explore`      | All recent posts           |
| POST   | `/api/posts`              | Create a post              |
| PUT    | `/api/posts/:id`          | Edit own post              |
| DELETE | `/api/posts/:id`          | Delete own post            |
| POST   | `/api/posts/:id/like`     | Toggle like                |

### Comments
| Method | Endpoint                  | Description       |
|--------|---------------------------|-------------------|
| POST   | `/api/comments/:postId`   | Add comment       |
| DELETE | `/api/comments/:id`       | Delete own comment|

### Follow
| Method | Endpoint              | Description                 |
|--------|-----------------------|-----------------------------|
| POST   | `/api/follow/:id`     | Toggle follow / unfollow    |

## 📁 Project Structure

```
CodeAlpha_SocialMediaPlatform/
├── server.js               # Express entry point
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── models/
│   ├── User.js
│   ├── Post.js
│   └── Comment.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── posts.js
│   ├── comments.js
│   └── follow.js
├── middleware/
│   └── auth.js             # JWT verification
└── public/                 # Frontend (served statically)
    ├── index.html
    ├── styles.css
    └── script.js
```

## 🚀 Deployment

The project works on any Node-hosting platform (Render, Railway, Vercel serverless, etc.). Provide the three env vars and run `npm start`.

## 📄 License

MIT — built as part of the **CodeAlpha Full Stack Development Internship**.
