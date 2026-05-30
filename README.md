# CodeAlpha_TaskFlow

TaskFlow is a full-stack collaborative project management tool built for CodeAlpha Full Stack Development Task 3. It works like a compact Trello/Asana-style board where authenticated users can create group projects, invite members, assign tasks, move cards through workflow columns, and communicate inside task comments.

## Features

- User registration and login with JWT authentication
- Password hashing with bcryptjs
- Group project creation
- Project member invites by username
- Kanban board with To do, In progress, Review, and Done columns
- Task cards with title, description, priority, due date, assignee, creator, and status
- Task status updates from the board
- Task comment threads for collaboration
- MongoDB/Mongoose backend models for users, projects, tasks, and comments
- REST API built with Node.js and Express.js
- Responsive vanilla HTML/CSS/JavaScript frontend
- Vercel-ready serverless API routing

## Tech Stack

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

## Installation

```bash
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Run locally:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## API Routes

### Auth

- `POST /api/auth/register` - Register a user
- `POST /api/auth/login` - Log in and receive a JWT
- `GET /api/auth/me` - Get current authenticated user
- `POST /api/auth/logout` - Stateless logout response

### Users

- `GET /api/users/search?q=username` - Search users to add to projects

### Projects

- `GET /api/projects` - List projects for current user
- `POST /api/projects` - Create a project
- `GET /api/projects/:projectId` - Get one project with tasks
- `POST /api/projects/:projectId/members` - Add a project member by username

### Tasks

- `POST /api/projects/:projectId/tasks` - Create a task
- `PUT /api/projects/:projectId/tasks/:taskId` - Update task fields/status
- `DELETE /api/projects/:projectId/tasks/:taskId` - Delete a task

### Comments

- `GET /api/projects/:projectId/tasks/:taskId/comments` - List task comments
- `POST /api/projects/:projectId/tasks/:taskId/comments` - Add a task comment

## Project Structure

```text
.
|-- api/
|   `-- index.js
|-- middleware/
|   |-- auth.js
|   `-- errorHandler.js
|-- models/
|   |-- Comment.js
|   |-- Project.js
|   |-- Task.js
|   `-- User.js
|-- routes/
|   |-- auth.js
|   |-- projects.js
|   `-- users.js
|-- index.html
|-- script.js
|-- server.js
|-- styles.css
|-- package.json
`-- vercel.json
```

## Deployment

Add the following environment variables in Vercel Project Settings:

- `MONGODB_URI`
- `JWT_SECRET`

Then deploy:

```bash
npx vercel --prod
```
