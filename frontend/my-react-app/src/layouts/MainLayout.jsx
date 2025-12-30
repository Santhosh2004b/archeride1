
// frontend/my-react-app/src/layouts/MainLayout.jsx 
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
  FolderOpen,
} from "phosphor-react";

import { useAuth } from "../context/AuthContext";
import {
  fetchAdminNotificationCount,
  fetchBmNotificationCount,
} from "../api/notificationsApi";
import logo from "../assets/arche-logo.png";
import { exportToExcel } from "../utils/exportToExcel";

const MODULE_LINKS = [
  { key: "dashboard", label: "Dashboard", icon: House },
  { key: "risks", label: "Risk", icon: Warning },
  { key: "issues", label: "Issue", icon: Circle },
  { key: "dependencies", label: "Dependency", icon: Link },
  { key: "escalations", label: "Escalation", icon: TrendUp },
  { key: "actions", label: "Action", icon: CheckCircle },
  { key: "appreciations", label: "Appreciation", icon: ThumbsUp },
  { key: "collections", label: "Collection", icon: FolderOpen },
];

function getTitle(pathname, search) {
  if (pathname.startsWith("/monitoring")) return "Monitoring";
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
  return "App";
}

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const now = new Date();

  const [notifCount, setNotifCount] = useState(0);
const [showToast, setShowToast] = useState(false);

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

    // ADMIN: monitoring (view)
    if (user.role === "ADMIN") {
      if (item.key === "dashboard") {
        navigate("/monitoring");
      } else {
        navigate(`/monitoring/${item.key}`);
      }
      return;
    }

    // BM / PM: modules (edit)
    if (user.role === "BM" || user.role === "PM") {
      if (item.key === "dashboard") {
        navigate("/modules/risks?mode=edit");
      } else {
        navigate(`/modules/${item.key}?mode=edit`);
      }
      return;
    }

    // any other role
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

  // load notification count
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
    <div className="min-h-screen flex flex-col bg-gray-50 text-brandDark font-urbanist">
      {/* header */}
      <header className="h-16 flex items-center justify-between border-b border-gray-200 bg-white px-6 sm:px-8">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Arche logo"
            className="h-8 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="font-marcellus text-lg leading-tight">
              {title}
            </span>
            <span className="text-[11px] text-brandMuted uppercase tracking-[0.2em]">
              Delivery Monitoring
            </span>
          </div>

          {/* View / Edit toggle ONLY for modules */}
          {isModules && (
            <div className="ml-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-1 py-1">
              <button
                type="button"
                onClick={() => handleModeChange("view")}
                className={`px-3 py-1 text-xs rounded-full ${currentMode === "view"
                  ? "bg-white text-brandDark shadow-sm"
                  : "text-brandMuted"
                  }`}
              >
                View
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("edit")}
                className={`px-3 py-1 text-xs rounded-full ${currentMode === "edit"
                  ? "bg-brandDark text-white shadow-sm"
                  : "text-brandMuted"
                  }`}
              >
                Edit
              </button>
            </div>
          )}
        </div>
        {location.pathname.startsWith("/monitoring") && (
          <button
            type="button"
            title="Export to Excel"
            onClick={() => {
              const moduleKey = location.pathname.split("/").pop();
              const exportData = window.__EXPORT_DATA__?.[moduleKey];

              if (!exportData || !exportData.rows?.length) {
                alert(`No data available to export for ${moduleKey}`);
                return;
              }

              exportToExcel(exportData);

              // ✅ show toast
              setShowToast(true);
              setTimeout(() => setShowToast(false), 2000);
            }}
            className="ml-auto mr-4 rounded-full h-8 w-8 flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-100 relative"
          >
            📥

          </button>
        )}
        {showToast && (
          <div className="absolute right-40 top-20 z-50
                  rounded-md bg-green-600 px-3 py-1.5
                  text-xs text-white shadow-lg
                  animate-fade">
            ✅ Downloaded successfully
          </div>
        )}




        <div className="flex items-center gap-6 text-xs sm:text-sm">
          {/* Notification bell for any logged-in user (role decides route) */}
          {user && (
            <button
              type="button"
              onClick={goNotifications}
              className="relative rounded-full h-8 w-8 flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-100"
              title="Notifications"
            >
              🔔
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[16px] text-center">
                  {notifCount}
                </span>
              )}
            </button>
          )}

          <div className="text-right">
            <div className="font-medium">
              {user?.email || "admin@example.com"}
            </div>
            <div className="text-brandMuted text-[11px]">
              {user?.role || "Admin User"}
            </div>
          </div>
          <div className="text-right text-brandMuted text-[11px]">
            <div>{now.toLocaleDateString()}</div>
            <div>{now.toLocaleTimeString()}</div>
          </div>
        </div>
      </header >

  {/* body */ }
  < div className = "flex flex-1 min-h-0" >
    {/* sidebar */ }
    <aside aside className = "w-56 bg-white border-r border-gray-200 pt-4 pb-6" >
      <nav>
        <ul className="space-y-1">
          {(user && user.role === "ADMIN")
            ? MODULE_LINKS.map((item) => {
                const active = isActive(item.key);
                const Icon = item.icon;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(item)}
                      className={`w-full text-left px-4 py-2 rounded-r-full text-sm transition flex items-center gap-3 ${active
                        ? "bg-orange-400 text-white font-semibold"
                        : "text-brandDark hover:bg-gray-100"
                        }`}
                    >
                      <Icon size={20} weight="fill" className="flex-shrink-0" />
                      {item.label}
                    </button>
                  </li>
                );
              })
            : MODULE_LINKS.filter((item) => item.key !== "dashboard").map((item) => {
                const active = isActive(item.key);
                const Icon = item.icon;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(item)}
                      className={`w-full text-left px-4 py-2 rounded-r-full text-sm transition flex items-center gap-3 ${active
                        ? "bg-orange-400 text-white font-semibold"
                        : "text-brandDark hover:bg-gray-100"
                        }`}
                    >
                      <Icon size={20} weight="fill" className="flex-shrink-0" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
        </ul>
      </nav>
        </aside >

  {/* content */ }
  <main main className = "flex-1 min-h-0 overflow-auto px-4 sm:px-6 py-4" >
    { children }
        </main >
      </div >
    </div >
  );
};

export default MainLayout;
