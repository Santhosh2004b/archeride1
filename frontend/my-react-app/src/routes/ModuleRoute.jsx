// frontend/my-react-app/src/routes/ModuleRoute.jsx
import React from "react";
import { useParams, useLocation } from "react-router-dom";
import WorkboardPage from "../pages/WorkboardPage";

import { fetchRisks, createRiskApi, updateRiskApi } from "../api/risksApi";
import { fetchIssues, createIssueApi, updateIssueApi } from "../api/issuesApi";
import { fetchActions, createActionApi, updateActionApi } from "../api/actionsApi";
import {
  fetchDependencies,
  createDependencyApi,
  updateDependencyApi,
} from "../api/dependenciesApi";
import {
  fetchEscalations,
  createEscalationApi,
  updateEscalationApi,
} from "../api/escalationsApi";
import {
  fetchAppreciations,
  createAppreciationApi,
  updateAppreciationApi,
} from "../api/appreciationsApi";
import {
  fetchCollections,
  createCollectionApi,
  updateCollectionApi,
} from "../api/collectionsApi";

import {
  risksFormConfig,
  issuesFormConfig,
  actionsFormConfig,
  dependenciesFormConfig,
  escalationsFormConfig,
  appreciationsFormConfig,
  collectionsFormConfig,
} from "../config/formConfig";

const moduleMap = {
  risks: {
    title: "Risks Workboard",
    fetchList: fetchRisks,
    createItem: createRiskApi,
    updateItem: updateRiskApi,
    formConfig: risksFormConfig,
  },
  issues: {
    title: "Issues Workboard",
    fetchList: fetchIssues,
    createItem: createIssueApi,
    updateItem: updateIssueApi,
    formConfig: issuesFormConfig,
  },
  actions: {
    title: "Actions Workboard",
    fetchList: fetchActions,
    createItem: createActionApi,
    updateItem: updateActionApi,
    formConfig: actionsFormConfig,
  },
  dependencies: {
    title: "Dependencies Workboard",
    fetchList: fetchDependencies,
    createItem: createDependencyApi,
    updateItem: updateDependencyApi,
    formConfig: dependenciesFormConfig,
  },
  escalations: {
    title: "Escalations Workboard",
    fetchList: fetchEscalations,
    createItem: createEscalationApi,
    updateItem: updateEscalationApi,
    formConfig: escalationsFormConfig,
  },
  appreciations: {
    title: "Appreciations Workboard",
    fetchList: fetchAppreciations,
    createItem: createAppreciationApi,
    updateItem: updateAppreciationApi,
    formConfig: appreciationsFormConfig,
  },
  collections: {
    title: "Collections Workboard",
    fetchList: fetchCollections,
    createItem: createCollectionApi,
    updateItem: updateCollectionApi,
    formConfig: collectionsFormConfig,
  },
};

const ModuleRoute = () => {
  const { moduleKey } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode") || "view";

  const cfg = moduleMap[moduleKey];
  if (!cfg) return <div>Unknown module: {moduleKey}</div>;

  return (
    <WorkboardPage
      title={cfg.title}
      moduleKey={moduleKey}
      mode={mode}
      fetchList={cfg.fetchList}
      // Add New only in edit mode
      createItem={mode === "edit" ? cfg.createItem : null}
      // Always allow updating so view table can show Edit buttons
      updateItem={cfg.updateItem}
      formConfig={cfg.formConfig}
    />
  );
};

export default ModuleRoute;
