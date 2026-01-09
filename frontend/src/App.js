import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, Loader, Moon, Sun, Flag, Edit2, X, Maximize2, Minimize2 } from "lucide-react";
import clsx from "clsx";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const priorityColors = {
  high: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: 'text-red-400', label: 'High' },
  medium: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', text: 'text-amber-400', label: 'Medium' },
  low: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', text: 'text-green-400', label: 'Low' }
};

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: "bg-emerald-500/20 border-emerald-500/30",
    delete: "bg-red-500/20 border-red-500/30",
    info: "bg-teal-500/20 border-teal-500/30"
  }[type];

  const textColor = {
    success: "text-emerald-300",
    delete: "text-red-300",
    info: "text-teal-300"
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 20, x: 100 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        "fixed bottom-6 right-6 px-4 py-3 rounded-lg border backdrop-blur-lg",
        bgColor
      )}
      style={{
        background: type === 'success' ? 'rgba(5, 150, 105, 0.15)' : 
                   type === 'delete' ? 'rgba(239, 68, 68, 0.15)' :
                   'rgba(50, 184, 198, 0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      <p className={clsx("text-sm font-medium", textColor)}>
        {message}
      </p>
    </motion.div>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          className="h-14 bg-slate-700/20 dark:bg-slate-700/20 rounded-lg"
        />
      ))}
    </div>
  );
}

