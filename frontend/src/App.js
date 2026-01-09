import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, TrendingUp, Sparkles, Loader } from "lucide-react";
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
          className="h-14 bg-gradient-to-r from-slate-700/20 to-teal-900/20 rounded-lg backdrop-blur-sm"
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(null);

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

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background blobs */}
      <motion.div
        animate={{
          x: mousePosition.x * 0.02,
          y: mousePosition.y * 0.02
        }}
        transition={{ type: "spring", damping: 30, mass: 0.5 }}
        className="fixed inset-0 opacity-30 pointer-events-none"
      >
        <div className="absolute top-10 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-8 h-8 text-teal-400" />
          </motion.div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-3 bg-gradient-to-r from-teal-300 via-teal-400 to-teal-300 bg-clip-text text-transparent">
            TaskFlow
          </h1>
          <p className="text-slate-400 text-lg font-light">Your thoughts, organized. Your tasks, completed.</p>
        </motion.div>

        {/* Input area with glass effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="glass-lg rounded-2xl p-6 backdrop-blur-xl border border-teal-500/20">
            <div className="flex gap-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Add a new task..."
                className="flex-1 bg-transparent text-white text-lg placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addTask}
                disabled={isAdding || !title.trim()}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-3 transition-all duration-300 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl hover:shadow-teal-500/20"
              >
                {isAdding ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="glass-lg rounded-2xl p-6 backdrop-blur-xl border border-teal-500/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Progress</p>
                <p className="text-3xl font-bold text-white">{completionPercentage}%</p>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <TrendingUp className="w-8 h-8 text-teal-400" />
              </motion.div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-slate-700/30 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-teal-400 to-teal-500 shadow-lg shadow-teal-500/50"
              />
            </div>

            {/* Task stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="glass rounded-lg p-4 border border-teal-500/10">
                <p className="text-slate-400 text-sm mb-1">Completed</p>
                <p className="text-2xl font-bold text-teal-300">{completedCount}</p>
              </div>
              <div className="glass rounded-lg p-4 border border-teal-500/10">
                <p className="text-slate-400 text-sm mb-1">Remaining</p>
                <p className="text-2xl font-bold text-teal-300">{tasks.length - completedCount}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tasks list */}
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
                <p className="text-slate-500 font-light text-lg">No tasks yet. Create one to get started!</p>
              </motion.div>
            ) : (
              tasks.map((task) => (
                <motion.div
                  key={task.id}
                  variants={itemVariants}
                  layout
                  onHoverStart={() => setIsHovered(task.id)}
                  onHoverEnd={() => setIsHovered(null)}
                  className="group"
                >
                  <div className="glass-lg rounded-xl p-4 backdrop-blur-xl border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10">
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
                            <CheckCircle2 className="w-6 h-6 text-teal-400 drop-shadow-lg" />
                          ) : (
                            <Circle className="w-6 h-6 text-slate-600 hover:text-teal-300 transition-colors" />
                          )}
                        </motion.div>
                      </motion.button>

                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          "text-base font-medium transition-all duration-200",
                          task.completed ? "line-through text-slate-500" : "text-slate-100"
                        )}>
                          {task.title}
                        </p>
                        {task.created_at && (
                          <p className="text-xs text-slate-600 mt-1">
                            {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                      >
                        <Trash2 className="w-5 h-5 text-slate-500 hover:text-red-400 transition-colors" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16 text-slate-500 text-sm"
        >
          <p>Made with precision. Built with care.</p>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
