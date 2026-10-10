import { useEffect, useState } from "react";
import axios from "axios";
import {
  Home,
  MessageCircle,
  Zap,
  CheckCircle2,
  ShoppingCart,
  Moon,
  Send,
  Bot,
  User,
  Sparkles,
  Brain,
  CalendarDays,
  Mail,
  FileText,
  TrendingUp,
  Settings,
  Target,
  Menu,
  X,
} from "lucide-react";

import PersonalWork from "./PersonalWork";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [message, setMessage] = useState("");
  const [activeView, setActiveView] = useState("assistant");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm HomePilot AI. I can help you manage your home and personal work. What would you like to do today?",
    },
  ]);

  const [dashboard, setDashboard] = useState({
    home_status: "Secure & Comfortable",
    energy_status: "Moderate",
    energy_peak_period: "",
    tasks_count: 0,
    shopping_count: 0,
  });

  const [personalTasks, setPersonalTasks] = useState([]);

  const loadDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard`);
      setDashboard((previous) => ({
        ...previous,
        ...response.data,
      }));
    } catch (error) {
      console.error("Unable to load dashboard:", error);
    }
  };

  const loadPersonalTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/personal-work`);
      setPersonalTasks(response.data.tasks || []);
    } catch (error) {
      console.error("Unable to load personal work:", error);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadPersonalTasks();
  }, []);

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    setMessages((previous) => [
      ...previous,
      { sender: "user", text: userMessage },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: userMessage,
      });

      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text:
            response.data.response ||
            "I received your request, but no response was returned.",
          tool: response.data.tool_used,
        },
      ]);

      await Promise.all([loadDashboard(), loadPersonalTasks()]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: "I couldn't connect to HomePilot AI. Please check that your backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickAction = (text) => {
    setActiveView("assistant");
    setMessage(text);
    setMobileMenuOpen(false);
  };

  const navigate = (view) => {
    setActiveView(view);
    setMobileMenuOpen(false);

    if (view === "personal-work") {
      loadPersonalTasks();
    }
  };

  const pendingPersonalTasks = personalTasks.filter(
    (task) => task.status === "Pending"
  );

  const completedPersonalTasks = personalTasks.filter(
    (task) => task.status === "Completed"
  );

  const today = new Date();
  const hour = today.getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
        ? "Good afternoon"
        : "Good evening";

  const formattedEnergyStatus =
    dashboard.energy_status &&
    dashboard.energy_status !== "Loading..."
      ? String(dashboard.energy_status)
          .charAt(0)
          .toUpperCase() +
        String(dashboard.energy_status).slice(1)
      : "Checking";

  const todayLabel = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const navigationItems = [
    {
      id: "assistant",
      label: "Assistant",
      icon: MessageCircle,
    },
    {
      id: "home",
      label: "Home",
      icon: Home,
    },
    {
      id: "email",
      label: "Email",
      icon: Mail,
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: CalendarDays,
    },
    {
      id: "personal-work",
      label: "Personal Work",
      icon: Brain,
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckCircle2,
    },
    {
      id: "shopping",
      label: "Shopping",
      icon: ShoppingCart,
    },
    {
      id: "energy",
      label: "Energy",
      icon: TrendingUp,
    },
  ];

  const handleNavigation = (id) => {
    if (id === "home") {
      navigate("assistant");
      return;
    }

    if (id === "tasks") {
      quickAction("Show my tasks");
      return;
    }

    if (id === "shopping") {
      quickAction("Show my shopping list");
      return;
    }

    if (id === "energy") {
      quickAction("Analyze my energy usage");
      return;
    }

    if (id === "email" || id === "calendar") {
      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text:
            id === "email"
              ? "Email integration has not been connected yet. You can add an email provider integration in a future version."
              : "Calendar integration has not been connected yet. You can add calendar synchronization in a future version.",
        },
      ]);
      navigate("assistant");
      return;
    }

    navigate(id);
  };

  return (
    <div className="app">
      {mobileMenuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={23} />
          </div>

          <div className="brand-copy">
            <h2>HomePilot</h2>
            <span>PERSONAL INTELLIGENCE</span>
          </div>

          <button
            className="mobile-close"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeView === item.id ||
              (activeView === "assistant" && item.id === "home");

            return (
              <button
                type="button"
                key={item.id}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleNavigation(item.id)}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>

                {item.id === "personal-work" &&
                  pendingPersonalTasks.length > 0 && (
                    <span className="nav-count">
                      {pendingPersonalTasks.length}
                    </span>
                  )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon">
              <Sparkles size={17} />
            </div>
            <strong>Your AI companion</strong>
            <p>One place for your home, tasks, and daily focus.</p>
            <button
              type="button"
              onClick={() => quickAction("Help me plan my day")}
            >
              Plan my day <span>→</span>
            </button>
          </div>

          <button
            className="nav-item settings-item"
            type="button"
            onClick={() =>
              setMessages((previous) => [
                ...previous,
                {
                  sender: "bot",
                  text: "Settings and integrations can be configured as we expand HomePilot AI.",
                },
              ]) || navigate("assistant")
            }
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <div className="system-status">
            <span className="status-dot" />
            <div>
              <strong>HomePilot is ready</strong>
              <span>Local assistant</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-button"
              aria-label="Open navigation"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <div className="eyebrow">
                YOUR PERSONAL INTELLIGENCE SPACE
              </div>
              <h1>
                {activeView === "personal-work"
                  ? "Personal Work"
                  : activeView === "assistant"
                    ? `${greeting} `
                    : "Your workspace"}
                {activeView === "assistant" && (
                  <Sparkles
                    className="greeting-sparkle"
                    size={23}
                    fill="currentColor"
                  />
                )}
              </h1>

              <p className="subtitle">
                {activeView === "personal-work"
                  ? "Everything you need to remember, organized in one place."
                  : "A little more clarity. A little less chaos."}
              </p>
            </div>
          </div>

          <div className="topbar-right">
            <div className="date-display">
              <CalendarDays size={15} />
              {todayLabel}
            </div>

            <div className="avatar">
              <Bot size={23} />
            </div>
          </div>
        </header>

        {/* ASSISTANT DASHBOARD */}
        {activeView === "assistant" && (
          <>
            <section className="hero-card">
              <div className="hero-content">
                <div className="hero-pill">
                  <span className="status-dot" />
                  YOUR AI ASSISTANT IS ONLINE
                </div>

                <h2>
                  Make room for
                  <br />
                  <span>what matters.</span>
                </h2>

                <p>
                  Let HomePilot help you organize your day, remember your
                  work, and manage your home with less effort.
                </p>

                <button
                  type="button"
                  className="hero-button"
                  onClick={() => {
                    document
                      .querySelector(".assistant-container")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    document.querySelector(".chat-input input")?.focus();
                  }}
                >
                  Talk to HomePilot <span>↗</span>
                </button>
              </div>

              <div className="hero-orbit" aria-hidden="true">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="orbit orbit-three" />
                <div className="planet">
                  <Sparkles size={37} />
                </div>
                <span className="orbit-star star-one">✦</span>
                <span className="orbit-star star-two">✧</span>
                <span className="orbit-star star-three">·</span>
              </div>
            </section>

            {/* SUMMARY CARDS */}
            <section className="dashboard-grid">
              <div className="info-card">
                <div className="card-topline">
                  <div className="card-icon home-icon">
                    <Home size={20} />
                  </div>
                  <span className="card-kicker">HOME</span>
                </div>
                <span className="card-label">Home status</span>
                <strong>{dashboard.home_status}</strong>
                <div className="card-footnote">
                  <span className="tiny-green-dot" />
                  Home overview
                </div>
              </div>

              <div className="info-card">
                <div className="card-topline">
                  <div className="card-icon energy-icon">
                    <Zap size={20} />
                  </div>
                  <span className="card-kicker">ENERGY</span>
                </div>
                <span className="card-label">Energy usage</span>
                <strong>{formattedEnergyStatus}</strong>
                <div className="card-footnote">
                  Monitor your consumption
                </div>
              </div>

              <div className="info-card">
                <div className="card-topline">
                  <div className="card-icon task-icon">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="card-kicker">HOUSEHOLD</span>
                </div>
                <span className="card-label">Home tasks</span>
                <strong>{dashboard.tasks_count} pending</strong>
                <div className="card-footnote">Keep things on track</div>
              </div>

              <div className="info-card">
                <div className="card-topline">
                  <div className="card-icon shopping-icon">
                    <ShoppingCart size={20} />
                  </div>
                  <span className="card-kicker">SHOPPING</span>
                </div>
                <span className="card-label">Shopping list</span>
                <strong>{dashboard.shopping_count} items</strong>
                <div className="card-footnote">Everything in one list</div>
              </div>
            </section>

            {/* LOWER DASHBOARD */}
            <section className="content-grid">
              <div className="panel assistant-container">
                <div className="panel-heading assistant-header">
                  <div className="assistant-title">
                    <div className="ai-icon">
                      <Sparkles size={19} />
                    </div>
                    <div>
                      <h2>HomePilot AI</h2>
                      <span>Your conversational assistant</span>
                    </div>
                  </div>

                  <div className="online-badge">
                    <span />
                    Online
                  </div>
                </div>

                <div className="chat-area">
                  {messages.map((msg, index) => (
                    <div
                      key={`${index}-${msg.sender}`}
                      className={`message-row ${
                        msg.sender === "user" ? "user-row" : "bot-row"
                      }`}
                    >
                      <div
                        className={`message-avatar ${
                          msg.sender === "user"
                            ? "user-avatar"
                            : "bot-avatar"
                        }`}
                      >
                        {msg.sender === "user" ? (
                          <User size={16} />
                        ) : (
                          <Bot size={16} />
                        )}
                      </div>

                      <div
                        className={`message ${
                          msg.sender === "user"
                            ? "user-message"
                            : "bot-message"
                        }`}
                      >
                        <p>{msg.text}</p>
                        {msg.tool && (
                          <small>
                            Tool used: {String(msg.tool).replaceAll("_", " ")}
                          </small>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="message-row bot-row">
                      <div className="message-avatar bot-avatar">
                        <Bot size={16} />
                      </div>
                      <div className="message bot-message typing">
                        HomePilot is thinking...
                      </div>
                    </div>
                  )}
                </div>

                <div className="quick-actions">
                  <button
                    type="button"
                    onClick={() => quickAction("I'm leaving home")}
                  >
                    <Home size={15} /> Leaving home
                  </button>
                  <button
                    type="button"
                    onClick={() => quickAction("Show my tasks")}
                  >
                    <CheckCircle2 size={15} /> My tasks
                  </button>
                  <button
                    type="button"
                    onClick={() => quickAction("Show my shopping list")}
                  >
                    <ShoppingCart size={15} /> Shopping
                  </button>
                  <button
                    type="button"
                    onClick={() => quickAction("Analyze my energy usage")}
                  >
                    <Zap size={15} /> Energy
                  </button>
                  <button
                    type="button"
                    onClick={() => quickAction("Prepare my bedtime routine")}
                  >
                    <Moon size={15} /> Bedtime
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("personal-work")}
                  >
                    <Brain size={15} /> Personal work
                  </button>
                </div>

                <form className="chat-input" onSubmit={sendMessage}>
                  <input
                    type="text"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Ask HomePilot anything..."
                    aria-label="Message HomePilot AI"
                  />

                  <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>

              {/* PERSONAL FOCUS PANEL */}
              <div className="panel focus-panel">
                <div className="panel-title-row">
                  <div>
                    <h2>
                      <Target size={19} />
                      Your personal focus
                    </h2>
                    <p>A snapshot of your saved work</p>
                  </div>
                  <button
                    className="text-link"
                    type="button"
                    onClick={() => navigate("personal-work")}
                  >
                    View all →
                  </button>
                </div>

                <div className="focus-stats">
                  <div>
                    <strong>{pendingPersonalTasks.length}</strong>
                    <span>Pending</span>
                  </div>
                  <div>
                    <strong>{completedPersonalTasks.length}</strong>
                    <span>Completed</span>
                  </div>
                </div>

                <div className="focus-list">
                  {pendingPersonalTasks.length === 0 ? (
                    <div className="empty-focus">
                      <Brain size={25} />
                      <p>Your personal work will appear here.</p>
                      <button
                        type="button"
                        onClick={() => navigate("personal-work")}
                      >
                        Add your first task
                      </button>
                    </div>
                  ) : (
                    pendingPersonalTasks.slice(0, 4).map((task) => (
                      <div className="focus-task" key={task.id}>
                        <span className="focus-task-icon">
                          <CheckCircle2 size={17} />
                        </span>
                        <div>
                          <strong>{task.title}</strong>
                          <span>
                            {task.deadline
                              ? `Due ${task.deadline}`
                              : "No deadline set"}
                          </span>
                        </div>
                        <span
                          className={`priority-dot priority-${String(
                            task.priority || "medium"
                          ).toLowerCase()}`}
                        />
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  className="focus-cta"
                  onClick={() => navigate("personal-work")}
                >
                  Manage personal work <span>↗</span>
                </button>

                <div className="brief-card">
                  <div className="brief-icon">
                    <FileText size={21} />
                  </div>
                  <div>
                    <strong>Small steps, real progress.</strong>
                    <p>Keep your priorities visible and your day organized.</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* PERSONAL WORK */}
        {activeView === "personal-work" && (
          <section className="personal-work-page">
            <div className="personal-work-intro">
              <div>
                <div className="eyebrow">YOUR PERSONAL MEMORY</div>
                <h2>Everything you need to remember.</h2>
                <p>
                  Save tasks, keep track of deadlines, and make progress one
                  step at a time.
                </p>
              </div>

              <div className="personal-memory-icon">
                <Brain size={30} />
              </div>
            </div>

            <div className="personal-summary-grid">
              <div className="personal-summary-card">
                <span>Pending work</span>
                <strong>{pendingPersonalTasks.length}</strong>
                <CheckCircle2 size={20} />
              </div>
              <div className="personal-summary-card">
                <span>Completed work</span>
                <strong>{completedPersonalTasks.length}</strong>
                <Target size={20} />
              </div>
              <div className="personal-summary-card">
                <span>Total saved</span>
                <strong>{personalTasks.length}</strong>
                <Brain size={20} />
              </div>
            </div>

            <PersonalWork />
          </section>
        )}

        <footer className="app-footer">
          <span>
            <Sparkles size={13} /> HomePilot AI
          </span>
          <span>Personal & Smart Home Intelligence</span>
        </footer>
      </main>
    </div>
  );
}

export default App;