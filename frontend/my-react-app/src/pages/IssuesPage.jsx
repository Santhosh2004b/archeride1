
import React, { useEffect, useState } from "react";
import { fetchIssues } from "../api/issuesApi";
import { formatDisplayDate } from "../utils/dateFormat";

function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchIssues();
        setIssues(res.data || []);
      } catch (err) {
        setError(err.message || "Failed to load issues");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading issues...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="module-page">
      <h1 className="page-title">Issues</h1>
      <table className="paginated-table">
        <thead>
          <tr>
            <th>Issue ID</th>
            <th>Project ID</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Title</th>
            <th>Reported Date</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((i) => (
            <tr key={i.id}>
              <td>{i.issue_id}</td>
              <td>{i.manual_project_id}</td>
              <td>{i.status}</td>
              <td>{i.priority}</td>
              <td>{i.issue_title}</td>
              <td>{formatDisplayDate(i.reported_date, true)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default IssuesPage;
