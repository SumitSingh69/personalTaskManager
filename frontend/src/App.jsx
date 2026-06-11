import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Edit3, 
  Trash2, 
  Plus, 
  X, 
  AlertTriangle, 
  ListTodo,
  Loader2,
  Clock
} from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Editing State
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  // Filter State
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  
  // Deletion Confirmation Modal State
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the task server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (editingTaskId) {
        // Update task
        const response = await fetch(`/api/tasks/${editingTaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, dueDate })
        });
        
        if (!response.ok) throw new Error('Failed to update task');
        const updatedTask = await response.json();
        
        setTasks(tasks.map(t => t.id === editingTaskId ? updatedTask : t));
        cancelEdit();
      } else {
        // Add task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, dueDate })
        });
        
        if (!response.ok) throw new Error('Failed to create task');
        const newTask = await response.json();
        
        setTasks([newTask, ...tasks]);
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save task. Please try again.');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });

      if (!response.ok) throw new Error('Failed to toggle status');
      const updatedTask = await response.json();
      
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    } catch (err) {
      console.error(err);
      setError('Failed to update task status.');
    }
  };

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate || '');
  };

  const cancelEdit = () => {
    resetForm();
    setEditingTaskId(null);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
  };

  const triggerDeleteConfirmation = (id) => {
    setConfirmDeleteId(id);
  };

  const handleDeleteTask = async () => {
    if (!confirmDeleteId) return;

    try {
      const response = await fetch(`/api/tasks/${confirmDeleteId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete task');
      
      setTasks(tasks.filter(t => t.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      
      // If we deleted the task we were currently editing, reset the form
      if (confirmDeleteId === editingTaskId) {
        cancelEdit();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete task.');
    }
  };

  // Helper to determine task overdue status
  const isOverdue = (dueDateStr, completed) => {
    if (completed || !dueDateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    return due < today;
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Filter logic
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all'
  });

  const totalTasksCount = tasks.length;
  const activeTasksCount = tasks.filter(t => !t.completed).length;
  const completedTasksCount = tasks.filter(t => t.completed).length;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">
            <ListTodo size={24} />
          </div>
          <div className="brand-title">
            <h1>TaskSphere</h1>
            <p>Manage your goals, simplify your life</p>
          </div>
        </div>

        <div className="task-stats">
          <div className="stat-badge">
            <span>Active:</span>
            <span className="stat-number">{activeTasksCount}</span>
          </div>
          <div className="stat-badge">
            <span>Completed:</span>
            <span className="stat-number">{completedTasksCount}</span>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="panel-card" style={{ borderColor: 'var(--accent-rose)', backgroundColor: 'rgba(244, 63, 94, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <AlertTriangle size={18} />
              {error}
            </span>
            <button className="btn-icon-only delete" onClick={() => setError(null)}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="dashboard-grid">
        {/* Left Panel: Creation / Editing Form */}
        <section className="panel-card">
          <h2 className="panel-title">
            {editingTaskId ? (
              <>
                <Edit3 size={18} style={{ color: 'var(--accent-cyan)' }} />
                Edit Task
              </>
            ) : (
              <>
                <Plus size={18} style={{ color: 'var(--accent-purple)' }} />
                New Task
              </>
            )}
          </h2>

          <form onSubmit={handleFormSubmit} className="task-form">
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Title *</label>
              <input
                id="task-title"
                type="text"
                className="form-input"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc"
                className="form-textarea"
                placeholder="Optional details or context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={400}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-date">Due Date</label>
              <input
                id="task-date"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editingTaskId ? 'Save Changes' : 'Create Task'}
              </button>
              {editingTaskId && (
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Right Panel: Tasks List */}
        <section>
          {/* Toolbar Filters */}
          <div className="toolbar">
            <div className="filter-tabs">
              <button 
                id="filter-all"
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({totalTasksCount})
              </button>
              <button 
                id="filter-active"
                className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                Active ({activeTasksCount})
              </button>
              <button 
                id="filter-completed"
                className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed ({completedTasksCount})
              </button>
            </div>
          </div>

          {/* List Content */}
          {loading ? (
            <div className="empty-state" style={{ borderStyle: 'solid' }}>
              <Loader2 className="empty-icon" size={32} style={{ animation: 'spin 1.5s linear infinite' }} />
              <p>Fetching tasks from server...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <ListTodo className="empty-icon" size={36} />
              <h3>No tasks found</h3>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>
                {filter === 'all' 
                  ? "Start by typing a title in the sidebar to create your first task!" 
                  : `You don't have any ${filter} tasks right now.`}
              </p>
            </div>
          ) : (
            <div className="task-list">
              {filteredTasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.completed);
                return (
                  <div 
                    key={task.id} 
                    className={`task-card ${task.completed ? 'completed' : 'active'}`}
                  >
                    <div className="checkbox-container">
                      <button 
                        className="checkbox-custom" 
                        onClick={() => handleToggleComplete(task)}
                        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                      >
                        <CheckCircle2 size={16} style={{ strokeWidth: 3 }} />
                      </button>
                    </div>

                    <div className="task-content-wrapper">
                      <h3 className="task-title">{task.title}</h3>
                      {task.description && (
                        <p className="task-desc">{task.description}</p>
                      )}
                      
                      <div className="task-meta">
                        {task.dueDate && (
                          <div className={`meta-item due-date ${overdue ? 'overdue' : ''}`}>
                            <Calendar size={13} />
                            <span>
                              {overdue ? 'Overdue: ' : 'Due: '}
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        )}
                        <div className="meta-item">
                          <Clock size={13} />
                          <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="task-actions">
                      <button 
                        className="btn-icon-only edit" 
                        onClick={() => startEdit(task)}
                        aria-label="Edit task"
                        disabled={task.completed}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        className="btn-icon-only delete" 
                        onClick={() => triggerDeleteConfirmation(task.id)}
                        aria-label="Delete task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {confirmDeleteId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header danger">
              <AlertTriangle size={22} />
              Confirm Deletion
            </div>
            <div className="modal-body">
              Are you sure you want to permanently delete this task? This action is irreversible.
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteTask}>
                Yes, Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spin Animation Injection */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
