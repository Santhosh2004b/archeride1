import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function useMonitoringExport(moduleKey, rows) {
  const { user } = useAuth();

  useEffect(() => {
    if (!window.__EXPORT_DATA__) {
      window.__EXPORT_DATA__ = {};
    }

    
    if (!rows || rows.length === 0) {
      delete window.__EXPORT_DATA__[moduleKey];
    } else {
      const safeUser =
        (user?.email || user?.username || "anonymous").replace(/[@.]/g, "_");

      const now = new Date();
      const workboardName = moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1);
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} - ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      window.__EXPORT_DATA__[moduleKey] = {
        rows,
        fileName: `${workboardName} _Workboard ${formattedDate}`,
      };
    }

    
    
    
    return () => { }; 
  }, [moduleKey, rows, user]);
}
