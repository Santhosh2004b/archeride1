import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function useMonitoringExport(moduleKey, rows) {
  const { user } = useAuth();

  useEffect(() => {
    if (!window.__EXPORT_DATA__) {
      window.__EXPORT_DATA__ = {};
    }

    // no rows → clear only this module
    if (!rows || rows.length === 0) {
      delete window.__EXPORT_DATA__[moduleKey];
    } else {
      const safeUser =
        (user?.email || user?.username || "anonymous").replace(/[@.]/g, "_");

      window.__EXPORT_DATA__[moduleKey] = {
        rows,
        fileName: `monitoring_${moduleKey}_${safeUser}`,
      };
    }

    // 🔥 THE IMPORTANT PART 🔥
    // **React thinks cleanup returns something called destroy**
    // so we explicitly return a NO-OP function
    return () => {}; // <- prevents destroy(runtimeValue)
  }, [moduleKey, rows, user]);
}
