const fs = require('fs');
const path = require('path');

const escFile = path.join(__dirname, 'frontend', 'my-react-app', 'src', 'pages', 'MonitoringEscalationsPage.jsx');
let content = fs.readFileSync(escFile, 'utf8');

// The problem is on line 208-209. After the </p> tag, we need to add </div>
// Current structure:
//   <p className="text-xs sm:text-sm text-gray-500 italic">Table — Latest Updates</p>
//                 
//         {/* Customize Form Button */}
//
// Should be:
//   <p className="text-xs sm:text-sm text-gray-500 italic">Table — Latest Updates</p>
//        </div>
//                 
//         {/* Customize Form Button */}

content = content.replace(
    /(<p className="text-xs sm:text-sm text-gray-500 italic">Table — Latest Updates<\/p>)\s+{\/\* Customize Form Button \*\/}/,
    '$1\r\n        </div>\r\n        \r\n        {/* Customize Form Button */'
);

fs.writeFileSync(escFile, content, 'utf8');
console.log('✅ Fixed Escalations page JSX structure');

// Also verify and fix Appreciations and Collections imports
const appFile = path.join(__dirname, 'frontend', 'my-react-app', 'src', 'pages', 'MonitoringAppreciationsPage.jsx');
let appContent = fs.readFileSync(appFile, 'utf8');

// Check if the imports are actually in the file
const hasLayoutBuilder = appContent.includes('from "../components/LayoutBuilder"');
const hasGetLayoutApi = appContent.includes('from "../api/layoutApi"');
const hasFormConfig = appContent.includes('appreciationsFormConfig');

console.log(`Appreciations: LayoutBuilder=${hasLayoutBuilder}, getLayoutApi=${hasGetLayoutApi}, formConfig=${hasFormConfig}`);

if (!hasLayoutBuilder || !hasGetLayoutApi || !hasFormConfig) {
    console.log('❌ Appreciations still missing imports - the previous script did not work');
    console.log('Checking file structure...');
    const lines = appContent.split('\n');
    console.log('First 20 lines:');
    lines.slice(0, 20).forEach((line, i) => console.log(`${i + 1}: ${line.substring(0, 80)}`));
}

const collFile = path.join(__dirname, 'frontend', 'my-react-app', 'src', 'pages', 'MonitoringCollectionsPage.jsx');
let collContent = fs.readFileSync(collFile, 'utf8');

const collHasLayoutBuilder = collContent.includes('from "../components/LayoutBuilder"');
const collHasGetLayoutApi = collContent.includes('from "../api/layoutApi"');
const collHasFormConfig = collContent.includes('collectionsFormConfig');

console.log(`Collections: LayoutBuilder=${collHasLayoutBuilder}, getLayoutApi=${collHasGetLayoutApi}, formConfig=${collHasFormConfig}`);

if (!collHasLayoutBuilder || !collHasGetLayoutApi || !collHasFormConfig) {
    console.log('❌ Collections still missing imports - the previous script did not work');
}