function FancySwitch({ enabled, onChange, darkMode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onChange}
      className={clsx(
        "relative inline-flex items-center h-8 w-14 rounded-full transition-all duration-300",
        enabled
          ? darkMode ? 'bg-slate-700 shadow-lg shadow-amber-400/20' : 'bg-amber-200 shadow-lg shadow-amber-400/20'
          : darkMode ? 'bg-slate-800 shadow-lg shadow-indigo-400/20' : 'bg-slate-300 shadow-lg shadow-indigo-400/20'
      )}
    >
      <motion.div
        animate={{ x: enabled ? 28 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={clsx(
          "w-6 h-6 rounded-full transition-colors flex items-center justify-center",
          enabled
            ? darkMode ? 'bg-white' : 'bg-white'
            : darkMode ? 'bg-indigo-400' : 'bg-slate-100'
        )}
      >
        {enabled ? (
          <Sun className="w-4 h-4 text-amber-500" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600" />
        )}
      </motion.div>
    </motion.button>
  );
}

function UpdateModal({ task, onClose, onUpdate, darkMode }) {
  const [title, setTitle] = useState(task?.title || "");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleUpdate = async () => {
    if (!title.trim()) return;
    await onUpdate(task.id, title, priority);
    onClose();
  };

  const cardBg = darkMode ? 'rgba(13, 17, 23, 0.4)' : 'rgba(255, 255, 255, 0.4)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "rounded-2xl border w-full max-w-lg",
          darkMode ? 'border-teal-500/20' : 'border-teal-500/30'
        )}
        style={{
          background: cardBg,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          height: isExpanded ? '100vh' : 'auto'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={clsx(
            "flex items-center justify-between p-6 border-b",
            darkMode ? 'border-teal-500/10' : 'border-teal-500/20'
          )}>
            <h3 className="text-lg font-bold text-teal-300">Edit Task</h3>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <X className="w-5 h-5 text-red-400" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Task Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className={clsx(
                  "w-full px-4 py-3 rounded-lg bg-slate-800/50 border focus:outline-none focus:border-teal-500 transition-colors text-white",
                  darkMode ? 'border-slate-700/50' : 'border-slate-400/50'
                )}
                placeholder="Task title..."
              />
              <p className="text-xs text-slate-500 mt-1">{title.length}/100</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={clsx(
                  "w-full px-4 py-3 rounded-lg bg-slate-800/50 border focus:outline-none focus:border-teal-500 transition-colors text-white",
                  darkMode ? 'border-slate-700/50' : 'border-slate-400/50'
                )}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className={clsx(
            "flex gap-3 p-6 border-t",
            darkMode ? 'border-teal-500/10' : 'border-teal-500/20'
          )}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-white transition-colors font-medium"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpdate}
              disabled={!title.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 disabled:opacity-50 text-white transition-colors font-medium"
            >
              Update
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TaskItem({ task, onToggle, onDelete, onEdit, darkMode }) {
  const cardBg = darkMode ? 'rgba(13, 17, 23, 0.4)' : 'rgba(255, 255, 255, 0.4)';
  const textColor = darkMode ? 'text-slate-50' : 'text-slate-900';

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const color = priorityColors[task.priority] || priorityColors.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -30, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div
        className={clsx(
          "rounded-xl p-4 border transition-all duration-300 hover:shadow-lg",
          darkMode
            ? 'border-teal-500/20 hover:border-teal-500/40'
            : 'border-teal-500/30 hover:border-teal-500/50'
        )}
        style={{
          background: cardBg,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: darkMode ? '0 0 0 1px rgba(50, 184, 198, 0.1) inset' : '0 0 0 1px rgba(50, 184, 198, 0.15) inset'
        }}
      >
        <div className="flex items-start gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggle(task)}
            className="flex-shrink-0 focus:outline-none transition-transform mt-1"
          >
            <motion.div
              animate={{ rotate: task.completed ? 360 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
              ) : (
                <Circle className={clsx("w-5 h-5 transition-colors", darkMode ? 'text-slate-600 hover:text-teal-300' : 'text-slate-400 hover:text-teal-600')} />
              )}
            </motion.div>
          </motion.button>

          <div className="flex-1 min-w-0">
            <p className={clsx(
              "text-sm font-medium transition-all duration-200",
              task.completed
                ? darkMode ? 'line-through text-slate-500' : 'line-through text-slate-600'
                : textColor
            )}>
              {task.title}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={{ background: color.bg, border: `1px solid ${color.border}` }}
              >
                <span className={color.text}>{color.label}</span>
              </motion.span>

              <span className={clsx("text-xs", darkMode ? 'text-slate-500' : 'text-slate-600')}>
                {formatDate(task.created_at)}
              </span>

              {task.updated_at && task.updated_at !== task.created_at && (
                <span className={clsx("text-xs italic", darkMode ? 'text-teal-500/70' : 'text-teal-600/70')}>
                  edited {formatDate(task.updated_at)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {!task.completed && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(task)}
                className="p-2 rounded-lg hover:bg-teal-500/20 transition-colors"
              >
                <Edit2 className="w-4 h-4 text-teal-400" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(task.id)}
              className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [priority, setPriority] = useState("medium");
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/tasks`)
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setCompletedCount(data.filter(t => t.completed).length);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    // Apply theme
    if (lightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [lightMode]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const addTask = async () => {
    if (!title.trim()) {
      showToast('Task cannot be empty', 'info');
      return;
    }
    if (isAdding) return;

    setIsAdding(true);
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority })
      });
      const newTask = await res.json();
      setTasks([...tasks, newTask]);
      setTitle("");
      setPriority("medium");
      showToast('✓ Task added successfully', 'success');
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTask = (task) => {
    fetch(`${API_URL}/tasks/${task.id}`, { method: "PUT" })
      .then(res => res.json())
      .then(updated => {
        setTasks(tasks.map(t => t.id === updated.id ? updated : t));
        setCompletedCount(updated.completed ? completedCount + 1 : completedCount - 1);
        showToast(updated.completed ? '✓ Task completed!' : 'Task reopened', 'success');
      });
  };

  const deleteTask = (taskId) => {
    fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" })
      .then(() => {
        const deleted = tasks.find(t => t.id === taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
        if (deleted?.completed) setCompletedCount(completedCount - 1);
        showToast('Task deleted', 'delete');
      });
  };

  const updateTask = async (taskId, newTitle, newPriority) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, priority: newPriority })
      });
      const updated = await res.json();
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
      showToast('✓ Task updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update task', 'info');
    }
  };

  const openTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const groupByDate = (tasksList) => {
    const grouped = {};
    tasksList.forEach(task => {
      const date = new Date(task.created_at).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(task);
    });
    return grouped;
  };

  const openByDate = groupByDate(openTasks.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
  }));

  const completedByDate = groupByDate(completedTasks);

  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const bgClass = lightMode ? 'bg-white text-slate-900' : 'bg-slate-950 text-slate-50';
  const navbarBg = lightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(13, 17, 23, 0.7)';
  const cardBg = lightMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(13, 17, 23, 0.4)';
  const textColor = lightMode ? 'text-slate-900' : 'text-slate-50';
  const secondaryText = lightMode ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className={clsx("relative min-h-screen flex flex-col", bgClass)}>
      {/* Premium Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{
          background: navbarBg,
          borderColor: lightMode ? 'rgba(50, 184, 198, 0.2)' : 'rgba(50, 184, 198, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-400" />
              <h1 className="text-xl font-bold text-teal-400 fancy-title">TaskFlow</h1>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-6">
              <div className="text-center">
                <p className={clsx("text-xs font-medium", secondaryText)}>Progress</p>
                <motion.p
                  key={completionPercentage}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold text-teal-300"
                >
                  {completionPercentage}%
                </motion.p>
              </div>
              <div className={clsx("w-px h-8", lightMode ? 'bg-teal-500/30' : 'bg-teal-500/20')} />
              <div className="text-center">
                <p className={clsx("text-xs font-medium", secondaryText)}>
                  {openTasks.length === 0 ? 'None added' : `${completedCount}/${tasks.length}`}
                </p>
                <p className="text-lg font-bold text-teal-300">Done</p>
              </div>
            </div>

            {/* Theme toggle */}
            <FancySwitch
              enabled={lightMode}
              onChange={() => setLightMode(!lightMode)}
              darkMode={!lightMode}
            />
          </div>
        </div>
      </motion.nav>

      {/* Main content */}
      <div className="flex-1 pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h2 className={clsx("text-4xl sm:text-5xl font-bold mb-2 fancy-title", textColor)}>
              Your Tasks
            </h2>
            <p className={secondaryText}>Stay focused. Get things done.</p>
          </motion.div>

          {/* Input area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div
              className={clsx("rounded-2xl p-5 border transition-all duration-300", lightMode ? 'border-teal-500/30 hover:border-teal-500/50' : 'border-teal-500/20 hover:border-teal-500/40')}
              style={{
                background: cardBg,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
            >
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    placeholder="What needs to be done?"
                    maxLength={100}
                    className={clsx(
                      "flex-1 bg-transparent text-base placeholder-opacity-60 focus:outline-none transition-colors",
                      lightMode ? 'text-slate-900 placeholder-slate-600' : 'text-white placeholder-slate-500'
                    )}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addTask}
                    disabled={isAdding || !title.trim()}
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 transition-all duration-300 flex items-center gap-2 font-medium"
                  >
                    {isAdding ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </motion.button>
                </div>

                {/* Priority selector */}
                <div className="flex items-center gap-3 px-1">
                  <Flag className="w-4 h-4 text-slate-500" />
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={clsx(
                      "text-xs bg-transparent focus:outline-none transition-colors",
                      lightMode ? 'text-slate-700 hover:text-teal-600' : 'text-slate-400 hover:text-teal-300'
                    )}
                  >
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                  </select>
                </div>

                {/* Character count */}
                <p className={clsx("text-xs", secondaryText)}>
                  {title.length}/100 characters
                </p>
              </div>
            </div>
          </motion.div>

          {/* Progress Bar */}
          {tasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={clsx("text-xs font-bold uppercase tracking-widest", secondaryText)}>
                  Progress
                </span>
                <span className="text-sm font-bold text-teal-300">{completionPercentage}%</span>
              </div>
              <div className={clsx("h-1.5 rounded-full overflow-hidden", lightMode ? 'bg-slate-300/30' : 'bg-slate-800/50')}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-teal-400 to-teal-500"
                />
              </div>
            </motion.div>
          )}

          {/* Open Tasks */}
          {openTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
            >
              <h3 className={clsx("text-lg font-bold mb-4", textColor)}>Open Tasks</h3>
              <div className="space-y-6 mb-12">
                <AnimatePresence mode="popLayout">
                  {Object.entries(openByDate).map(([date, dateTasks]) => (
                    <motion.div
                      key={date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-3">
                        <h4 className={clsx("text-xs font-semibold uppercase tracking-widest", secondaryText)}>
                          {date}
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {dateTasks.map(task => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onEdit={setEditingTask}
                            darkMode={!lightMode}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05, delayChildren: 0.2 }}
            >
              <h3 className={clsx("text-lg font-bold mb-4", textColor)}>Done (Archived)</h3>
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {Object.entries(completedByDate).map(([date, dateTasks]) => (
                    <motion.div
                      key={date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-3">
                        <h4 className={clsx("text-xs font-semibold uppercase tracking-widest", secondaryText)}>
                          {date}
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {dateTasks.map(task => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onEdit={setEditingTask}
                            darkMode={!lightMode}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {isLoading ? (
            <SkeletonLoader />
          ) : tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">😴</div>
              <p className={clsx("font-light text-lg", secondaryText)}>
                No tasks yet. Create one to get started.
              </p>
            </motion.div>
          ) : null}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Update Modal */}
      <AnimatePresence>
        {editingTask && (
          <UpdateModal
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onUpdate={updateTask}
            darkMode={!lightMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
