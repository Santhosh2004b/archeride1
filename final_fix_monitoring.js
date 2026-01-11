// Final fix for all monitoring page errors
const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, 'frontend', 'my-react-app', 'src', 'pages');

// Fix Escalations - same structural issue as Dependencies
console.log('Fixing Escalations...');
const escFile = path.join(PAGES_DIR, 'MonitoringEscalationsPage.jsx');
let escContent = fs.readFileSync(escFile, 'utf8');

// Add imports if missing
if (!escContent.includes('import LayoutBuilder')) {
    const importLine = escContent.match(/import.*from "react-icons\/rx";/);
    if (importLine) {
        escContent = escContent.replace(
            importLine[0],
            `${importLine[0]}\nimport LayoutBuilder from "../components/LayoutBuilder";\nimport { getLayoutApi, saveLayoutApi } from "../api/layoutApi";\nimport { escalationsFormConfig } from "../config/formConfig";\nimport { Pen } from "phosphor-react";`
        );
    }
}

// Find and fix the button placement issue
// The button should be INSIDE the header motion.div, not after it
const headerEndPattern = /<\/div>\s*<\/motion\.div>\s*{\/\* Customize Form Button \*\/}/;
if (headerEndPattern.test(escContent)) {
    escContent = escContent.replace(headerEndPattern, '\n        \n        {/* Customize Form Button */}');
}

// Remove the duplicate </motion.div> after the button
const duplicateEndPattern = /(<\/button>)\s*<\/motion\.div>\s*<\/motion\.div>\s*{\/\* ROW 1/;
if (duplicateEndPattern.test(escContent)) {
    escContent = escContent.replace(duplicateEndPattern, '$1\n\n      </motion.div>\n\n      {/* ROW 1');
}

fs.writeFileSync(escFile, escContent, 'utf8');
console.log('✅ Fixed Escalations');

// Fix Appreciations - missing imports
console.log('Fixing Appreciations...');
const appFile = path.join(PAGES_DIR, 'MonitoringAppreciationsPage.jsx');
let appContent = fs.readFileSync(appFile, 'utf8');

if (!appContent.includes('import LayoutBuilder')) {
    const importLine = appContent.match(/import.*from "react-icons\/rx";/);
    if (importLine) {
        appContent = appContent.replace(
            importLine[0],
            `${importLine[0]}\nimport LayoutBuilder from "../components/LayoutBuilder";\nimport { getLayoutApi, saveLayoutApi } from "../api/layoutApi";\nimport { appreciationsFormConfig } from "../config/formConfig";\nimport { Pen } from "phosphor-react";`
        );
    }
}

fs.writeFileSync(appFile, appContent, 'utf8');
console.log('✅ Fixed Appreciations');

// Fix Collections - missing imports
console.log('Fixing Collections...');
const collFile = path.join(PAGES_DIR, 'MonitoringCollectionsPage.jsx');
let collContent = fs.readFileSync(collFile, 'utf8');

if (!collContent.includes('import LayoutBuilder')) {
    const importLine = collContent.match(/import.*from "react-icons\/rx";/);
    if (importLine) {
        collContent = collContent.replace(
            importLine[0],
            `${importLine[0]}\nimport LayoutBuilder from "../components/LayoutBuilder";\nimport { getLayoutApi, saveLayoutApi } from "../api/layoutApi";\nimport { collectionsFormConfig } from "../config/formConfig";\nimport { Pen } from "phosphor-react";`
        );
    }
}

fs.writeFileSync(collFile, collContent, 'utf8');
console.log('✅ Fixed Collections');

console.log('\n🎉 All critical errors fixed!');
