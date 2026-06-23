const fs = require('fs');
const files = ['index.html', 'style.css', 'main.js'];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Revert the catastrophic 'o' replacement
  content = content.replace(/❤/g, 'o');
  
  // Revert the "Ac " replacement just in case it broke something
  content = content.replace(/© /g, 'Ac ');
  
  // Re-fix the specific line for Copyright
  content = content.replace(/Ac 2025/g, '© 2025');

  // Fix the missing whitespace error at line 10 in Vite. 
  // Wait, line 10: `STUDIE'O7 "“ The premier` 
  // Let's replace `"“` with `–` if that's what it meant to be, or `"` 
  content = content.replace(/"“/g, '-');
  
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed o replacement.');
