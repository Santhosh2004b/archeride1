
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  House,
  Warning,
  Circle,
  Link,
  TrendUp,
  CheckCircle,
  ThumbsUp,
  UserCircle,
  SignOut,
  Bell,
  UserPlus,
  X
} from "phosphor-react";

import { useAuth } from "../context/AuthContext";
import {
  fetchAdminNotificationCount,
  fetchBmNotificationCount,
} from "../api/notificationsApi";
import { approveBMApi, fetchApprovedBMsApi } from "../api/authApi";
import logo from "../assets/arche-logo2.png";
import { motion, AnimatePresence } from "framer-motion";

const MODULE_LINKS = [
  { key: "dashboard", label: "Dashboard", icon: House },
  { key: "risks", label: "Risk", icon: Warning },
  { key: "issues", label: "Issue", icon: Circle },
  { key: "dependencies", label: "Dependency", icon: Link },
  { key: "escalations", label: "Escalation", icon: TrendUp },
  { key: "actions", label: "Action", icon: CheckCircle },
  { key: "appreciations", label: "Appreciation", icon: ThumbsUp },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, rotateX: 90 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

function getTitle(pathname, search) {
  // Remove "Monitoring" terminology
  // if (pathname.startsWith("/monitoring")) return "Monitoring"; // Legacy

  if (pathname.startsWith("/modules/")) {
    const key = pathname.split("/")[2] || "";
    const mod = MODULE_LINKS.find((m) => m.key === key);
    const params = new URLSearchParams(search);
    const mode = params.get("mode") || "view";
    const modeLabel = mode === "edit" ? "Edit" : "View";
    return `${mod?.label || "Module"} – ${modeLabel}`;
  }
  if (pathname.startsWith("/login")) return "Login";
  if (pathname === "/landing") return "Landing";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/bm/notifications") return "Notification"; // Renamed
  if (pathname === "/monitoring/users") return "Users Management";
  if (pathname === "/monitoring") return "Dashboard"; // Fallback for admin dashboard

  // Specific monitoring paths mapped to simple names
  if (pathname.startsWith("/monitoring/risks")) return "Risk";
  if (pathname.startsWith("/monitoring/issues")) return "Issue";
  if (pathname.startsWith("/monitoring/dependencies")) return "Dependency";
  if (pathname.startsWith("/monitoring/actions")) return "Action";
  if (pathname.startsWith("/monitoring/escalations")) return "Escalation";
  if (pathname.startsWith("/monitoring/appreciations")) return "Appreciation";
  if (pathname.startsWith("/monitoring/notifications")) return "Notification";

  return "App";
}

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loginTime, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());


  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [bmApprovalEmail, setBmApprovalEmail] = useState("");
  const [approvalStatus, setApprovalStatus] = useState({ loading: false, error: "", success: "" });
  const [showHistory, setShowHistory] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState([]);

  useEffect(() => {
    if (showHistory) {
      fetchApprovedBMsApi().then(setApprovalHistory).catch(console.error);
    }
  }, [showHistory]);


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [notifCount, setNotifCount] = useState(0);
  const [showToast] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = getTitle(location.pathname, location.search);

  const params = new URLSearchParams(location.search);
  const currentMode = params.get("mode") || "view";

  const isModules = location.pathname.startsWith("/modules/");

  const handleModeChange = (mode) => {
    if (!isModules) return;
    const p = new URLSearchParams(location.search);
    p.set("mode", mode);
    navigate(`${location.pathname}?${p.toString()}`);
  };

  const handleNavClick = (item) => {
    if (!user) {
      navigate("/login");
      return;
    }


    setSidebarOpen(false);


    if (user.role === "ADMIN") {
      if (item.key === "dashboard") {
        navigate("/monitoring");
      } else if (item.key === "users") {
        navigate("/monitoring/users");
      } else {
        navigate(`/monitoring/${item.key}`);
      }
      return;
    }


    if (user.role === "BM" || user.role === "PM") {
      if (item.key === "dashboard") {
        navigate("/modules/risks?mode=view");
      } else {
        navigate(`/modules/${item.key}?mode=view`);
      }
      return;
    }


    navigate("/login");
  };

  const isActive = (itemKey) => {
    const path = location.pathname;

    if (itemKey === "dashboard") {
      return (
        path === "/monitoring" ||
        path.startsWith("/modules/risks")
      );
    }

    return (
      path.startsWith(`/monitoring/${itemKey}`) ||
      path.startsWith(`/modules/${itemKey}`)
    );
  };

  const goNotifications = () => {
    if (!user) return;
    if (user.role === "ADMIN") {
      navigate("/monitoring/notifications");
    } else if (user.role === "BM" || user.role === "PM") {
      navigate("/bm/notifications");
    }
  };


  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    setApprovalStatus({ loading: true, error: "", success: "" });
    try {
      await approveBMApi(bmApprovalEmail);
      setApprovalStatus({ loading: false, error: "", success: `Approved ${bmApprovalEmail}` });
      setBmApprovalEmail("");

      setTimeout(() => {
        setShowApprovalModal(false);
        setApprovalStatus({ loading: false, error: "", success: "" });
      }, 2000);
    } catch (err) {
      setApprovalStatus({ loading: false, error: err.message || "Failed", success: "" });
    }
  };


  useEffect(() => {
    let ignore = false;

    const load = async () => {
      if (!user) {
        if (!ignore) setNotifCount(0);
        return;
      }
      try {
        let c = 0;
        if (user.role === "ADMIN") {
          c = await fetchAdminNotificationCount();
        } else if (user.role === "BM" || user.role === "PM") {
          c = await fetchBmNotificationCount();
        }
        if (!ignore) setNotifCount(c);
      } catch {
        if (!ignore) setNotifCount(0);
      }
    };

    load();
    const id = setInterval(load, 60000);
    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-slate-900 font-urbanist relative">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 bg-white px-2 sm:px-6 py-2 sm:h-16 gap-2 sm:gap-0">

        {/* Left Side: Logo & Title */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <img
              src={logo}
              alt="Arche.RIDE logo"
              className="h-6 sm:h-8 w-auto object-contain"
            />
            <div className="flex flex-col" key={location.pathname}>
              <span className="text-lg sm:text-xl leading-tight font-bold text-gray-900 pop-text">
                {"RIDE+".split("").map((char, i) => (
                  <span key={i} style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </span>
              <span className="text-[9px] sm:text-[11px] text-brandMuted uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                {title || "Delivery"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 sm:gap-6 px-1 sm:px-0"
        >

          {/* View/Edit Toggle for Modules */}
          {isModules && (
            <motion.div variants={itemVariants} className="inline-flex items-center gap-1 sm:gap-2 rounded-full bg-gray-100 px-1 py-1">
              <button
                type="button"
                onClick={() => handleModeChange("view")}
                className={`px-3 py-1 text-[10px] sm:text-xs rounded-full ${currentMode === "view"
                  ? "bg-white text-brandDark shadow-sm"
                  : "text-brandMuted"
                  }`}
              >
                View
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("edit")}
                className={`px-3 py-1 text-[10px] sm:text-xs rounded-full ${currentMode === "edit"
                  ? "bg-brandDark text-white shadow-sm"
                  : "text-brandMuted"
                  }`}
              >
                Edit
              </button>
            </motion.div>
          )}

          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm ml-auto sm:ml-0">
            {/* Export button REMOVED from navbar */}

            {showToast && (
              <div className="absolute right-40 top-20 z-50
                      rounded-md bg-green-600 px-3 py-1.5
                      text-xs text-white shadow-lg
                      animate-fade">
                ✅ Downloaded successfully
              </div>
            )}

            {/* Notifications */}
            {user && (
              <motion.button
                variants={itemVariants}
                type="button"
                onClick={goNotifications}
                className="relative rounded-full h-8 w-8 flex items-center justify-center border border-orange-200 text-orange-500 hover:bg-orange-50 transition-colors"
                title="Notification"
                style={{ color: "#f97316", borderColor: "#fed7aa" }}
              >
                <Bell size={20} weight="duotone" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[16px] text-center">
                    {notifCount}
                  </span>
                )}
              </motion.button>
            )}

            {/* NEW MEMBER (Replaced Approve BM) */}
            {user && user.role === "ADMIN" && (
              <motion.button
                variants={itemVariants}
                type="button"
                onClick={() => setShowApprovalModal(true)}
                className="rounded-full h-8 w-8 flex items-center justify-center border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
                title="Add New Member"
                style={{ color: "#9333ea", borderColor: "#e9d5ff" }}
              >
                <UserPlus size={20} weight="duotone" />
              </motion.button>
            )}

            {/* User Profile */}
            <motion.div variants={itemVariants} className="relative group">
              <button
                type="button"
                className="rounded-full h-8 w-8 flex items-center justify-center border border-gray-300 text-brandDark hover:bg-gray-100 transition-colors"
              >
                <UserCircle size={20} weight="duotone" />
              </button>

              {/* Tooltip */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-3">
                <div className="text-xs font-bold text-gray-900 mb-1">Current User</div>
                <div className="text-[11px] text-gray-600 break-words mb-2">{user?.email || "user@arche.global"}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{user?.role}</div>

                <div className="h-px bg-gray-100 my-2"></div>

                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Session Started</div>
                <div className="text-[11px] text-brandDark font-medium">
                  {user && loginTime
                    ? new Date(loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "09:00 AM"}
                </div>
              </div>
            </motion.div>

            {/* Logout */}
            <motion.button
              variants={itemVariants}
              type="button"
              onClick={handleLogout}
              className="rounded-full h-8 w-8 flex items-center justify-center border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              title="Logout"
              style={{ color: "#ef4444", borderColor: "#fecaca" }}
            >
              <SignOut size={20} weight="duotone" />
            </motion.button>

            {/* Clock */}
            <motion.div variants={itemVariants} className="flex flex-col items-end justify-center text-right ml-2 border-l border-gray-200 pl-4 h-8">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-xs font-urbanist font-bold text-gray-600 tabular-nums leading-none">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </header >

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 relative" >
        {/* Mobile Sidebar Backprop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
      fixed lg:static
      top-0 left-0
      h-screen lg:h-auto
      w-72 bg-white border-r border-gray-200 pt-4 pb-6
      transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      z-50 lg:z-auto
      overflow-y-auto
    `}>
          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <nav>
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-1"
            >
              {(user && user.role === "ADMIN")
                ? [...MODULE_LINKS].map((item) => {
                  const active = isActive(item.key);
                  const Icon = item.icon;
                  return (
                    <motion.li key={item.key} variants={sidebarItemVariants}>
                      <button
                        type="button"
                        onClick={() => handleNavClick(item)}
                        className={`w-full text-left px-4 py-2 rounded-r-full text-sm transition flex items-center gap-3 ${active
                          ? "bg-black text-white font-semibold"
                          : "text-brandDark hover:bg-gray-100"
                          }`}
                      >
                        <Icon size={20} weight={active ? "fill" : "regular"} className="flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                      </button>
                    </motion.li>
                  );
                })
                : MODULE_LINKS.filter((item) => item.key !== "dashboard").map((item) => {
                  const active = isActive(item.key);
                  const Icon = item.icon;
                  return (
                    <motion.li key={item.key} variants={sidebarItemVariants}>
                      <button
                        type="button"
                        onClick={() => handleNavClick(item)}
                        className={`w-full text-left px-4 py-2 rounded-r-full text-sm transition flex items-center gap-3 ${active
                          ? "bg-black text-white font-semibold"
                          : "text-brandDark hover:bg-gray-100"
                          }`}
                      >
                        <Icon size={20} weight={active ? "fill" : "regular"} className="flex-shrink-0" />
                        {item.label}
                      </button>
                    </motion.li>
                  );
                })}
            </motion.ul>
          </nav>
        </aside >

        {/* Content */}
        <main className="flex-1 min-h-0 overflow-auto px-2 sm:px-4 py-4" >
          {children}
        </main>
      </div >

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowApprovalModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm z-10 font-urbanist"
            >
              <button
                onClick={() => setShowApprovalModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center mb-6">
                <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
                  <UserPlus size={24} weight="duotone" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">ADD NEW MEMBER</h3>
                <p className="text-gray-500 text-xs text-center mt-1">
                  Enter the email ID of the new member
                </p>
              </div>

              {!showHistory ? (
                <>
                  <form onSubmit={handleApproveSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Mail</label>
                      <input
                        type="email"
                        value={bmApprovalEmail}
                        onChange={(e) => setBmApprovalEmail(e.target.value)}
                        placeholder="bm@arche.global"
                        className="w-full p-3 rounded border border-gray-200 text-sm focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
                        required
                      />
                    </div>

                    {approvalStatus.error && (
                      <div className="text-red-500 text-xs bg-red-50 p-2 rounded border border-red-100">
                        {approvalStatus.error}
                      </div>
                    )}
                    {approvalStatus.success && (
                      <div className="text-green-600 text-xs bg-green-50 p-2 rounded border border-green-100">
                        {approvalStatus.success}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={approvalStatus.loading}
                      className="w-full bg-purple-600 text-white py-3 rounded font-bold uppercase tracking-wider text-sm hover:bg-purple-700 transition shadow-md"
                    >
                      {approvalStatus.loading ? "Approving..." : "Approve Access"}
                    </button>
                  </form>
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setShowHistory(true)}
                      className="text-xs text-purple-600 font-semibold hover:underline"
                    >
                      View Approval History
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-800">Past Approvals</h4>
                    <button onClick={() => setShowHistory(false)} className="text-xs text-gray-500 hover:text-purple-600">Back</button>
                  </div>
                  <div className="bg-gray-50 rounded border border-gray-100 max-h-48 overflow-y-auto p-2 space-y-2">
                    {approvalHistory.length === 0 ? (
                      <p className="text-xs text-center text-gray-400 py-2">No history found</p>
                    ) : (
                      approvalHistory.map((item, i) => (
                        <div key={i} className="flex flex-col border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                          <span className="text-xs font-semibold text-gray-800">{item.email}</span>
                          <span className="text-[10px] text-gray-500">{new Date(item.approvedAt).toLocaleDateString()} {new Date(item.approvedAt).toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div >
  );
};

export default MainLayout;
