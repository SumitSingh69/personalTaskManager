import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ESM directory path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

app.use(cors());
app.use(express.json());

// Helper to read tasks
async function readTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, start with an empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Helper to write tasks
async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

// GET all tasks (in stored order)
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error reading tasks:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// POST create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const tasks = await readTasks();
    const newTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: (description || '').trim(),
      dueDate: dueDate || '',
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    await writeTasks(tasks);

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT reorder tasks
app.put('/api/tasks/reorder', async (req, res) => {
  try {
    const { taskIds } = req.body;
    if (!Array.isArray(taskIds)) {
      return res.status(400).json({ error: 'taskIds array is required' });
    }

    const tasks = await readTasks();
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const reorderedTasks = [];

    for (const id of taskIds) {
      if (taskMap.has(id)) {
        reorderedTasks.push(taskMap.get(id));
        taskMap.delete(id);
      }
    }

    // Append any tasks that weren't included in the taskIds list
    for (const remainingTask of taskMap.values()) {
      reorderedTasks.push(remainingTask);
    }

    await writeTasks(reorderedTasks);
    res.json(reorderedTasks);
  } catch (error) {
    console.error('Error reordering tasks:', error);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

// PUT update a task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, completed } = req.body;

    const tasks = await readTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const existingTask = tasks[taskIndex];

    // Build the updated task, validating and preserving fields
    const updatedTask = {
      ...existingTask,
      title: typeof title !== 'undefined' ? title.trim() : existingTask.title,
      description: typeof description !== 'undefined' ? description.trim() : existingTask.description,
      dueDate: typeof dueDate !== 'undefined' ? dueDate : existingTask.dueDate,
      completed: typeof completed !== 'undefined' ? Boolean(completed) : existingTask.completed
    };

    if (typeof title !== 'undefined' && (!title || title.trim() === '')) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    tasks[taskIndex] = updatedTask;
    await writeTasks(tasks);

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await readTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    await writeTasks(tasks);

    res.json({ message: 'Task deleted successfully', deletedTask });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
