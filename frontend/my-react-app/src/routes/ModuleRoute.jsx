
import React from "react";
import { useParams, useLocation } from "react-router-dom";
import WorkboardPage from "../pages/WorkboardPage";

import { fetchRisks, fetchRiskApi, createRiskApi, updateRiskApi } from "../api/risksApi";
import { fetchIssues, fetchIssueApi, createIssueApi, updateIssueApi } from "../api/issuesApi";
import { fetchActions, fetchActionApi, createActionApi, updateActionApi } from "../api/actionsApi";
import {
  fetchDependencies,
  fetchDependencyApi,
  createDependencyApi,
  updateDependencyApi,
} from "../api/dependenciesApi";
import {
  fetchEscalations,
  fetchEscalationApi,
  createEscalationApi,
  updateEscalationApi,
} from "../api/escalationsApi";
import {
  fetchAppreciations,
  fetchAppreciationApi,
  createAppreciationApi,
  updateAppreciationApi,
} from "../api/appreciationsApi";

import {
  risksFormConfig,
  issuesFormConfig,
  actionsFormConfig,
  dependenciesFormConfig,
  escalationsFormConfig,
  appreciationsFormConfig,
} from "../config/formConfig";

const moduleMap = {
  risks: {
    title: "Risks Workboard",
    fetchList: fetchRisks,
    fetchItem: fetchRiskApi,
    createItem: createRiskApi,
    updateItem: updateRiskApi,
    formConfig: risksFormConfig,
  },
  issues: {
    title: "Issues Workboard",
    fetchList: fetchIssues,
    fetchItem: fetchIssueApi,
    createItem: createIssueApi,
    updateItem: updateIssueApi,
    formConfig: issuesFormConfig,
  },
  actions: {
    title: "Actions Workboard",
    fetchList: fetchActions,
    fetchItem: fetchActionApi,
    createItem: createActionApi,
    updateItem: updateActionApi,
    formConfig: actionsFormConfig,
  },
  dependencies: {
    title: "Dependencies Workboard",
    fetchList: fetchDependencies,
    fetchItem: fetchDependencyApi,
    createItem: createDependencyApi,
    updateItem: updateDependencyApi,
    formConfig: dependenciesFormConfig,
  },
  escalations: {
    title: "Escalations Workboard",
    fetchList: fetchEscalations,
    fetchItem: fetchEscalationApi,
    createItem: createEscalationApi,
    updateItem: updateEscalationApi,
    formConfig: escalationsFormConfig,
  },
  appreciations: {
    title: "Appreciations Workboard",
    fetchList: fetchAppreciations,
    fetchItem: fetchAppreciationApi,
    createItem: createAppreciationApi,
    updateItem: updateAppreciationApi,
    formConfig: appreciationsFormConfig,
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
      fetchItem={cfg.fetchItem}
      
      createItem={mode === "edit" ? cfg.createItem : null}
      
      updateItem={cfg.updateItem}
      formConfig={cfg.formConfig}
    />
  );
};

export default ModuleRoute;
