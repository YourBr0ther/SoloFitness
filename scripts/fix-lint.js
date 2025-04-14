const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to recursively get all TypeScript files
function getTypeScriptFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
      results = results.concat(getTypeScriptFiles(file));
    } else if (file.match(/\.(ts|tsx)$/)) {
      results.push(file);
    }
  });
  
  return results;
}

// Function to fix import order in a file
function fixImportOrder(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Split file into imports and rest of content
  const lines = content.split('\n');
  const imports = [];
  const rest = [];
  let isImport = false;
  
  lines.forEach(line => {
    if (line.trim().startsWith('import ')) {
      imports.push(line);
      isImport = true;
    } else if (line.trim() === '' && isImport) {
      // Skip empty lines between imports
    } else {
      isImport = false;
      rest.push(line);
    }
  });
  
  // Sort imports
  imports.sort((a, b) => {
    // Built-in modules first
    const aIsBuiltin = a.includes('from "react"') || a.includes('from "next"');
    const bIsBuiltin = b.includes('from "react"') || b.includes('from "next"');
    if (aIsBuiltin && !bIsBuiltin) return -1;
    if (!aIsBuiltin && bIsBuiltin) return 1;
    
    // Then external modules
    const aIsExternal = !a.includes('from "@/');
    const bIsExternal = !b.includes('from "@/');
    if (aIsExternal && !bIsExternal) return -1;
    if (!aIsExternal && bIsExternal) return 1;
    
    // Then sort alphabetically
    return a.localeCompare(b);
  });
  
  // Add newline between different import groups
  const groupedImports = [];
  let currentGroup = [];
  imports.forEach((imp, i) => {
    currentGroup.push(imp);
    const nextImp = imports[i + 1];
    if (nextImp) {
      const currentIsBuiltin = imp.includes('from "react"') || imp.includes('from "next"');
      const nextIsBuiltin = nextImp.includes('from "react"') || nextImp.includes('from "next"');
      const currentIsExternal = !imp.includes('from "@/');
      const nextIsExternal = !nextImp.includes('from "@/');
      
      if (currentIsBuiltin !== nextIsBuiltin || currentIsExternal !== nextIsExternal) {
        groupedImports.push(currentGroup.join('\n'));
        groupedImports.push('');
        currentGroup = [];
      }
    }
  });
  if (currentGroup.length > 0) {
    groupedImports.push(currentGroup.join('\n'));
  }
  
  // Write back to file
  const newContent = [...groupedImports, '', ...rest].join('\n');
  fs.writeFileSync(filePath, newContent);
}

// Function to fix common issues in a file
function fixCommonIssues(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix unescaped entities
  content = content.replace(/(\s)'(\w)/g, ' &apos;$2');
  content = content.replace(/(\w)'(\s)/g, '$1&apos;$2');
  
  // Remove console.log statements (except in test files)
  if (!filePath.includes('.test.') && !filePath.includes('.spec.')) {
    content = content.replace(/console\.log\((.*?)\);?\n?/g, '');
  }
  
  // Fix var usage
  content = content.replace(/\bvar\s+(\w+)\s*=/g, 'const $1 =');
  
  // Write back to file
  fs.writeFileSync(filePath, content);
}

// Main execution
try {
  console.log('🔍 Finding TypeScript files...');
  const files = getTypeScriptFiles(path.resolve(__dirname, '../src'));
  
  console.log(`📝 Found ${files.length} files to process`);
  files.forEach(file => {
    console.log(`🔧 Processing ${path.relative(process.cwd(), file)}`);
    fixImportOrder(file);
    fixCommonIssues(file);
  });
  
  console.log('✨ Running ESLint fix...');
  execSync('npm run lint', { stdio: 'inherit' });
  
  console.log('✅ All done!');
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
} 