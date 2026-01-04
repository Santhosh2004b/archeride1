// frontend/my-react-app/src/config/formConfig.js

// Shared Engagement options (use the same IDs you have in projects table)
// after — add `export`
// Shared Engagement options (use the same IDs you have in projects table)

export const risksFormConfig = {
  fields: [
    { name: "risk_id", label: "Risk ID", type: "text", required: false, readOnly: true },
    {
      name: "project_name",
      label: "Project Name",
      type: "text", required: false,
    },
    { name: "identified_date", label: "Identified Date", type: "date", required: true },
    { name: "identified_by", label: "Identified By", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        "Open",
        "on-holding",
        "Resolved",
        "Cancelled",
      ],
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      required: true,
      options: ["Critical", "High", "Medium", "Low"],
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: ["Schedule", "Scope", "Technical", "Resource", "Security", "Operational"],
    },
    { name: "risk_title", label: "Risk Title", type: "text", required: true },
    { name: "risk_description", label: "Risk Description", type: "textarea", required: true },
    {
      name: "probability",
      label: "Probability",
      type: "select",
      required: true,
      options: ["Very High", "High", "Medium", "Low", "Very Low"],
    },
    {
      name: "impact",
      label: "Impact",
      type: "select",
      required: true,
      options: ["Critical", "High", "Medium", "Low", "Minimal"],
    },
    { name: "risk_score", label: "Risk Score", type: "text", required: false },
    { name: "mitigation_strategy", label: "Mitigation Strategy", type: "textarea", required: false },
    { name: "mitigation_owner", label: "Mitigation Owner", type: "text", required: false },
    { name: "target_mitigation_date", label: "Target Mitigation Date", type: "date", required: false },
    { name: "current_status", label: "Current Status", type: "textarea", required: false },
    { name: "last_reviewed_date", label: "Last Reviewed Date", type: "date", required: false },
    { name: "comments", label: "Comments", type: "textarea", required: false },
  ],
};

export const issuesFormConfig = {
  fields: [
    { name: "issue_id", label: "Issue ID", type: "text", required: false, readOnly: true },
    { name: "project_name", label: "Project Name", type: "text", required: false },
    { name: "identified_date", label: "Identified Date", type: "date", required: true },
    { name: "identified_by", label: "Identified By", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: ["Open", "On Hold", "Resolved", "Cancelled"],
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      required: true,
      options: ["Critical", "High", "Medium", "Low"],
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: ["Technical", "Operational", "Resource", "Infrastructure", "Application", "Network", "Security", "Performance"],
    },
    { name: "issue_title", label: "Issue Title", type: "text", required: true },
    { name: "issue_description", label: "Issue Description", type: "textarea", required: true },
    { name: "impact_on_project", label: "Impact on Project", type: "textarea", required: true },
    { name: "affected_system", label: "Affected System/Service", type: "text", required: true },
    { name: "assigned_to", label: "Assigned To", type: "text", required: true },
    { name: "target_resolution_date", label: "Target Resolution Date", type: "date", required: true },
    { name: "actual_resolution_date", label: "Actual Resolution Date", type: "date", required: false },
    { name: "resolution_details", label: "Resolution Details", type: "textarea", required: false },
    { name: "root_cause_analysis", label: "Root Cause Analysis", type: "textarea", required: false },
    { name: "last_updated", label: "Last Updated", type: "date", required: true },
    { name: "comments", label: "Comments", type: "textarea", required: false },
  ],
};

export const actionsFormConfig = {
  fields: [
    { name: "action_id", label: "Action ID", type: "text", required: false, readOnly: true },
    {
      name: "project_name",
      label: "Project Name",


      type: "text", required: false,
    },
    { name: "created_date", label: "Created Date", type: "date", required: true },
    { name: "created_by", label: "Created By", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        "Open",
        "on-holding",
        "Resolved",
        "Cancelled",
      ],
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      required: true,
      options: ["Critical", "High", "Medium", "Low"],
    },
    { name: "action_title", label: "Action Title", type: "text", required: true },
    { name: "action_description", label: "Action Description", type: "textarea", required: true },
    { name: "action_owner", label: "Action Owner", type: "text", required: true },
    { name: "due_date", label: "Due Date", type: "date", required: true },
    { name: "completion_date", label: "Completion Date", type: "date", required: false },
    { name: "completion_percent", label: "Completion %", type: "text", required: false },
    // in actionsFormConfig
    {
      name: "related_to_type",
      label: "Related To Type (Risk/Issue)",
      type: "select",
      required: false,
      options: ["Risk", "Issue"],
    },
    {
      name: "related_to_id",
      label: "Related To ID",
      type: "text",
      required: false,
    },

    { name: "dependencies", label: "Dependencies", type: "textarea", required: false },
    { name: "last_updated", label: "Last Updated", type: "date", required: true },
    { name: "comments", label: "Comments", type: "textarea", required: false },
  ],
};

