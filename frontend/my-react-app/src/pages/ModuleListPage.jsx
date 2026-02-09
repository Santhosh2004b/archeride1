import React from 'react';
import WorkboardPage from './WorkboardPage';
import {
  risksFormConfig,
  issuesFormConfig,
  escalationsFormConfig,
  actionsFormConfig,
  dependenciesFormConfig,
  appreciationsFormConfig
} from '../config/formConfig';

const ModuleListPage = ({ moduleKey, mode }) => {
  const configs = {
    risks: risksFormConfig,
    issues: issuesFormConfig,
    escalations: escalationsFormConfig,
    actions: actionsFormConfig,
    dependencies: dependenciesFormConfig,
    appreciations: appreciationsFormConfig
  };

  return (
    <WorkboardPage
      moduleKey={moduleKey}
      mode={mode}
      formConfig={configs[moduleKey]}
    />
  );
};

export default ModuleListPage;
