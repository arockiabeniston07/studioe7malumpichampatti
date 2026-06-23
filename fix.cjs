const fs = require('fs');
const files = ['index.html', 'style.css', 'main.js'];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace weird character sequences
  content = content.replace(/â‚¹/g, '₹');
  content = content.replace(/â€™/g, "'");
  content = content.replace(/â€œ/g, '"');
  content = content.replace(/â€/g, '"'); 
  content = content.replace(/\?"/g, '-');
  content = content.replace(/Ac /g, '© ');
  content = content.replace(/o/g, '❤');
  content = content.replace(/\ufffd/g, ''); // the replacement character
  content = content.replace(/₹\?/g, '₹');
  content = content.replace(/\?(\d+)/g, '₹$1'); // any ? followed by digits is likely a rupee symbol that got mangled

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed encoding issues.');
