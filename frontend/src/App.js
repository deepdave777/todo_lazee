import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, Sparkles, Loader } from "lucide-react";
import clsx from "clsx";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

function SkeletonLoader() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          className="h-14 bg-slate-700/20 rounded-lg backdrop-blur-sm"
        />
      ))}
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/tasks`)
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setCompletedCount(data.filter(t => t.completed).length);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const addTask = async () => {
    if (!title.trim() || isAdding) return;
    setIsAdding(true);
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });
      const newTask = await res.json();
      setTasks([...tasks, newTask]);
      setTitle("");
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
      });
  };

  const deleteTask = (taskId) => {
    fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" })
      .then(() => {
        const deleted = tasks.find(t => t.id === taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
        if (deleted?.completed) setCompletedCount(completedCount - 1);
      });
  };

  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -30, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Premium Navbar - Liquid Glass */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-teal-500/10"
        style={{
          background: "rgba(13, 17, 23, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)"
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-teal-400" />
              </motion.div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-300 to-teal-400 bg-clip-text text-transparent">
                TaskFlow
              </h1>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-slate-400 font-medium">Progress</p>
                <motion.p
                  key={completionPercentage}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold text-teal-300"
                >
                  {completionPercentage}%
                </motion.p>
              </div>
              <div className="w-px h-8 bg-teal-500/20" />
              <div className="text-center">
                <p className="text-xs text-slate-400 font-medium">{completedCount}/{tasks.length}</p>
                <p className="text-lg font-bold text-teal-300">Done</p>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main content */}
      <div className="flex-1 pt-24 pb-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Minimal Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Your Tasks
            </h2>
            <p className="text-slate-400 text-sm">Stay focused. Get things done.</p>
          </motion.div>

          {/* Input area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div
              className="rounded-2xl p-5 border border-teal-500/20 transition-all duration-300 hover:border-teal-500/40 group"
              style={{
                background: "rgba(13, 17, 23, 0.5)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)"
              }}
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="Add a new task..."
                  className="flex-1 bg-transparent text-white text-base placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 transition-colors"
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
            </div>
          </motion.div>

          {/* Progress Bar - Minimal */}
          {tasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                <span className="text-sm font-bold text-teal-300">{completionPercentage}%</span>
              </div>
              <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-teal-400 to-teal-500"
                />
              </div>
            </motion.div>
          )}

          {/* Tasks List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <SkeletonLoader />
              ) : tasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 font-light text-lg">No tasks yet. Create one to get started.</p>
                </motion.div>
              ) : (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    variants={itemVariants}
                    layout
                    className="group"
                  >
                    <div
                      className="rounded-xl p-4 border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 hover:shadow-lg"
                      style={{
                        background: "rgba(13, 17, 23, 0.4)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        boxShadow: "0 0 0 1px rgba(50, 184, 198, 0.1) inset"
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleTask(task)}
                          className="flex-shrink-0 focus:outline-none transition-transform"
                        >
                          <motion.div
                            animate={{ rotate: task.completed ? 360 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-teal-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-600 hover:text-teal-300 transition-colors" />
                            )}
                          </motion.div>
                        </motion.button>

                        <div className="flex-1 min-w-0">
                          <p className={clsx(
                            "text-sm font-medium transition-all duration-200",
                            task.completed ? "line-through text-slate-500" : "text-slate-100"
                          )}>
                            {task.title}
                          </p>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-400 transition-colors" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App;
