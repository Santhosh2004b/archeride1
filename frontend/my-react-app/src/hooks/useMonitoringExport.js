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

      const workboardName = moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1);
      window.__EXPORT_DATA__[moduleKey] = {
        rows,
        fileName: `${workboardName}_Workboard_Data`,
      };
    }

    // 🔥 THE IMPORTANT PART 🔥
    // **React thinks cleanup returns something called destroy**
    // so we explicitly return a NO-OP function
    return () => { }; // <- prevents destroy(runtimeValue)
  }, [moduleKey, rows, user]);
}
