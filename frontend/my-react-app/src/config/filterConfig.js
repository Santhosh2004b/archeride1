// =========================
// MASTER FILTER CONFIG (FINAL)
// =========================

export const filterConfig = {
  /* 1️⃣ RISKS */
  risks: {
    fields: [
      { name: "account", label: "Account", type: "text" },
      {
        name: "status", label: "Status", type: "select",
        options: ["Open", "In Progress", "On Hold", "Resolved", "Approved & Closed", "Cancelled"]
      },
      {
        name: "priority", label: "Priority", type: "select",
        options: ["Critical", "High", "Medium", "Low"]
      },
      {
        name: "category", label: "Category", type: "select",
        options: ["Schedule", "Scope", "Technical", "Resource", "Security", "Operational"]
      },
      {
        name: "probability", label: "Probability", type: "select",
        options: ["Very High", "High", "Medium", "Low", "Very Low"]
      },
      {
        name: "impact", label: "Impact", type: "select",
        options: ["Critical", "High", "Medium", "Low", "Minimal"]
      }
    ]
  },

  /* 2️⃣ ISSUES */
  // ...existing code...
  issues: {
    fields: [
      { name: "account", label: "Account", type: "text" },
      { name: "search", label: "Search", type: "text" }, // free-text search (optional)
      {
        name: "status", label: "Status", type: "select",
        options: ["Open", "In Progress", "On Hold", "Resolved", "Approved & Closed", "Cancelled"]
      },
      {
        name: "priority", label: "Priority", type: "select",
        options: ["Low", "Medium", "High", "Critical"]
      },
      {
        name: "category", label: "Category", type: "select",
        options: ["Technical", "Operational", "Resource", "Infrastructure", "Application", "Network", "Security", "Performance"]
      }
    ]
  },
  // ...existing code...

  /* 3️⃣ DEPENDENCIES */
  dependencies: {
    fields: [
      { name: "account", label: "Account", type: "text" },
      {
        name: "status", label: "Status", type: "select",
        options: ["Open", "In Progress", "On Hold", "Resolved", "Approved & Closed", "Cancelled"]
      },
      {
        name: "priority", label: "Priority", type: "select",
        options: ["Critical", "High", "Medium", "Low"]
      },
      {
        name: "type", label: "Type", type: "select",
        options: ["Internal", "External", "Vendor", "Client", "Cross-Team"]
      }
    ]
  },

  /* 4️⃣ ESCALATIONS */
  escalations: {
    fields: [
      { name: "account", label: "Account", type: "text" },
      {
        name: "status", label: "Status", type: "select",
        options: ["Open", "In Progress", "On Hold", "Resolved", "Approved & Closed", "Cancelled"]
      },
      {
        name: "priority", label: "Priority", type: "select",
        options: ["Critical", "High", "Medium", "Low"]
      },
      {
        name: "category", label: "Category", type: "select",
        options: ["Performance", "Availability", "Security", "Quality", "Communication", "Resource", "Budget", "Scope"]
      }
    ]
  },

  /* 5️⃣ ACTIONS */
  actions: {
    fields: [
      { name: "account", label: "Account", type: "text" },
      {
        name: "status", label: "Status", type: "select",
        options: ["Open", "In Progress", "On Hold", "Resolved", "Approved & Closed", "Cancelled"]
      },
      {
        name: "priority", label: "Priority", type: "select",
        options: ["Critical", "High", "Medium", "Low"]
      },
      {
        name: "related_to_type", label: "Related To", type: "select",
        options: ["Risk", "Issue"]
      }
      // no dates inside filters 🚫
    ]
  },

  /* 6️⃣ COLLECTIONS */
  collections: {
    fields: [
      { name: "account", label: "Account", type: "text" },
      {
        name: "status", label: "Status", type: "select",
        options: ["Pending", "Partially Paid", "Paid", "Overdue", "Disputed", "Written Off"]
      },
      {
        name: "currency", label: "Currency", type: "select",
        options: ["INR", "USD", "EUR", "GBP"]
      }
      // no date filters here 🚫
    ]
  }
};
