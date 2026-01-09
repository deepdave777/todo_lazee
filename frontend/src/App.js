import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, Zap, TrendingUp, Sparkles, Loader } from "lucide-react";
import clsx from "clsx";

// API configuration - use environment variable or fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

function SkeletonLoader() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          className="h-16 bg-slate-800/40 rounded-xl"
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
  const [isHovered, setIsHovered] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, x: -40, scale: 0.9, transition: { duration: 0.3 } }
  };

  const progressPercent = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 overflow-x-hidden relative">
      {/* Cursor follower gradient */}
      <motion.div
        animate={{ x: mousePosition.x - 100, y: mousePosition.y - 100 }}
        transition={{ type: "spring", damping: 40, stiffness: 300 }}
        className="fixed w-32 h-32 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl pointer-events-none z-0"
      />

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ opacity: [0.08, 0.2, 0.08], x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-orange-600 to-yellow-600 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.08, 0.15, 0.08], x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity, delay: 2, ease: "easeInOut" }}
          className="absolute bottom-0 -right-40 w-96 h-96 bg-gradient-to-tl from-orange-500 to-red-600 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-28">
        {/* Premium Header with animation */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-20 sm:mb-28"
        >
          {/* Floating icon */}
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8 inline-block"
          >
            <div className="relative w-40 h-20">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full blur-xl opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-glow-lg">
                <Zap className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
            </div>
          </motion.div>

          {/* Main title */}
          <h1 className="text-7xl sm:text-10xl font-black tracking-tighter mb-4 leading-none">
            <span className="block h-24 sm:h-32 overflow-hidden">
              <motion.span
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-100 inline-block bg-gradient-to-r from-orange-100 via-orange-300 to-orange-400 bg-clip-text text-transparent drop-shadow-lg"
              >
                Lazee
              </motion.span>
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-slate-300 font-light tracking-wide max-w-2xl mx-auto"
          >
            {tasks.length === 0
              ? "✨ Your canvas awaits. Craft something extraordinary."
              : `🔥 You're ${progressPercent}% legendary`}
          </motion.p>
        </motion.div>

        {/* Ultra-Premium Input */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mb-16 sm:mb-24 group"
        >
          <div className="relative">
            {/* Premium glow background */}
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -inset-1.5 bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 rounded-3xl blur-2xl opacity-20"
            />

            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-2xl rounded-3xl p-1.5 border border-orange-500/20 group-hover:border-orange-500/40 transition-all duration-500 shadow-2xl">
              <div className="flex flex-col sm:flex-row gap-3 bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-2xl p-5 sm:p-6">
                {/* Input */}
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onKeyPress={e => e.key === "Enter" && addTask()}
                  placeholder="What's your next move?"
                  className="flex-1 bg-transparent outline-none text-xl sm:text-2xl placeholder-slate-500 text-slate-50 font-medium tracking-wide"
                />

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addTask}
                  disabled={!title.trim() || isAdding}
                  className={clsx(
                    "flex items-center justify-center gap-2 px-8 sm:px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 whitespace-nowrap relative overflow-hidden group",
                    title.trim() && !isAdding
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-glow-lg cursor-pointer"
                      : "bg-slate-800 text-slate-400 cursor-not-allowed"
                  )}
                >
                  {isAdding ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                        <Loader className="w-5 h-5" />
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span className="hidden sm:inline">Add</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Progress Bar */}
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mb-20 sm:mb-28"
          >
            <div className="flex items-center justify-between mb-4 group">
              <span className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-widest">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                Progress
              </span>
              <motion.span
                key={progressPercent}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-black text-transparent bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text"
              >
                {progressPercent}%
              </motion.span>
            </div>
            <div className="h-2.5 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full shadow-glow"
              />
            </div>
          </motion.div>
        )}

        {/* Tasks List */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SkeletonLoader />
            </motion.div>
          ) : tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="mb-8"
              >
                <Sparkles className="w-24 h-24 text-slate-700 mx-auto opacity-40" />
              </motion.div>
              <p className="text-xl text-slate-400 font-light">The journey begins with a single task</p>
            </motion.div>
          ) : (
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {tasks.map((task, index) => (
                <motion.li
                  key={task.id}
                  variants={itemVariants}
                  exit="exit"
                  onHoverStart={() => setIsHovered(task.id)}
                  onHoverEnd={() => setIsHovered(null)}
                  className="group"
                >
                  <motion.div
                    whileHover={{ x: 6 }}
                    className={clsx(
                      "relative flex items-center gap-4 p-5 sm:p-6 rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer",
                      task.completed
                        ? "bg-gradient-to-r from-slate-800/40 to-slate-800/20 border border-slate-700/20"
                        : "bg-gradient-to-br from-slate-800/70 to-slate-800/40 hover:from-slate-800/90 hover:to-slate-800/60 border border-slate-700/40 hover:border-orange-500/30 shadow-soft hover:shadow-soft-lg"
                    )}
                  >
                    {/* Shimmer effect */}
                    {!task.completed && (
                      <motion.div
                        animate={{ opacity: [0, 0.1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent"
                      />
                    )}

                    {/* Checkbox with animation */}
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => toggleTask(task)}
                      className="relative z-10 flex-shrink-0 transition-all"
                    >
                      <motion.div
                        animate={task.completed ? { rotate: 360, scale: 1.1 } : { rotate: 0, scale: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-7 h-7 text-orange-500 drop-shadow-lg" />
                        ) : (
                          <Circle className="w-7 h-7 text-slate-600 group-hover:text-orange-400 transition-colors duration-300" />
                        )}
                      </motion.div>
                    </motion.button>

                    {/* Task content */}
                    <div className="flex-1 min-w-0">
                      <motion.span
                        animate={{ opacity: task.completed ? 0.6 : 1 }}
                        className={clsx(
                          "block text-lg sm:text-xl font-medium transition-all duration-300 truncate",
                          task.completed
                            ? "text-slate-500 line-through"
                            : "text-slate-100"
                        )}
                      >
                        {task.title}
                      </motion.span>
                    </div>

                    {/* Index and actions */}
                    <div className="flex items-center gap-3 relative z-10">
                      <motion.div
                        animate={{ opacity: isHovered === task.id ? 1 : 0 }}
                        className="text-xs font-bold text-orange-500 transition-opacity"
                      >
                        #{index + 1}
                      </motion.div>

                      <motion.button
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        {/* Premium Stats */}
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-24 sm:mt-32 pt-16 sm:pt-20 border-t border-orange-500/20"
          >
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              {[
                { label: "Total", value: tasks.length, icon: "📊", color: "from-blue-600 to-blue-500" },
                { label: "Completed", value: completedCount, icon: "✅", color: "from-green-600 to-green-500" },
                { label: "Remaining", value: tasks.length - completedCount, icon: "🔥", color: "from-orange-600 to-orange-500" }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                  className={clsx(
                    "p-6 rounded-2xl border transition-all duration-300 cursor-default",
                    "bg-gradient-to-br from-slate-800/50 to-slate-800/20 border-slate-700/40 hover:border-orange-500/30 hover:shadow-soft"
                  )}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <motion.div
                      key={stat.value}
                      initial={{ scale: 1.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`text-4xl sm:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
                    >
                      {stat.value}
                    </motion.div>
                    <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
