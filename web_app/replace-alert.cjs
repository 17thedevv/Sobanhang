const fs = require('fs');

const files = [
  'src/pages/Orders.jsx',
  'src/components/ProductModal.jsx',
  'src/components/ProductSettingsModal.jsx',
  'src/components/FloatingActionButton.jsx',
  'src/components/CustomerSelectModal.jsx',
  'src/components/layouts/SidebarDrawer.jsx',
  'src/components/layouts/MobileLayout.jsx',
  'src/context/AppContext.jsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Skip if no alert
  if (!content.includes('alert(')) continue;

  // Replace alert with toast
  content = content.replace(/alert\((.*)\)/g, (match, p1) => {
    if (p1.includes('err') || p1.includes('Lỗi') || p1.includes('Có lỗi') || p1.includes('thất bại') || p1.includes('Vui lòng')) {
      return `toast.error(${p1})`;
    }
    if (p1.includes('chỉ còn') || p1.includes('Không thể')) {
      return `toast.warning(${p1})`;
    }
    return `toast.success(${p1})`;
  });

  // Ensure useToast is imported
  if (!content.includes('useToast')) {
    // try to determine depth based on file path
    const depth = file.split('/').length - 2;
    const prefix = depth === 0 ? './' : depth === 1 ? '../' : '../../';
    const importStr = `import { useToast } from '${prefix}context/ToastContext';\n`;
    
    // insert after last import
    const lines = content.split('\n');
    let lastImportIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        lastImportIdx = i;
      }
    }
    lines.splice(lastImportIdx + 1, 0, importStr);
    content = lines.join('\n');
  }

  // Ensure toast = useToast() is present
  // we look for the main component function declaration.
  // e.g. function App() or const App = () =>
  // Actually, some contexts might not be components (like AppContext.jsx which is a provider)
  // Let's just manually replace these files one by one if they don't have it, or do it programmatically.
  if (!content.includes('const toast = useToast()')) {
    const fnMatch = content.match(/(?:export default function \w+\(|const \w+ = \([^)]*\) => {)/);
    if (fnMatch) {
      content = content.replace(fnMatch[0], `${fnMatch[0]}\n  const toast = useToast();`);
    } else {
      console.log(`Manual intervention needed for ${file}`);
    }
  }

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
