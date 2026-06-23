const fs = require('fs');

let b = fs.readFileSync('main.js.bak');
let code = b.toString('utf16le').replace(/^\uFEFF/,'').replace(/[\uFFFD]/g,'');

// FIX 1: e.target.closest errors
code = code.replace(/(if\s*\(\s*)(e\.target\.closest\(['"]\.ba-slider-container['"]\))/g, '$1e.target instanceof Element && $2');
code = code.replace(/(const\s+card\s*=\s*)(e\.target\.closest\(TILT_CARDS\);)/g, 'if (!(e.target instanceof Element)) return;\n    $1$2');

// FIX 2: GSAP target not found - guard all gsap calls with string literals.
code = code.replace(/(gsap\.(?:to|from|fromTo|set))\s*\(\s*'([^']+)'\s*,([\s\S]*?\)(?:;|\s*$))/gm, (match, func, selector, rest) => {
  return `${func}(document.querySelectorAll('${selector}'),${rest}`;
});

code = code.replace(/(tl\.(?:to|from|fromTo|set))\s*\(\s*'([^']+)'\s*,([\s\S]*?\)(?:;|\s*$))/gm, (match, func, selector, rest) => {
  return `${func}(document.querySelectorAll('${selector}'),${rest}`;
});

// Guard ScrollTrigger.create({ trigger: '.selector' })
code = code.replace(/ScrollTrigger\.create\(\s*\{\s*trigger:\s*document\.querySelector\('\.contact-section'\),/g, `const contactSec = document.querySelector('.contact-section');\nif (contactSec) ScrollTrigger.create({ trigger: contactSec,`);

// classList and querySelector defensive programming
code = code.replace(/const loader = document\.getElementById\('loader'\);\s*loader\.classList\.add\('hidden'\);/g, `const loader = document.getElementById('loader');\n    if (loader) loader.classList.add('hidden');`);

code = code.replace(/navbar\.classList\.add\('scrolled'\);/g, "if (navbar) navbar.classList.add('scrolled');");
code = code.replace(/navbar\.classList\.remove\('scrolled'\);/g, "if (navbar) navbar.classList.remove('scrolled');");

code = code.replace(/hamburger\.classList\.toggle\('open'\);\s*navLinks\.classList\.toggle\('open'\);/g, "if (hamburger) hamburger.classList.toggle('open');\n  if (navLinks) navLinks.classList.toggle('open');");

code = code.replace(/if \(!navbar\.contains\(e\.target\) && navLinks\.classList\.contains\('open'\)\) \{/g, "if (navbar && !navbar.contains(e.target) && navLinks && navLinks.classList.contains('open')) {");
code = code.replace(/navLinks\.classList\.remove\('open'\);\s*hamburger\.classList\.remove\('open'\);/g, "if (navLinks) navLinks.classList.remove('open');\n    if (hamburger) hamburger.classList.remove('open');");

code = code.replace(/const target = document\.querySelector\(a\.getAttribute\('href'\)\);\s*lenis\.scrollTo\(target, \{ offset: -80, duration: 1\.2 \}\);/g, `const targetId = a.getAttribute('href');\n    if (!targetId || targetId === '#') return;\n    const target = document.querySelector(targetId);\n    if (!target) return;\n    lenis.scrollTo(target, { offset: -80, duration: 1.2 });`);

// FAQ
code = code.replace(/const btn = item\.querySelector\('\.faq-q'\);\s*const ans = item\.querySelector\('\.faq-a'\);\s*btn\.addEventListener\('click'/g, `const btn = item.querySelector('.faq-q');\n  const ans = item.querySelector('.faq-a');\n  if (!btn || !ans) return;\n  btn.addEventListener('click'`);
code = code.replace(/fi\.querySelector\('\.faq-a'\)\.style\.maxHeight = null;/g, `const fiAns = fi.querySelector('.faq-a'); if (fiAns) fiAns.style.maxHeight = null;`);

// Ripples
code = code.replace(/const existing = btn\.querySelector\('\.ripple'\);\s*if \(existing\) existing\.remove\(\);/g, `if (!btn) return;\n  const existing = btn.querySelector('.ripple');\n  if (existing) existing.remove();`);

// Mouse parallax
code = code.replace(/const ambient = heroSection\.querySelector\('\.hero-ambient'\);\s*const bg      = heroSection\.querySelector\('\.hero-bg-gradient'\);\s*const streaks = heroSection\.querySelectorAll\('\.hero-streak'\);\s*const x = \(e\.clientX \/ window\.innerWidth - 0\.5\) \* 2;\s*const y = \(e\.clientY \/ window\.innerHeight - 0\.5\) \* 2;\s*gsap\.to\(ambient, \{ x: x \* -40, y: y \* -40, duration: 1\.5, ease: 'power2\.out' \}\);\s*gsap\.to\(bg, \{ x: x \* 20, y: y \* 20, duration: 2\.0, ease: 'power2\.out' \}\);/gm, `const ambient = heroSection.querySelector('.hero-ambient');
    const bg      = heroSection.querySelector('.hero-bg-gradient');
    const streaks = heroSection.querySelectorAll('.hero-streak');
    
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    if (ambient) gsap.to(ambient, { x: x * -40, y: y * -40, duration: 1.5, ease: 'power2.out' });
    if (bg) gsap.to(bg, { x: x * 20, y: y * 20, duration: 2.0, ease: 'power2.out' });`);

code = code.replace(/const ambient = heroSection\.querySelector\('\.hero-ambient'\);\s*const bg      = heroSection\.querySelector\('\.hero-bg-gradient'\);\s*gsap\.to\(ambient, \{ x: 0, y: 0, duration: 1\.5, ease: 'power2\.out' \}\);\s*gsap\.to\(bg, \{ x: 0, y: 0, duration: 2\.0, ease: 'power2\.out' \}\);/gm, `const ambient = heroSection.querySelector('.hero-ambient');
    const bg      = heroSection.querySelector('.bg-gradient');
    if (ambient) gsap.to(ambient, { x: 0, y: 0, duration: 1.5, ease: 'power2.out' });
    if (bg) gsap.to(bg, { x: 0, y: 0, duration: 2.0, ease: 'power2.out' });`);

// NEW: Function references guards
code = code.replace(/initHeroParticles\(\);/g, "if (typeof initHeroParticles === 'function') initHeroParticles();");

code = code.replace(/function stopAutoplay\(\)\s*\{\s*clearInterval\(autoplayTimer\);\s*\}/g, "function stopAutoplay() { if (typeof autoplayTimer !== 'undefined') clearInterval(autoplayTimer); }");

code = code.replace(/function resetAutoplay\(\)\s*\{\s*stopAutoplay\(\);\s*startAutoplay\(\);\s*\}/g, "function resetAutoplay() { if (typeof stopAutoplay === 'function') stopAutoplay(); if (typeof startAutoplay === 'function') startAutoplay(); }");

code = code.replace(/resultsSection\.addEventListener\('mouseenter',\s*stopAutoplay\);/g, "resultsSection.addEventListener('mouseenter', () => { if (typeof stopAutoplay === 'function') stopAutoplay(); });");

code = code.replace(/resultsSection\.addEventListener\('mouseleave',\s*startAutoplay\);/g, "resultsSection.addEventListener('mouseleave', () => { if (typeof startAutoplay === 'function') startAutoplay(); });");

// Replace all stopAutoplay(); that aren't already guarded
code = code.replace(/(?<!function |'function'\)\s)stopAutoplay\(\);/g, "if (typeof stopAutoplay === 'function') stopAutoplay();");

// Replace all startAutoplay(); that aren't already guarded
code = code.replace(/(?<!function |'function'\)\s)startAutoplay\(\);/g, "if (typeof startAutoplay === 'function') startAutoplay();");

fs.writeFileSync('main.js', code, 'utf8');
console.log("main.js comprehensively patched!");
