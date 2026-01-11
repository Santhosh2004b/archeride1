// Quick fix script for monitoring pages
const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, 'frontend', 'my-react-app', 'src', 'pages');

// Fix Dependencies
const depsFile = path.join(PAGES_DIR, 'MonitoringDependenciesPage.jsx');
let depsContent = fs.readFileSync(depsFile, 'utf8');

// Add missing imports after RxCross2
if (!depsContent.includes('import LayoutBuilder')) {
    depsContent = depsContent.replace(
        'import { RxCross2 } from "react-icons/rx";',
        `import { RxCross2 } from "react-icons/rx";\nimport LayoutBuilder from "../components/LayoutBuilder";\nimport { getLayoutApi, saveLayoutApi } from "../api/layoutApi";\nimport { dependenciesFormConfig } from "../config/formConfig";\nimport { Pen } from "phosphor-react";`
    );
}

// Fix button placement - remove the extra </motion.div> before the button
depsContent = depsContent.replace(
    /(<\/div>\s*<\/motion\.div>)\s*{\/\* Customize Form Button \*\/}/,
    '        \n        {/* Customize Form Button */'
);

// Remove duplicate </motion.div> after button
depsContent = depsContent.replace(
    /(<\/button>)\s*<\/motion\.div>\s*<\/motion\.div>\s*{\/\* ROW 1/,
    '$1\n\n      </motion.div>\n\n      {/* ROW 1'
);

fs.writeFileSync(depsFile, depsContent, 'utf8');
console.log('✅ Fixed MonitoringDependenciesPage.jsx');

// Fix Escalations (same pattern)
const escFile = path.join(PAGES_DIR, 'MonitoringEscalationsPage.jsx');
let escContent = fs.readFileSync(escFile, 'utf8');

if (!escContent.includes('import LayoutBuilder')) {
    escContent = escContent.replace(
        /import.*from "react-icons\/rx";/,
        `$&\nimport LayoutBuilder from "../components/LayoutBuilder";\nimport { getLayoutApi, saveLayoutApi } from "../api/layoutApi";\nimport { escalationsFormConfig } from "../config/formConfig";\nimport { Pen } from "phosphor-react";`
    );
}

escContent = escContent.replace(
    /(<\/div>\s*<\/motion\.div>)\s*{\/\* Customize Form Button \*\/}/,
    '        \n        {/* Customize Form Button */'
);

escContent = escContent.replace(
    /(<\/button>)\s*<\/motion\.div>\s*<\/motion\.div>\s*{\/\* ROW 1/,
    '$1\n\n      </motion.div>\n\n      {/* ROW 1'
);

fs.writeFileSync(escFile, escContent, 'utf8');
console.log('✅ Fixed MonitoringEscalationsPage.jsx');

// Fix Issues - add missing imports
const issuesFile = path.join(PAGES_DIR, 'MonitoringIssuesPage.jsx');
let issuesContent = fs.readFileSync(issuesFile, 'utf8');

if (!issuesContent.includes('import LayoutBuilder')) {
    issuesContent = issuesContent.replace(
        'import { issuesFormConfig } from "../config/formConfig";',
        `import { issuesFormConfig } from "../config/formConfig";\nimport LayoutBuilder from "../components/LayoutBuilder";\nimport { getLayoutApi, saveLayoutApi } from "../api/layoutApi";\nimport { Pen } from "phosphor-react";`
    );
}

fs.writeFileSync(issuesFile, issuesContent, 'utf8');
console.log('✅ Fixed MonitoringIssuesPage.jsx');

// Fix Actions
const actionsFile = path.join(PAGES_DIR, 'MonitoringActionsPage.jsx');
let actionsContent = fs.readFileSync(actionsFile, 'utf8');

if (!actionsContent.includes('import LayoutBuilder')) {
    actionsContent = actionsContent.replace(
        /import.*from "react-icons\/rx";/,
        `$&\nimport LayoutBuilder from "../components/LayoutBuilder";\nimport { getLayoutApi, saveLayoutApi } from "../api/layoutApi";\nimport { actionsFormConfig } from "../config/formConfig";\nimport { Pen } from "phosphor-react";`
    );
}

fs.writeFileSync(actionsFile, actionsContent, 'utf8');
console.log('✅ Fixed MonitoringActionsPage.jsx');

// Fix Collections
const collectionsFile = path.join(PAGES_DIR, 'MonitoringCollectionsPage.jsx');
let collectionsContent = fs.readFileSync(collectionsFile, 'utf8');

if (!collectionsContent.includes('import LayoutBuilder')) {
    collectionsContent = collectionsContent.replace(
        /import.*from "react-icons\/rx";/,
        `$&\nimport LayoutBuilder from "../components/LayoutBuilder";\nimport { getLayoutApi, saveLayoutApi } from "../api/layoutApi";\nimport { collectionsFormConfig } from "../config/formConfig";\nimport { Pen } from "phosphor-react";`
    );
}

fs.writeFileSync(collectionsFile, collectionsContent, 'utf8');
console.log('✅ Fixed MonitoringCollectionsPage.jsx');

// Fix Appreciations
const appreciationsFile = path.join(PAGES_DIR, 'MonitoringAppreciationsPage.jsx');
let appreciationsContent = fs.readFileSync(appreciationsFile, 'utf8');

if (!appreciationsContent.includes('import LayoutBuilder')) {
    appreciationsContent = appreciationsContent.replace(
        /import.*from "react-icons\/rx";/,
        `$&\nimport LayoutBuilder from "../components/LayoutBuilder";\nimport { getLayoutApi, saveLayoutApi } from "../api/layoutApi";\nimport { appreciationsFormConfig } from "../config/formConfig";\nimport { Pen } from "phosphor-react";`
    );
}

fs.writeFileSync(appreciationsFile, appreciationsContent, 'utf8');
console.log('✅ Fixed MonitoringAppreciationsPage.jsx');

console.log('\n🎉 All files fixed!');
