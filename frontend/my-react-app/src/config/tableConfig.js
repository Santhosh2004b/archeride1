// frontend/my-react-app/src/config/tableConfig.js
const tableConfig = {
  risks: {
    columns: [
      { key: "risk_id", label: "Risk ID" },
      { key: "project_name", label: "Project" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "risk_title", label: "Title" },
      { key: "identified_date", label: "Identified Date" },
    ],
  },
  issues: {
    columns: [
      { key: "issue_id", label: "Issue ID" },
      { key: "project_name", label: "Project" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "issue_title", label: "Title" },
      { key: "reported_date", label: "Reported Date" },
    ],
  },
  actions: {
    columns: [
      { key: "action_id", label: "Action ID" },
      { key: "project_name", label: "Project" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "action_title", label: "Title" },
      { key: "due_date", label: "Due Date" },
    ],
  },
  dependencies: {
    columns: [
      { key: "dependency_id", label: "Dependency ID" },
      { key: "project_name", label: "Project" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "dependency_title", label: "Title" },
      { key: "required_by_date", label: "Required By" },
    ],
  },
  escalations: {
    columns: [
      { key: "escalation_id", label: "Escalation ID" },
      { key: "project_name", label: "Project" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "title", label: "Title" },
      { key: "reported_date", label: "Reported Date" },
    ],
  },
  appreciations: {
    columns: [
      { key: "appreciation_id", label: "Appreciation ID" },
      { key: "project_name", label: "Project" },
      { key: "customer_name", label: "Customer" },
      { key: "appreciation_type", label: "Type" },
      { key: "subject", label: "Subject" },
      { key: "received_date", label: "Received Date" },
    ],
  },
  collections: {
    columns: [
      { key: "invoice_id", label: "Invoice ID" },
      { key: "project_name", label: "Project" },
      { key: "customer_name", label: "Customer" },
      { key: "invoice_date", label: "Invoice Date" },
      { key: "invoice_amount", label: "Amount" },
      { key: "status", label: "Status" },
    ],
  },
};

export default tableConfig;

