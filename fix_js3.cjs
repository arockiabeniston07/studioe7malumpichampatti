const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/initHeroParticles\(\);/g, "if (typeof initHeroParticles === 'function') { initHeroParticles(); }");

code = code.replace(/function stopAutoplay\(\)\s*\{\s*clearInterval\(autoplayTimer\);\s*\}/g, "function stopAutoplay() { if (typeof autoplayTimer !== 'undefined') clearInterval(autoplayTimer); }");

code = code.replace(/function resetAutoplay\(\)\s*\{\s*stopAutoplay\(\);\s*startAutoplay\(\);\s*\}/g, "function resetAutoplay() { if (typeof stopAutoplay === 'function') stopAutoplay(); if (typeof startAutoplay === 'function') startAutoplay(); }");

code = code.replace(/resultsSection\.addEventListener\('mouseenter',\s*stopAutoplay\);/g, "resultsSection.addEventListener('mouseenter', () => { if (typeof stopAutoplay === 'function') stopAutoplay(); });");

code = code.replace(/resultsSection\.addEventListener\('mouseleave',\s*startAutoplay\);/g, "resultsSection.addEventListener('mouseleave', () => { if (typeof startAutoplay === 'function') startAutoplay(); });");

code = code.replace(/stopAutoplay\(\);/g, "if (typeof stopAutoplay === 'function') stopAutoplay();");

code = code.replace(/startAutoplay\(\);/g, "if (typeof startAutoplay === 'function') startAutoplay();");

// To prevent nested `if (typeof ...)` if the string was matched multiple times:
// Wait, the above will replace `if (typeof stopAutoplay === 'function') stopAutoplay();` with `if (typeof stopAutoplay === 'function') if (typeof stopAutoplay === 'function') stopAutoplay();`!
// So we must be careful. Let's read main.js.bak and do ALL replacements in ONE go from the clean file to avoid nested issues!
