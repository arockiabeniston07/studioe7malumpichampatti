const fs = require('fs');
const files = ['index.html', 'style.css', 'main.js'];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove control characters (except newline, carriage return, tab)
  content = content.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Removed control characters.');
