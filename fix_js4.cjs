const fs = require('fs');

const file = 'main.js';
let content = fs.readFileSync(file, 'utf8');

const target = `    gsap.from(document.querySelectorAll('.booking-card'), { x: 60, opacity: 0, duration: 1.0, ease: 'power3.out', delay: 0.2 });
    gsap.from(document.querySelectorAll('.contact-card'), { x: -60, opacity: 0, duration: 1.0, ease: 'power3.out' });
    gsap.from(document.querySelectorAll('.map-wrap'),     { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.4 });`;

const replacement = `    // FIX: On mobile booking-card x:60 shifts it right causing map overlap
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      gsap.from(document.querySelectorAll('.contact-card'), { y: 40, opacity: 0, duration: 1.0, ease: 'power3.out', clearProps: 'all' });
      gsap.from(document.querySelectorAll('.map-wrap'),     { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.3, clearProps: 'all' });
      gsap.from(document.querySelectorAll('.booking-card'), { y: 40, opacity: 0, duration: 1.0, ease: 'power3.out', delay: 0.5, clearProps: 'all' });
    } else {
      gsap.from(document.querySelectorAll('.booking-card'), { x: 60, opacity: 0, duration: 1.0, ease: 'power3.out', delay: 0.2, clearProps: 'all' });
      gsap.from(document.querySelectorAll('.contact-card'), { x: -60, opacity: 0, duration: 1.0, ease: 'power3.out', clearProps: 'all' });
      gsap.from(document.querySelectorAll('.map-wrap'),     { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.4, clearProps: 'all' });
    }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('SUCCESS: GSAP animation fixed in main.js');
} else {
    console.log('ERROR: Target block not found in main.js');
}
