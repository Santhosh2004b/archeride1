const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, 'frontend', 'my-react-app', 'src', 'pages');

// Fix Escalations - the button is inside the title div, needs to be moved out
const escFile = path.join(PAGES_DIR, 'MonitoringEscalationsPage.jsx');
let escContent = fs.readFileSync(escFile, 'utf8');

// Find line 209 and add </div> after it
escContent = escContent.replace(
    /(<p className="text-xs sm:text-sm text-gray-500 italic">Table — Latest Updates<\/p>)\s*\n\s*{\/\* Customize Form Button \*\/}/,
    '$1\r\n        </div>\r\n        \r\n        {/* Customize Form Button */}'
);

fs.writeFileSync(escFile, escContent, 'utf8');
console.log('✅ Fixed Escalations');

// Fix Appreciations - the imports weren't added properly
const appFile = path.join(PAGES_DIR, 'MonitoringAppreciationsPage.jsx');
let appContent = fs.readFileSync(appFile, 'utf8');

// Check if imports are actually there
if (!appContent.includes('from "../components/LayoutBuilder"')) {
    console.log('Appreciations missing LayoutBuilder import, adding...');
    appContent = appContent.replace(
        'import { RxCross2 } from "react-icons/rx";',
        `import { RxCross2 } from "react-icons/rx";\nimport LayoutBuilder from "../components/LayoutBuilder";\nimport { getLayoutApi, saveLayoutApi } from "../api/layoutApi";\nimport { appreciationsFormConfig } from "../config/formConfig";\nimport { Pen } from "phosphor-react";`
    );
    fs.writeFileSync(appFile, appContent, 'utf8');
    console.log('✅ Fixed Appreciations imports');
} else {
    console.log('✅ Appreciations already has imports');
}

// Fix Collections
const collFile = path.join(PAGES_DIR, 'MonitoringCollectionsPage.jsx');
let collContent = fs.readFileSync(collFile, 'utf8');

if (!collContent.includes('from "../components/LayoutBuilder"')) {
    console.log('Collections missing LayoutBuilder import, adding...');
    collContent = collContent.replace(
        'import { RxCross2 } from "react-icons/rx";',
        `import { RxCross2 } from "react-icons/rx";\nimport LayoutBuilder from "../components/LayoutBuilder";\nimport { getLayoutApi, saveLayoutApi } from "../api/layoutApi";\nimport { collectionsFormConfig } from "../config/formConfig";\nimport { Pen } from "phosphor-react";`
    );
    fs.writeFileSync(collFile, collContent, 'utf8');
    console.log('✅ Fixed Collections imports');
} else {
    console.log('✅ Collections already has imports');
}

console.log('\n🎉 All files fixed!');
