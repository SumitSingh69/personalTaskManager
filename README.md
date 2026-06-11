# TaskSphere - Full Stack Personal Task Manager

TaskSphere is a premium glassmorphic personal task manager built to organize goals and streamline daily schedules. I chose to implement the Task Manager exercise, creating a responsive web application that lets users create, edit, toggle, search, reorder via drag-and-drop, and permanently delete tasks. The interface is optimized with modern dark-mode aesthetics, glowing accents, and smooth feedback animations.

## Live Demo Links
- **Local Host:** [http://localhost:5173](http://localhost:5173) *(runs locally after following the running instructions)*
- **Staging / Production:** *Not currently deployed (designed for local deployment).*

---

## Tech Stack

- **Frontend:**
  - **React 19:** Component-based architecture for reactive updates and clean state management.
  - **Vite:** High-performance, modern build tool for lightning-fast Hot Module Replacement (HMR).
  - **Vanilla CSS:** Custom styling for flexible dark-theme design, micro-animations, and glassmorphic card elements.
  - **Lucide React:** Sleek, consistent, outline-based icons.
- **Backend:**
  - **Node.js & Express:** Lightweight, minimalist backend framework for building RESTful APIs.
  - **CORS & dotenv:** Standard middleware for cross-origin resource sharing and environment variable management.
- **Database / Persistence:**
  - **JSON File Persistence (`tasks.json`):** Lightweight, file-based JSON storage to persist user tasks across server restarts without the overhead of database engines.

---

## How to Run Locally

Follow these commands to install dependencies and run both servers locally. Reviewers only need to have **Node.js** (v18+) installed.

### 1. Setup Backend
In a new terminal window, navigate to the `backend` folder, install dependencies, and run:
```bash
cd backend
npm install
npm run dev
```
*(Runs backend server on `http://localhost:5001` by reading the port from `.env`)*

### 2. Setup Frontend
In another terminal window, navigate to the `frontend` folder, install dependencies, and run:
```bash
cd frontend
npm install
npm run dev
```
*(Launches the React application on `http://localhost:5173`)*

---

## API Documentation

All request bodies and responses are formatted as JSON.

### 1. Get All Tasks
- **Method:** `GET`
- **Path:** `/api/tasks`
- **Response Shape:**
  ```json
  [
    {
      "id": "uuid-string",
      "title": "Task title",
      "description": "Optional description",
      "dueDate": "YYYY-MM-DD",
      "completed": false,
      "createdAt": "2026-06-11T16:00:00.000Z"
    }
  ]
  ```

### 2. Create Task
- **Method:** `POST`
- **Path:** `/api/tasks`
- **Request Body:**
  ```json
  {
    "title": "New Task Title",
    "description": "Optional Description",
    "dueDate": "YYYY-MM-DD"
  }
  ```
- **Response Shape:**
  ```json
  {
    "id": "uuid-string",
    "title": "New Task Title",
    "description": "Optional Description",
    "dueDate": "YYYY-MM-DD",
    "completed": false,
    "createdAt": "2026-06-11T16:01:00.000Z"
  }
  ```

### 3. Update Task
- **Method:** `PUT`
- **Path:** `/api/tasks/:id`
- **Request Body:** (All fields are optional)
  ```json
  {
    "title": "Updated Title",
    "description": "Updated Description",
    "dueDate": "YYYY-MM-DD",
    "completed": true
  }
  ```
- **Response Shape:**
  ```json
  {
    "id": "uuid-string",
    "title": "Updated Title",
    "description": "Updated Description",
    "dueDate": "YYYY-MM-DD",
    "completed": true,
    "createdAt": "2026-06-11T16:00:00.000Z"
  }
  ```

### 4. Reorder Tasks
- **Method:** `PUT`
- **Path:** `/api/tasks/reorder`
- **Request Body:**
  ```json
  {
    "taskIds": ["id-3", "id-1", "id-2"]
  }
  ```
- **Response Shape:** Array of all reordered task objects matching the sent order.

### 5. Delete Task
- **Method:** `DELETE`
- **Path:** `/api/tasks/:id`
- **Response Shape:**
  ```json
  {
    "message": "Task deleted successfully",
    "deletedTask": { "id": "uuid-string", "title": "Deleted Task title" }
  }
  ```

---

## Project Structure

```
taskManager/
├── backend/
│   ├── data/
│   │   └── tasks.json      # File database for persisting tasks
│   ├── .env                # Port configuration (PORT=5001)
│   ├── server.js           # REST API server code
│   └── package.json        # Backend scripts and Node modules configuration
├── frontend/
│   ├── src/
│   │   ├── assets/         # Project images and SVG assets
│   │   ├── App.jsx         # Main application component & layout
│   │   ├── index.css       # Core stylesheet (Glassmorphic dark design tokens)
│   │   └── main.jsx        # App entry point
│   ├── vite.config.js      # Dev server configuration and api proxying (port 5173)
│   └── package.json        # Frontend configuration
└── README.md               # Main project documentation (this file)
```

---

## Next Steps

### What was skipped (Chose not to do):
1. **User Authentication:** Skipped implementing auth systems since the task manager is designed for a single-user sandbox demo.
2. **Category / Tags filtering:** Opted not to add tag management to keep the creation sidebar simple, clean, and focused on core attributes.

### Future roadmap (What I would build next):
1. **Multi-list/Category Support:** Introduce list selectors (e.g. "Work", "Personal", "Fitness") to group tasks.
2. **Push Notifications / Reminders:** Add scheduled browser notifications for tasks approaching their due date.
3. **Subtasks / Checklists:** Support breaking down tasks into smaller, nested items inside the details drawer.
