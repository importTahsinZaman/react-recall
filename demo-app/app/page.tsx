"use client";

import { useState } from "react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "Review pull request from Sarah", completed: false, createdAt: Date.now() - 3600000 },
    { id: "2", text: "Update API documentation", completed: false, createdAt: Date.now() - 7200000 },
    { id: "3", text: "Schedule team sync for Friday", completed: false, createdAt: Date.now() - 10800000 },
  ]);
  const [newTaskText, setNewTaskText] = useState("");
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  const addTask = () => {
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskText("");
  };

  const toggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );

    // Track completed tasks (for the bug)
    setCompletedTaskIds((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId);
      }
      return [...prev, taskId];
    });
  };

  const deleteTask = (taskId: string) => {
    // BUG: If task was completed, try to find it with wrong ID
    if (completedTaskIds.includes(taskId)) {
      const completedTask = tasks.find((t) => t.id === taskId + "-archived");
      // This will be undefined, causing crash on next line
      console.log(`Archiving completed task: ${completedTask!.id}`);
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setCompletedTaskIds((prev) => prev.filter((id) => id !== taskId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  return (
    <div style={styles.container}>
      <div style={styles.app}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logo}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="2" fill="#635bff" />
                <rect x="14" y="3" width="7" height="7" rx="2" fill="#635bff" opacity="0.5" />
                <rect x="3" y="14" width="7" height="7" rx="2" fill="#635bff" opacity="0.5" />
                <rect x="14" y="14" width="7" height="7" rx="2" fill="#635bff" opacity="0.3" />
              </svg>
            </div>
            <h1 style={styles.appName}>Taskflow</h1>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.date}>{today}</span>
          </div>
        </header>

        {/* Add Task Input */}
        <div style={styles.inputSection}>
          <div style={styles.inputWrapper}>
            <svg style={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.input}
            />
            {newTaskText && (
              <button onClick={addTask} style={styles.addButton}>
                Add
              </button>
            )}
          </div>
        </div>

        {/* Task List */}
        <div style={styles.taskList}>
          {pendingTasks.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>
                To Do
                <span style={styles.count}>{pendingTasks.length}</span>
              </h2>
              <div style={styles.tasks}>
                {pendingTasks.map((task) => (
                  <div key={task.id} style={styles.taskItem}>
                    <button
                      onClick={() => toggleComplete(task.id)}
                      style={styles.checkbox}
                      data-action={`Complete: ${task.text}`}
                    >
                      <div style={styles.checkboxInner} />
                    </button>
                    <span style={styles.taskText}>{task.text}</span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      style={styles.deleteButton}
                      data-action={`Delete: ${task.text}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>
                Completed
                <span style={styles.count}>{completedTasks.length}</span>
              </h2>
              <div style={styles.tasks}>
                {completedTasks.map((task) => (
                  <div key={task.id} style={{ ...styles.taskItem, ...styles.taskItemCompleted }}>
                    <button
                      onClick={() => toggleComplete(task.id)}
                      style={{ ...styles.checkbox, ...styles.checkboxChecked }}
                      data-action={`Uncomplete: ${task.text}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                    <span style={{ ...styles.taskText, ...styles.taskTextCompleted }}>
                      {task.text}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      style={styles.deleteButton}
                      data-action={`Delete: ${task.text}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <path d="M9 12h6M9 16h6" />
                </svg>
              </div>
              <p style={styles.emptyText}>No tasks yet</p>
              <p style={styles.emptySubtext}>Add a task above to get started</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} · {completedTasks.length} completed
          </p>
        </footer>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "#f5f5f4",
    fontFamily: "'Outfit', -apple-system, sans-serif",
    color: "#1a1a1a",
    padding: "40px 20px",
  },
  app: {
    maxWidth: "640px",
    margin: "0 auto",
  },

  // Header
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "32px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: "24px",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  headerRight: {},
  date: {
    fontSize: "14px",
    color: "#737373",
    fontWeight: 500,
  },

  // Input
  inputSection: {
    marginBottom: "32px",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "white",
    borderRadius: "12px",
    padding: "16px 20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
    border: "1px solid #e5e5e5",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputIcon: {
    color: "#a3a3a3",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: "none",
    background: "none",
    fontSize: "16px",
    fontFamily: "'Outfit', sans-serif",
    color: "#1a1a1a",
  },
  addButton: {
    background: "#635bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Outfit', sans-serif",
    transition: "background 0.2s",
  },

  // Task List
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  section: {},
  sectionTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  count: {
    background: "#e5e5e5",
    color: "#525252",
    fontSize: "11px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "10px",
  },
  tasks: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  taskItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "white",
    borderRadius: "10px",
    padding: "14px 16px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    border: "1px solid #ebebeb",
    transition: "border-color 0.2s",
    animation: "fadeIn 0.2s ease",
  },
  taskItemCompleted: {
    background: "#fafafa",
    borderColor: "#f0f0f0",
  },
  checkbox: {
    width: "22px",
    height: "22px",
    borderRadius: "6px",
    border: "2px solid #d4d4d4",
    background: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    flexShrink: 0,
    padding: 0,
  },
  checkboxInner: {
    width: "8px",
    height: "8px",
    borderRadius: "2px",
    background: "transparent",
    transition: "background 0.2s",
  },
  checkboxChecked: {
    background: "#635bff",
    borderColor: "#635bff",
  },
  taskText: {
    flex: 1,
    fontSize: "15px",
    color: "#1a1a1a",
    lineHeight: 1.4,
  },
  taskTextCompleted: {
    color: "#a3a3a3",
    textDecoration: "line-through",
  },
  deleteButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    color: "#a3a3a3",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s, background 0.2s",
    opacity: 0.5,
  },

  // Empty State
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    color: "#d4d4d4",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#525252",
    marginBottom: "4px",
  },
  emptySubtext: {
    fontSize: "14px",
    color: "#a3a3a3",
  },

  // Footer
  footer: {
    marginTop: "40px",
    textAlign: "center",
  },
  footerText: {
    fontSize: "13px",
    color: "#a3a3a3",
  },
};
