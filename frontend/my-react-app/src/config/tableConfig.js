
const tableConfig = {
  risks: {
    columns: [
      { key: "risk_id", label: "Risk ID" },
      { key: "account", label: "Account" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "risk_title", label: "Title" },
      { key: "identified_date", label: "Identified Date" },
    ],
  },
  issues: {
    columns: [
      { key: "issue_id", label: "Issue ID" },
      { key: "account", label: "Account" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "issue_title", label: "Title" },
      { key: "reported_date", label: "Reported Date" },
    ],
  },
  actions: {
    columns: [
      { key: "action_id", label: "Action ID" },
      { key: "account", label: "Account" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "action_title", label: "Title" },
      { key: "due_date", label: "Due Date" },
    ],
  },
  dependencies: {
    columns: [
      { key: "dependency_id", label: "Dependency ID" },
      { key: "account", label: "Account" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "dependency_title", label: "Title" },
      { key: "required_by_date", label: "Required By" },
    ],
  },
  escalations: {
    columns: [
      { key: "escalation_id", label: "Escalation ID" },
      { key: "account", label: "Account" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "title", label: "Title" },
      { key: "reported_date", label: "Reported Date" },
    ],
  },
  appreciations: {
    columns: [
      { key: "appreciation_id", label: "Appreciation ID" },
      { key: "account", label: "Account" },
      { key: "customer_name", label: "Customer" },
      { key: "appreciation_type", label: "Type" },
      { key: "subject", label: "Subject" },
      { key: "received_date", label: "Received Date" },
    ],
  },
};

export default tableConfig;