export const dependenciesFormConfig = {
  fields: [
    { name: "dependency_id", label: "Dependency ID", type: "text", required: false, readOnly: true },
    {
      name: "project_name",
      label: "Project Name",


      type: "text", required: false,
    },
    { name: "reported_date", label: "Reported Date", type: "date", required: true },
    { name: "reported_by", label: "Reported By", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        "Open",
        "on-holding",
        "Resolved",
        "Cancelled",
      ],
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      required: true,
      options: ["Critical", "High", "Medium", "Low"],
    },
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      options: ["Internal", "External", "Vendor", "Client", "Cross-Team"],
    },
    { name: "dependency_title", label: "Dependency Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    {
      name: "dependent_on",
      label: "Dependent On (Team/Party)",
      type: "text",
      required: true,
    },
    {
      name: "impact_if_not_resolved",
      label: "Impact if Not Resolved",
      type: "textarea",
      required: true,
    },
    { name: "required_by_date", label: "Required By Date", type: "date", required: true },
    { name: "current_status", label: "Current Status", type: "textarea", required: false },
    { name: "follow_up_date", label: "Follow-up Date", type: "date", required: false },
    { name: "contact_person", label: "Contact Person", type: "text", required: false },
    { name: "contact_details", label: "Contact Details", type: "text", required: false },
    { name: "last_updated", label: "Last Updated", type: "date", required: true },
    { name: "comments", label: "Comments", type: "textarea", required: false },
  ],
};

export const escalationsFormConfig = {
  fields: [
    { name: "escalation_id", label: "Escalation ID", type: "text", required: false, readOnly: true },
    {
      name: "project_name",
      label: "Project Name",


      type: "text", required: false,
    },
    { name: "reported_date", label: "Reported Date", type: "date", required: true },
    { name: "reported_by", label: "Reported By", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        "Open",
        "on-holding",
        "Resolved",
        "Cancelled",
      ],
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      required: true,
      options: ["Critical", "High", "Medium", "Low"],
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: [
        "Performance",
        "Availability",
        "Security",
        "Quality",
        "Communication",
        "Resource",
        "Budget",
        "Scope",
      ],
    },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "impact", label: "Impact", type: "textarea", required: true },
    { name: "customer_name", label: "Customer Name", type: "text", required: false },
    { name: "escalated_to", label: "Escalated To", type: "text", required: false },
    {
      name: "target_resolution_date",
      label: "Target Resolution Date",
      type: "date",
      required: true,
    },
    {
      name: "actual_resolution_date",
      label: "Actual Resolution Date",
      type: "date",
      required: false,
    },
    { name: "resolution_details", label: "Resolution Details", type: "textarea", required: false },
    { name: "root_cause", label: "Root Cause", type: "textarea", required: false },
    { name: "preventive_actions", label: "Preventive Actions", type: "textarea", required: false },
    { name: "last_updated", label: "Last Updated", type: "date", required: true },
    { name: "comments", label: "Comments", type: "textarea", required: false },
  ],
};

export const appreciationsFormConfig = {
  fields: [
    { name: "appreciation_id", label: "Appreciation ID", type: "text", required: false, readOnly: true },
    {
      name: "project_name",
      label: "Project Name",


      type: "text", required: false,
    },
    { name: "received_date", label: "Received Date", type: "date", required: true },
    { name: "recorded_by", label: "Recorded By", type: "text", required: true },
    { name: "customer_name", label: "Customer Name", type: "text", required: true },
    { name: "customer_contact", label: "Customer Contact", type: "text", required: false },
    {
      name: "appreciation_type",
      label: "Appreciation Type",
      type: "select",
      required: true,
      options: ["Email", "Call", "Meeting", "Formal Letter", "Survey Feedback", "Verbal"],
    },
    { name: "subject", label: "Subject", type: "text", required: true },
    { name: "details", label: "Details", type: "textarea", required: true },
    {
      name: "team_members_recognized",
      label: "Team Members Recognized",
      type: "textarea",
      required: false,
    },
    {
      name: "shared_with_team",
      label: "Shared with Team",
      type: "select",
      required: true,
      options: ["Yes", "No"],
    },
    { name: "follow_up_action", label: "Follow-up Action", type: "textarea", required: false },
    { name: "last_updated", label: "Last Updated", type: "date", required: true },
    { name: "comments", label: "Comments", type: "textarea", required: false },
  ],
};

export const collectionsFormConfig = {
  fields: [
    { name: "invoice_id", label: "Invoice ID", type: "text", required: false, readOnly: true },
    {
      name: "project_name",
      label: "Project Name",


      type: "text", required: false,
    },
    { name: "customer_name", label: "Customer Name", type: "text", required: true },
    { name: "invoice_date", label: "Invoice Date", type: "date", required: true },
    { name: "invoice_amount", label: "Invoice Amount", type: "text", required: true },
    {
      name: "currency",
      label: "Currency",
      type: "select",
      required: true,
      options: ["INR", "USD", "EUR", "GBP"],
    },
    { name: "due_date", label: "Due Date", type: "date", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: ["Pending", "Partially Paid", "Paid", "Overdue", "Disputed", "Written Off"],
    },
    { name: "days_overdue", label: "Days Overdue", type: "text", required: false },
    { name: "amount_received", label: "Amount Received", type: "text", required: false },
    { name: "outstanding_amount", label: "Outstanding Amount", type: "text", required: false },
    { name: "last_follow_up_date", label: "Last Follow-up Date", type: "date", required: false },
    { name: "next_follow_up_date", label: "Next Follow-up Date", type: "date", required: false },
    {
      name: "payment_status",
      label: "Payment Status",
      type: "select",
      required: true,
      options: [
        "PO Received - Payment in Process",
        "Under Review",
        "Approved - Awaiting Payment",
        "Partially Paid",
        "Paid",
        "Disputed",
        "On Hold",
      ],
    },
    { name: "follow_up_owner", label: "Follow-up Owner", type: "text", required: false },
    { name: "customer_contact", label: "Customer Contact", type: "text", required: false },
    { name: "remarks", label: "Remarks", type: "textarea", required: false },
    { name: "last_updated", label: "Last Updated", type: "date", required: true },
  ],
};
