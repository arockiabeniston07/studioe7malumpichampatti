// ================================================
//   STUDIE'O7 – PREMIUM LUXURY ANIMATIONS v2.0
//   Cinematic · Parallax · 3D · Smooth Scroll
// ================================================
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ── 0. LENIS SMOOTH INERTIA SCROLL ────────────────
const lenis = new Lenis({
  lerp: 0.07,               // inertia factor (lower = smoother)
  smoothWheel: true,
  smoothTouch: false,
  touchMultiplier: 2,
  wheelMultiplier: 1,
});

// Connect Lenis to GSAP ticker for perfect sync
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// ── 1. LOADER ─────────────────────────────────────
document.body.style.overflow = 'hidden';
// Pre-hide hero elements so GSAP controls the reveal (prevent CSS flash)
gsap.set([
  '.hero-eyebrow',
  '.hero-headline',
  '.hero-sub',
  '.hero-cta > *',
  '.hero-stats',
  '.hero-scroll-hint',
  '.hero-bg-gradient',
  '.hero-ambient',
  '.gold-sphere',
  '.abstract-shape',
], { opacity: 0 });

window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    lenis.start();
    initHeroTimeline();
    initHeroParticles();
    initCounters();
  }, 1900);

  // FIX #4 STABILITY: Safety fallback — if GSAP animation hasn't run after 4.5s,
  // force hero text to be visible. Prevents stuck-invisible text on slow connections.
  setTimeout(() => {
    const heroEls = [
      '.hero-eyebrow', '.hero-headline', '.hero-sub',
      '.hero-cta > *', '.hero-stats', '.hero-scroll-hint',
    ];
    heroEls.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (parseFloat(getComputedStyle(el).opacity) < 0.1) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
    });
  }, 4500);
});

// Stop Lenis during loader
lenis.stop();

// ── 2. SMOOTH SCROLL for anchor links ─────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
    lenis.scrollTo(target, { offset: -offset, duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  });
});

// ── 3. NAVBAR – Glassmorphism + Hide/Show on scroll ─
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const sections  = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

let lastScrollY = 0;
let navHidden   = false;
let ticking     = false;

lenis.on('scroll', ({ scroll }) => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const dir = scroll > lastScrollY ? 'down' : 'up';

    // Glassmorphism blur effect
    if (scroll > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Hide on scroll down, show on scroll up
    if (scroll > 200) {
      if (dir === 'down' && !navHidden) {
        gsap.to(navbar, { y: '-100%', duration: 0.5, ease: 'power3.inOut' });
        navHidden = true;
      } else if (dir === 'up' && navHidden) {
        gsap.to(navbar, { y: '0%', duration: 0.5, ease: 'power3.out' });
        navHidden = false;
      }
    } else {
      if (navHidden) {
        gsap.to(navbar, { y: '0%', duration: 0.4, ease: 'power3.out' });
        navHidden = false;
      }
    }

    // Active section highlight
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 140;
      if (scroll >= top) current = sec.getAttribute('id');
    });
    navLinkEls.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });

    lastScrollY = scroll;
    ticking = false;
  });
});

hamburger.addEventListener('click', (e) => {
  e.stopPropagation(); // FIX #2: prevent click from immediately bubbling to document
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// FIX #2: Close mobile menu when clicking outside the nav
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
  }
});

// FIX #2: Close mobile menu when a nav link is clicked
navLinkEls.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

// ── 4. CINEMATIC HERO ENTRANCE TIMELINE ───────────
function initHeroTimeline() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // 1. Logo fades in (we animate the navbar brand logo/text first)
  tl.fromTo('.nav-brand', { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0);
  tl.fromTo('.nav-links, .btn-book-nav', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1.0 }, 0.2);

  // 2. Headline slides upward
  tl.fromTo('.hero-eyebrow', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 0.3);
  tl.fromTo('.hero-headline', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.0, ease: 'power4.out' }, 0.4);

  // 3. Subtitle fades in
  tl.fromTo('.hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.8);

  // 4. Buttons appear
  tl.fromTo('.hero-cta > *', { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: 'back.out(1.5)' }, 1.1);

  // 5. Stats bar
  tl.fromTo('.hero-stats', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, 1.4);

  // 6. Scroll hint – opacity only (preserve translateX(-50%) centering), then start float loop
  tl.fromTo('.hero-scroll-hint',
    { opacity: 0 },
    {
      opacity: 1,
      duration: 0.7,
      onComplete: () => {
        const hint = document.querySelector('.hero-scroll-hint');
        if (hint) {
          // Clear GSAP inline transform so CSS scroll-float can take over
          gsap.set(hint, { clearProps: 'transform' });
          hint.classList.add('is-floating');
        }
      }
    },
    1.7
  );

  // Background effects – entrance only, then clear so scroll parallax works
  tl.fromTo('.hero-bg-gradient', { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1, duration: 3.0, ease: 'power2.out', clearProps: 'transform' }, 0);
  tl.fromTo('.hero-ambient', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 2.0, clearProps: 'transform' }, 0.1);
}

// Text splitter utility (vanilla, no premium plugins)
function splitTextIntoChars(selector) {
  const el = document.querySelector(selector);
  if (!el || el.dataset.split) return;
  el.dataset.split = 'true';
  const text = el.textContent;
  el.innerHTML = '';
  el.style.perspective = '600px';
  [...text].forEach(char => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    span.style.willChange = 'transform, opacity';
    el.appendChild(span);
  });
}

// ── 5. HERO PARTICLES ─────────────────────────────
function initHeroParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const types = ['type-dot', 'type-dot', 'type-orb', 'type-spark'];
  const count = 70;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const type = types[Math.floor(Math.random() * types.length)];
    p.className = `particle ${type}`;

    let size;
    if (type === 'type-orb')   size = Math.random() * 8 + 6;
    else if (type === 'type-spark') size = Math.random() * 2 + 1;
    else size = Math.random() * 3 + 1;

    const dur    = Math.random() * 10 + 6;
    const delay  = Math.random() * 12;
    const left   = Math.random() * 100;
    const startY = Math.random() * 40 + 20;
    const drift  = (Math.random() - 0.5) * 90;
    const peakOp  = (Math.random() * 0.5 + 0.4).toFixed(2);
    const midOp   = (parseFloat(peakOp) * 0.55).toFixed(2);
    const endScale = (Math.random() * 0.8 + 0.8).toFixed(2);

    p.style.cssText = `
      left: ${left}%;
      bottom: ${Math.random() * 12}%;
      width: ${size}px;
      height: ${size}px;
      --dur: ${dur}s;
      --delay: ${delay}s;
      --start-y: ${startY}px;
      --drift: ${drift}px;
      --peak-op: ${peakOp};
      --mid-op: ${midOp};
      --end-scale: ${endScale};
    `;
    container.appendChild(p);
  }
}

// ── 6. COUNTER ANIMATION ──────────────────────────
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 2200;
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}

// ── 7. SECTION REVEALS (enhanced with depth) ──────
document.querySelectorAll('.section-reveal').forEach(el => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    onEnter: () => el.classList.add('visible'),
  });
});

// Section headers cinematic fade-up stagger
document.querySelectorAll('.section-header').forEach(header => {
  const children = header.children;
  gsap.from(children, {
    scrollTrigger: { trigger: header, start: 'top 82%' },
    y: 50, opacity: 0, duration: 0.85, stagger: 0.18,
    ease: 'power3.out', clearProps: 'all',
  });
});

// ── 8. 3D DEPTH SCROLL: Cards & Elements ──────────
const staggerTargets = [
  { sel: '.price-table-card', fromY: 60, fromScale: 0.93 },
  { sel: '.faq-item',          fromY: 40, fromScale: 0.97 },
  { sel: '.gallery-item',      fromY: 50, fromScale: 0.9  },
  { sel: '.result-card-wrap',  fromY: 60, fromScale: 0.93 },
  { sel: '.feat-item',         fromY: 30, fromScale: 0.97 },
  { sel: '.contact-item',      fromY: 30, fromScale: 0.97 },
  { sel: '.footer-links-col',  fromY: 30, fromScale: 0.97 },
];

staggerTargets.forEach(({ sel, fromY, fromScale }) => {
  const els = document.querySelectorAll(sel);
  if (!els.length) return;
  gsap.from(els, {
    scrollTrigger: {
      trigger: els[0].closest('section') || els[0].parentElement,
      start: 'top 83%',
    },
    y: fromY,
    scale: fromScale,
    opacity: 0,
    duration: 0.85,
    stagger: 0.1,
    ease: 'power3.out',
    clearProps: 'all',
  });
});

// ── 9. CINEMATIC MULTI-LAYER PARALLAX SYSTEM ──────

// ── SCROLL PROGRESS BAR ───────────────────────────
gsap.to('.scroll-progress-bar', {
  width: '100%',
  ease: 'none',
  scrollTrigger: {
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.3,
  }
});

// ─ LAYER 1: Background gradient (slowest / deepest) ─
gsap.to('.hero-bg-gradient', {
  y: -130,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 2.5,
  }
});

// ─ LAYER 2: Ambient orb (deep, slow drift) ─
gsap.to('.hero-ambient', {
  y: -80,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 2.0,
  }
});

// ─ LAYER 3: Gold particles (mid-depth) ─
gsap.to('.hero-particles', {
  y: -70,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1.8,
  }
});

// ─ LAYER 4: Gold spheres – each wrapper at its own depth speed ─
gsap.to('.sphere-wrap-1', {
  y: -45,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 3.0,
  }
});
gsap.to('.sphere-wrap-2', {
  y: -90,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1.6,
  }
});
gsap.to('.sphere-wrap-3', {
  y: -110,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1.2,
  }
});
gsap.to('.sphere-wrap-4', {
  y: -140,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1.0,
  }
});
gsap.to('.sphere-wrap-5', {
  y: -65,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 2.2,
  }
});

// ─ LAYER 5: Hero text content (natural scroll, slight slow) ─
gsap.to('.hero-content-wrap', {
  y: -60,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1.2,
  }
});

// Hero headline fades + scales down as user scrolls past
gsap.fromTo('.hero-headline', 
  { opacity: 1, scale: 1 },
  {
    opacity: 0,
    scale: 0.92,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'center top',
      end: 'bottom top',
      scrub: 1.5,
    }
  }
);
gsap.fromTo('.hero-sub',
  { opacity: 1 },
  {
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero-section',
      start: '40% top',
      end: 'bottom top',
      scrub: 1.2,
    }
  }
);


// ─ ABOUT Section Parallax Background Shapes ─
gsap.to('.sphere-wrap-about-1', {
  y: -80,
  ease: 'none',
  scrollTrigger: {
    trigger: '.about-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.8,
  }
});
gsap.to('.sphere-wrap-about-2', {
  y: -120,
  ease: 'none',
  scrollTrigger: {
    trigger: '.about-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.2,
  }
});

// ─ GALLERY Section Parallax Background Shapes ─
gsap.to('.sphere-wrap-gallery-1', {
  y: -90,
  ease: 'none',
  scrollTrigger: {
    trigger: '.gallery-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 2.0,
  }
});
gsap.to('.sphere-wrap-gallery-2', {
  y: -140,
  ease: 'none',
  scrollTrigger: {
    trigger: '.gallery-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.5,
  }
});

// ─ SERVICES Section Parallax Background Shapes ─
gsap.to('.sphere-wrap-services-1', {
  y: -100,
  ease: 'none',
  scrollTrigger: {
    trigger: '.services-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.7,
  }
});
gsap.to('.sphere-wrap-services-2', {
  y: -150,
  ease: 'none',
  scrollTrigger: {
    trigger: '.services-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.1,
  }
});

// ─ SPHERE entrance: fade in after loader using GSAP set + fromTo ─
window.addEventListener('load', () => {
  setTimeout(() => {
    gsap.fromTo('.gold-sphere, .abstract-shape', 
      { opacity: 0, scale: 0.6 },
      { opacity: 1, scale: 1, duration: 2.0, ease: 'power2.out', stagger: 0.12 }
    );
  }, 2100);
});

// ── 9.5 MOUSE COORDINATE INTERACTIVE TILT ─────────────────
window.addEventListener('mousemove', (e) => {
  const xPercent = (e.clientX / window.innerWidth) - 0.5; // range: -0.5 to 0.5
  const yPercent = (e.clientY / window.innerHeight) - 0.5; // range: -0.5 to 0.5

  // Hero spheres
  gsap.to('.sphere-wrap-1 .sphere-interactive', { x: xPercent * 30, y: yPercent * 30, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
  gsap.to('.sphere-wrap-2 .sphere-interactive', { x: -xPercent * 40, y: -yPercent * 40, duration: 1.5, ease: 'power2.out', overwrite: 'auto' });
  gsap.to('.sphere-wrap-3 .sphere-interactive', { x: xPercent * 50, y: yPercent * 50, duration: 1.8, ease: 'power2.out', overwrite: 'auto' });
  gsap.to('.sphere-wrap-4 .sphere-interactive', { x: -xPercent * 60, y: -yPercent * 60, duration: 2.0, ease: 'power2.out', overwrite: 'auto' });
  gsap.to('.sphere-wrap-5 .sphere-interactive', { x: xPercent * 35, y: yPercent * 35, duration: 1.4, ease: 'power2.out', overwrite: 'auto' });

  // About background shapes
  gsap.to('.sphere-wrap-about-1 .sphere-interactive', { x: xPercent * 25, y: yPercent * 25, duration: 1.5, ease: 'power2.out', overwrite: 'auto' });
  gsap.to('.sphere-wrap-about-2 .sphere-interactive', { x: -xPercent * 35, y: -yPercent * 35, duration: 1.5, ease: 'power2.out', overwrite: 'auto' });

  // Gallery background shapes
  gsap.to('.sphere-wrap-gallery-1 .sphere-interactive', { x: -xPercent * 30, y: -yPercent * 30, duration: 1.5, ease: 'power2.out', overwrite: 'auto' });
  gsap.to('.sphere-wrap-gallery-2 .sphere-interactive', { x: xPercent * 40, y: yPercent * 40, duration: 1.5, ease: 'power2.out', overwrite: 'auto' });

  // Services background shapes
  gsap.to('.sphere-wrap-services-1 .sphere-interactive', { x: xPercent * 30, y: yPercent * 30, duration: 1.5, ease: 'power2.out', overwrite: 'auto' });
  gsap.to('.sphere-wrap-services-2 .sphere-interactive', { x: -xPercent * 35, y: -yPercent * 35, duration: 1.5, ease: 'power2.out', overwrite: 'auto' });
});

// ─ ABOUT section parallax ─
gsap.to('.about-img-frame', {
  y: -55,
  ease: 'none',
  scrollTrigger: {
    trigger: '.about-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.5,
  }
});
gsap.to('.about-text-col', {
  y: -20,
  ease: 'none',
  scrollTrigger: {
    trigger: '.about-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
  }
});

// ─ GALLERY alternating parallax rows ─
document.querySelectorAll('.gallery-item:nth-child(odd)').forEach(el => {
  gsap.to(el, {
    y: -30, ease: 'none',
    scrollTrigger: { trigger: '.gallery-section', start: 'top bottom', end: 'bottom top', scrub: 1.2 }
  });
});
document.querySelectorAll('.gallery-item:nth-child(even)').forEach(el => {
  gsap.to(el, {
    y: 30, ease: 'none',
    scrollTrigger: { trigger: '.gallery-section', start: 'top bottom', end: 'bottom top', scrub: 1.2 }
  });
});

// ─ GALLERY image scroll zoom ─
document.querySelectorAll('.gallery-img-wrap').forEach(el => {
  gsap.fromTo(el,
    { scale: 1.0 },
    {
      scale: 1.12,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('.gallery-item'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    }
  );
});

// ── RESULTS section lift removed ──

// ─ FOOTER parallax ─
gsap.to('.footer-brand', {
  y: -20,
  ease: 'none',
  scrollTrigger: {
    trigger: '.footer',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.8,
  }
});

// ── 10. GALLERY – Lightbox ──
const galleryItems  = document.querySelectorAll('.gallery-item');
const lightbox      = document.getElementById('lightbox');
const lbClose       = document.getElementById('lbClose');
const lbPrev        = document.getElementById('lbPrev');
const lbNext        = document.getElementById('lbNext');
const lbCaption     = document.getElementById('lbCaption');
const lbImageWrap   = document.getElementById('lbImageWrap');
let currentLbIndex  = 0;
let activeLightboxGallery = [];

const salonGalleryData = [
  // 0: Interior
  [
    { src: 'image/gi2c.jpeg', caption: 'Salon Interior' },
    { src: 'image/gi1c.jpeg' , caption: 'Salon Interior'},
    { src: 'image/gi3c.jpeg',caption: 'Salon Interior' }
  ],
  // 1: Bridal Makeover
  [
    { src: 'galleryimg/b1.jpeg' ,caption:'Bridal Makeover'},
    { src: 'galleryimg/b2.jpeg',caption:'Bridal Makeover' },
    { src: 'galleryimg/b3.jpeg',caption:'Bridal Makeover' },
    { src: 'galleryimg/b4.jpeg',caption:'Bridal Makeover '}
  ],
  // 2: Hair Styling
  [
    { src: 'galleryimg/hs1cp.jpeg' ,caption :'Hair Styling'},
    { src: 'galleryimg/hs2c.jpeg' ,caption :'Hair Styling'},
    { src: 'galleryimg/fh5.jpeg',caption :'Hair Styling' }
  ],
  // 3: Luxury Skincare
  [
    { src: 'image/l.jpeg' ,caption:'Luxury Skincare'},
    { src: 'image/l1.jpeg' ,caption:'Luxury Skincare'}
  ],
  // 4: Premium Hair Colour
  [
    { src: 'galleryimg/hc1.jpeg',caption:'Premium Hair Colour'},
    { src: 'galleryimg/hc2.jpeg' ,caption:'Premium Hair Colour'}
  ],
  // 5: Expert Team
  [
    { src: 'image/team2.jpeg',caption:'Expert Team' },
    { src: 'image/team.jpeg',caption:'Expert Team' }
  ]
];

function openLightbox(index) {
  activeLightboxGallery = salonGalleryData[index] || [];
  if (activeLightboxGallery.length === 0) return;
  currentLbIndex = 0;
  
  // Hard reset
  lbImageWrap.innerHTML = '';
  
  updateLightbox(false);
  lightbox.classList.add('open');
  lenis.stop();
  gsap.fromTo('.lightbox-content', { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' });
}

function closeLightbox() {
  gsap.to('.lightbox-content', {
    scale: 0.88, opacity: 0, duration: 0.35, ease: 'power3.in',
    onComplete: () => {
      lightbox.classList.remove('open');
      lenis.start();
      // Completely reset state to prevent memory leaks / stale views
      lbImageWrap.innerHTML = '';
      activeLightboxGallery = [];
      currentLbIndex = 0;
    }
  });
}

function updateLightbox(animateOut = true) {
  if (activeLightboxGallery.length === 0) return;
  const data = activeLightboxGallery[currentLbIndex];
  
  const renderNewImage = () => {
    lbImageWrap.innerHTML = `<img src="${data.src}" alt="${data.caption}" class="lb-image" loading="lazy" style="width:100%; height:100%; object-fit:contain; border-radius:8px;" />`;
    lbCaption.textContent = `${currentLbIndex + 1} / ${activeLightboxGallery.length} — ${data.caption}`;
    gsap.fromTo(lbImageWrap, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out' });
  };

  if (animateOut) {
    gsap.to(lbImageWrap, { opacity: 0, x: -20, duration: 0.2, ease: 'power2.in', onComplete: renderNewImage });
  } else {
    renderNewImage();
  }
}

const cleanLbClose = document.getElementById('lbClose');
const cleanLbPrev = document.getElementById('lbPrev');
const cleanLbNext = document.getElementById('lbNext');
const cleanLbOverlay = lightbox.querySelector('.lightbox-overlay');

galleryItems.forEach((item, i) => {
  item.onclick = () => openLightbox(i);
});

cleanLbClose.onclick = closeLightbox;
cleanLbOverlay.onclick = closeLightbox;

cleanLbPrev.onclick = () => {
  if (activeLightboxGallery.length === 0) return;
  currentLbIndex = (currentLbIndex - 1 + activeLightboxGallery.length) % activeLightboxGallery.length;
  updateLightbox();
};

cleanLbNext.onclick = () => {
  if (activeLightboxGallery.length === 0) return;
  currentLbIndex = (currentLbIndex + 1) % activeLightboxGallery.length;
  updateLightbox();
};

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') cleanLbPrev.click();
  if (e.key === 'ArrowRight') cleanLbNext.click();
});

// ── 11. PRICE TABS ──
const priceTabsWrap = document.getElementById('priceTabs');
const priceTabs   = priceTabsWrap ? priceTabsWrap.querySelectorAll('.price-tab') : [];
const pricePanels = document.querySelectorAll('.price-panel');

priceTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    priceTabs.forEach(t  => t.classList.remove('active'));
    pricePanels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(`tab-${tab.dataset.tab}`);
    if (panel) {
      panel.classList.add('active');
      const newCards = panel.querySelectorAll('.price-table-card');
      gsap.from(newCards, {
        y: 40, opacity: 0, scale: 0.95,
        duration: 0.6, stagger: 0.09, ease: 'power3.out', clearProps: 'all'
      });
    }
  });
});

// ── 12. BEFORE/AFTER SLIDER ───────────────────────
function initBASlider(container) {
  const before = container.querySelector('.ba-before');
  const handle  = container.querySelector('.ba-handle');
  let isDragging = false;

  const getPercent = (clientX) => {
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  };

  const update = (pct) => {
    before.style.width  = `${pct}%`;
    handle.style.left   = `${pct}%`;
    handle.style.transform = 'translateX(-50%)';
  };

  update(50);

  // Animate handle glow on drag
  handle.querySelector('.ba-handle-circle').addEventListener('mouseenter', () => {
    gsap.to(handle.querySelector('.ba-handle-circle'), { scale: 1.15, duration: 0.3, ease: 'power2.out' });
  });
  handle.querySelector('.ba-handle-circle').addEventListener('mouseleave', () => {
    gsap.to(handle.querySelector('.ba-handle-circle'), { scale: 1, duration: 0.3, ease: 'power2.out' });
  });

  container.addEventListener('mousedown', e => { e.stopPropagation(); isDragging = true; update(getPercent(e.clientX)); });
  window.addEventListener('mouseup',   () => { isDragging = false; });
  container.addEventListener('mousemove', e => { if (isDragging) update(getPercent(e.clientX)); });

  container.addEventListener('touchstart', e => {
    e.stopPropagation();
    isDragging = true;
    update(getPercent(e.touches[0].clientX));
  }, { passive: true });

  container.addEventListener('touchmove', e => {
    if (isDragging) {
      e.preventDefault(); // Prevent scrolling while sliding
      e.stopPropagation();
      update(getPercent(e.touches[0].clientX));
    }
  }, { passive: false });

  container.addEventListener('touchend', e => {
    e.stopPropagation();
    isDragging = false;
  }, { passive: true });

  container.addEventListener('touchcancel', e => {
    e.stopPropagation();
    isDragging = false;
  }, { passive: true });


}

document.querySelectorAll('.ba-slider-container').forEach(initBASlider);

// ── 13. TRANSFORMATION GALLERY SLIDER ──
const galleryTabsContainer = document.getElementById('galleryTabs');
const galleryTabs = galleryTabsContainer ? galleryTabsContainer.querySelectorAll('.price-tab') : [];
const gallerySlider = document.getElementById('gallerySlider');
const galPrev = document.getElementById('galPrev');
const galNext = document.getElementById('galNext');
const galDots = document.getElementById('galDots');

const categoryImages = {
  'bridal': [
    'galleryimg/b1.jpeg', 'galleryimg/b2.jpeg', 'galleryimg/b3.jpeg', 'galleryimg/b4.jpeg' , 'galleryimg/b5.jpeg','galleryimg/b6.jpeg','galleryimg/b7.jpeg','galleryimg/b8.jpeg','galleryimg/b9.jpeg','galleryimg/b10.jpeg'
  ],
  'floral': [
    'galleryimg/fh1.jpeg', 'galleryimg/fh2.jpeg', 'galleryimg/fh3.jpeg', 'galleryimg/fh4.jpeg','galleryimg/fh5.jpeg','galleryimg/fh6.jpeg'
  ],
  'hair': [
    'galleryimg/hs1.jpeg', 'galleryimg/hs2.jpeg','galleryimg/hs3.jpeg','galleryimg/hs4.jpeg'
  ],
  'color': [
    'galleryimg/hc1.jpeg', 'galleryimg/hc2.jpeg','galleryimg/hc3.jpeg',
    
  ]
};

let currentGalIndex = 0;
let currentCategory = 'bridal';

function buildGallerySlider() {
  if (!gallerySlider) return;
  const images = categoryImages[currentCategory] || [];
  gallerySlider.innerHTML = '';
  
  images.forEach(imgUrl => {
    const slide = document.createElement('div');
    slide.className = 'gallery-slide';
    slide.innerHTML = `<img src="${imgUrl}" class="luxury-image" alt="Transformation Gallery" loading="lazy" />`;
    gallerySlider.appendChild(slide);
  });
  
  buildGalDots(images.length);
  goToGalSlide(0, false);
}

function buildGalDots(count) {
  if (!galDots) return;
  galDots.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('button');
    dot.className = 'car-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToGalSlide(i));
    galDots.appendChild(dot);
  }
}

function goToGalSlide(idx, animate = true) {
  const slides = gallerySlider ? gallerySlider.querySelectorAll('.gallery-slide') : [];
  if (slides.length <= 1) return;
  if (idx < 0) idx = slides.length - 1;
  if (idx >= slides.length) idx = 0;
  
  currentGalIndex = idx;
  
  if (animate) {
    gsap.to(gallerySlider, {
      x: -(currentGalIndex * 100) + '%',
      duration: 1.0, 
      ease: 'power4.inOut'
    });
  } else {
    gsap.set(gallerySlider, { x: -(currentGalIndex * 100) + '%' });
  }
  
  if (galDots) {
    galDots.querySelectorAll('.car-dot').forEach((d, i) => d.classList.toggle('active', i === currentGalIndex));
  }
}

if (galleryTabs.length > 0) {
  galleryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      galleryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      currentCategory = tab.dataset.gallery;
      
      gsap.to(gallerySlider, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        onComplete: () => {
          buildGallerySlider();
          gsap.fromTo(gallerySlider, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        }
      });
    });
  });
}

if (galPrev) galPrev.addEventListener('click', () => goToGalSlide(currentGalIndex - 1));
if (galNext) galNext.addEventListener('click', () => goToGalSlide(currentGalIndex + 1));

buildGallerySlider();

// ── AMBIENT LUXURY EFFECTS (Particles & Parallax) ──
const galleryParticles = document.getElementById('galleryParticles');
if (galleryParticles) {
  const particleCount = 20;
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'fx-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    const size = Math.random() * 3 + 1;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    galleryParticles.appendChild(p);
    
    gsap.to(p, {
      y: - (Math.random() * 100 + 50),
      x: (Math.random() - 0.5) * 50,
      opacity: Math.random() * 0.6 + 0.2,
      duration: Math.random() * 5 + 5,
      ease: 'none',
      repeat: -1,
      yoyo: true,
      delay: Math.random() * -10
    });
  }
}

const galleryShowcase = document.getElementById('galleryShowcase');
const fxAmbientGlow = document.querySelector('.fx-ambient-glow');
const fxGlassOrbs = document.querySelector('.fx-glass-orbs');

if (galleryShowcase && fxAmbientGlow && fxGlassOrbs) {
  galleryShowcase.addEventListener('mousemove', (e) => {
    const rect = galleryShowcase.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    gsap.to(fxAmbientGlow, { x: x * 30, y: y * 30, duration: 1, ease: 'power2.out' });
    gsap.to(fxGlassOrbs, { x: x * -40, y: y * -40, duration: 1.5, ease: 'power2.out' });
  });
  
  galleryShowcase.addEventListener('mouseleave', () => {
    gsap.to([fxAmbientGlow, fxGlassOrbs], { x: 0, y: 0, duration: 1, ease: 'power2.out' });
  });
}

// ── 14. FAQ ACCORDION ──
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  const ans = item.querySelector('.faq-a');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(fi => {
      fi.classList.remove('open');
      fi.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      ans.style.maxHeight = ans.scrollHeight + 'px';
    }
  });
});

// ── 15. BOOKING FORM → WHATSAPP & CUSTOM UI ───────

// Custom Services Data
const customServicesData = [
  {
     group: "Cut & Styling",
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12m0-12L6 18"/></svg>',
    services: [
      { name: "Classic Haircut", price: "₹200" },
      { name: "Advance Haircut", price: "₹250" },
      { name: "Kids Cut (Below 6 Yrs.)", price: "₹150" },
      { name: "Beard Zero Trim", price: "₹100" },
      { name: "Classic Shave", price: "₹100" },
      { name: "Beard Design", price: "₹170" },
      { name: "Head Shave", price: "₹200" },

      { name: "Creative Cuts (N-MEM)", price: "₹1500" },
      { name: "Creative Cuts (MEM)", price: "₹1300" },

      { name: "Classic Cuts (N-MEM)", price: "₹500" },
      { name: "Classic Cuts (MEM)", price: "₹400" },

      { name: "Layer Cut (N-MEM)", price: "₹1000" },
      { name: "Layer Cut (MEM)", price: "₹900" },

      { name: "Fringe | Bangs (N-MEM)", price: "₹250" },
      { name: "Fringe | Bangs (MEM)", price: "₹200" },

      { name: "Kids Cut (Below 6 Yrs.) Women (N-MEM)", price: "₹200" },
      { name: "Kids Cut (Below 6 Yrs.) Women (MEM)", price: "₹170" },

      { name: "Ironing - Temporary Straightening Medium Length (N-MEM)", price: "₹900" },
      { name: "Ironing - Temporary Straightening Medium Length (MEM)", price: "₹800" },
      { name: "Ironing - Temporary Straightening Long Length (N-MEM)", price: "₹1200" },
      { name: "Ironing - Temporary Straightening Long Length (MEM)", price: "₹1100" },

      { name: "Tonging - Temporary Curls & Waves Medium Length (N-MEM)", price: "₹1100" },
      { name: "Tonging - Temporary Curls & Waves Medium Length (MEM)", price: "₹1000" },
      { name: "Tonging - Temporary Curls & Waves Long Length (N-MEM)", price: "₹1100" },
      { name: "Tonging - Temporary Curls & Waves Long Length (MEM)", price: "₹1000" },

      { name: "Blow Dry - Shampooing & Conditioning Medium Length (N-MEM)", price: "₹500" },
      { name: "Blow Dry - Shampooing & Conditioning Medium Length (MEM)", price: "₹400" },
      { name: "Blow Dry - Shampooing & Conditioning Long Length (N-MEM)", price: "₹600" },
      { name: "Blow Dry - Shampooing & Conditioning Long Length (MEM)", price: "₹500" },

      { name: "Eyebrow Shaping (N-MEM)", price: "₹70" },
      { name: "Eyebrow Shaping (MEM)", price: "₹50" },

      { name: "Upper Lip (N-MEM)", price: "₹70" },
      { name: "Upper Lip (MEM)", price: "₹50" },

      { name: "Fore Head (N-MEM)", price: "₹70" },
      { name: "Fore Head (MEM)", price: "₹50" },

      { name: "Eyebrow + Upper Lip (N-MEM)", price: "₹70" },
      { name: "Eyebrow + Upper Lip (MEM)", price: "₹50" },

      { name: "Full Face (N-MEM)", price: "₹100" },
      { name: "Full Face (MEM)", price: "₹80" },

      { name: "Chin (N-MEM)", price: "₹200" },
      { name: "Chin (MEM)", price: "₹170" }
    ]
  },
{
  group: "Hair Colour",
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
  services: [
    { name: "Root Touch-up (Ammonia) (N-MEM)", price: "₹1300" },
    { name: "Root Touch-up (Ammonia) (MEM)", price: "₹1100" },

    { name: "Root Touch-up (Ammonia Free) (N-MEM)", price: "₹1700" },
    { name: "Root Touch-up (Ammonia Free) (MEM)", price: "₹1500" },

    { name: "Global Hair Color - Med (Ammonia) (N-MEM)", price: "₹2000" },
    { name: "Global Hair Color - Med (Ammonia) (MEM)", price: "₹1800" },

    { name: "Global Hair Color - Long (Ammonia) (N-MEM)", price: "₹2500" },
    { name: "Global Hair Color - Long (Ammonia) (MEM)", price: "₹2200" },

    { name: "Global Hair Color - Med (Ammonia Free) (N-MEM)", price: "₹3500" },
    { name: "Global Hair Color - Med (Ammonia Free) (MEM)", price: "₹3000" },

    { name: "Global Hair Color - Long (Ammonia Free) (N-MEM)", price: "₹4500" },
    { name: "Global Hair Color - Long (Ammonia Free) (MEM)", price: "₹4000" },

    { name: "Global - Med (Fashion Color) (N-MEM)", price: "₹4000" },
    { name: "Global - Med (Fashion Color) (MEM)", price: "₹3500" },

    { name: "Global - Long (Fashion Color) (N-MEM)", price: "₹5000" },
    { name: "Global - Long (Fashion Color) (MEM)", price: "₹4500" },

    { name: "Global With Highlights | Balayage (N-MEM)", price: "₹7500" },
    { name: "Global With Highlights | Balayage (MEM)", price: "₹7500" },

    { name: "Only Highlights (Per Streak) (N-MEM)", price: "₹400" },
    { name: "Only Highlights (Per Streak) (MEM)", price: "₹300" },

    { name: "Classic Coloring (Ammonia) (N-MEM)", price: "₹800" },
    { name: "Classic Coloring (Ammonia) (MEM)", price: "₹700" },

    { name: "Classic Coloring (Ammonia Free) (N-MEM)", price: "₹1000" },
    { name: "Classic Coloring (Ammonia Free) (MEM)", price: "₹900" },

    { name: "Premium Hair Color (Fashion Color) (N-MEM)", price: "₹1500" },
    { name: "Premium Hair Color (Fashion Color) (MEM)", price: "₹1200" },

    { name: "Moustache Color (N-MEM)", price: "₹200" },
    { name: "Moustache Color (MEM)", price: "₹170" },

    { name: "Beard Coloring (N-MEM)", price: "₹400" },
    { name: "Beard Coloring (MEM)", price: "₹350" },

    { name: "Beard + Moustache Coloring (N-MEM)", price: "₹550" },
    { name: "Beard + Moustache Coloring (MEM)", price: "₹450" }
  ]
},

  {
  group: "Hair Texture",
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16M4 6h16M4 18h16"/></svg>',
  services: [
    { name: "Straightening / Smoothening *", price: "₹7000" },
    { name: "Keratin Treatment *", price: "₹8000" },
    { name: "Partial Straightening / Smoothening *", price: "₹5000" },
    { name: "Perming *", price: "₹6000" }
  ]
},
{
    group: "Hair Spa",
    icon: "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg>",
    services: [
        { name: "Head Massage - Men (N-MEM)", price: "₹400" },
        { name: "Head Massage - Men (MEM)", price: "₹300" },

        { name: "Head Massage - Women (N-MEM)", price: "₹800" },
        { name: "Head Massage - Women (MEM)", price: "₹700" },

        { name: "Moisturizing Hair Spa - Short (N-MEM)", price: "₹800" },
        { name: "Moisturizing Hair Spa - Medium (N-MEM)", price: "₹1000" },
        { name: "Moisturizing Hair Spa - Long (N-MEM)", price: "₹1200" },

        { name: "Moisturizing Hair Spa - Short (MEM)", price: "₹700" },
        { name: "Moisturizing Hair Spa - Medium (MEM)", price: "₹900" },
        { name: "Moisturizing Hair Spa - Long (MEM)", price: "₹1100" },

        { name: "Color Save Hair Spa - Short (N-MEM)", price: "₹1200" },
        { name: "Color Save Hair Spa - Medium (N-MEM)", price: "₹1400" },
        { name: "Color Save Hair Spa - Long (N-MEM)", price: "₹1500" },

        { name: "Color Save Hair Spa - Short (MEM)", price: "₹1100" },
        { name: "Color Save Hair Spa - Medium (MEM)", price: "₹1300" },
        { name: "Color Save Hair Spa - Long (MEM)", price: "₹1400" },

        { name: "Frizz Control Hair Spa - Short (N-MEM)", price: "₹1500" },
        { name: "Frizz Control Hair Spa - Medium (N-MEM)", price: "₹1700" },
        { name: "Frizz Control Hair Spa - Long (N-MEM)", price: "₹1800" },

        { name: "Absolute Repair - Short (N-MEM)", price: "₹2200" },
        { name: "Absolute Repair - Short (MEM)", price: "₹2000" },
        { name: "Absolute Repair - Medium (N-MEM)", price: "₹2400" },
        { name: "Absolute Repair - Medium (MEM)", price: "₹2200" },
        { name: "Absolute Repair - Long (N-MEM)", price: "₹2700" },
        { name: "Absolute Repair - Long (MEM)", price: "₹2500" }
    ]
},

  {
  group: "Skin Care",
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  services: [
    // Addon Face Masks
    { name: "Skin Tightening Mask (N-MEM)", price: "₹1500" },
    { name: "Skin Tightening Mask (MEM)", price: "₹1200" },

    { name: "Vibrant Glow Mask (N-MEM)", price: "₹1500" },
    { name: "Vibrant Glow Mask (MEM)", price: "₹1200" },

    { name: "24K Gold Mask (N-MEM)", price: "₹1500" },
    { name: "24K Gold Mask (MEM)", price: "₹1200" },

    { name: "Acne Purifying Mask (N-MEM)", price: "₹1500" },
    { name: "Acne Purifying Mask (MEM)", price: "₹1200" },

    { name: "Lightening & Brightening Mask (N-MEM)", price: "₹1500" },
    { name: "Lightening & Brightening Mask (MEM)", price: "₹1200" },

    // Clean Up
    { name: "Face & Neck - Detan (N-MEM)", price: "₹700" },
    { name: "Face & Neck - Detan (MEM)", price: "₹600" },

    { name: "Express Cleanup (N-MEM)", price: "₹800" },
    { name: "Express Cleanup (MEM)", price: "₹700" },

    { name: "Organic Clean Up (N-MEM)", price: "₹1000" },
    { name: "Organic Clean Up (MEM)", price: "₹900" },

    { name: "Herbal Facial (N-MEM)", price: "₹800" },
    { name: "Herbal Facial (MEM)", price: "₹700" },

    // Exclusive Facials
    { name: "Fruit Facial (N-MEM)", price: "₹1000" },
    { name: "Fruit Facial (MEM)", price: "₹800" },

    { name: "Instaglow Diamond Facial (N-MEM)", price: "₹1200" },
    { name: "Instaglow Diamond Facial (MEM)", price: "₹1000" },

    { name: "Kumkumadi Facial (N-MEM)", price: "₹1200" },
    { name: "Kumkumadi Facial (MEM)", price: "₹1000" },

    { name: "Red Wine Facial (N-MEM)", price: "₹1200" },
    { name: "Red Wine Facial (MEM)", price: "₹1000" },

    // Premium Facials
    { name: "Chocolate Facial (N-MEM)", price: "₹1800" },
    { name: "Chocolate Facial (MEM)", price: "₹1500" },

    { name: "Dead Sea Facial (N-MEM)", price: "₹2000" },
    { name: "Dead Sea Facial (MEM)", price: "₹1800" },

    { name: "Fair & Glow Facial (N-MEM)", price: "₹2200" },
    { name: "Fair & Glow Facial (MEM)", price: "₹2000" },

    { name: "Age Reversal Facial (N-MEM)", price: "₹2200" },
    { name: "Age Reversal Facial (MEM)", price: "₹2000" },

    { name: "Gold Facial (N-MEM)", price: "₹2400" },
    { name: "Gold Facial (MEM)", price: "₹2200" },

    { name: "Sparkle Facial (N-MEM)", price: "₹2400" },
    { name: "Sparkle Facial (MEM)", price: "₹2200" },

    { name: "Anti-Acne Facial (N-MEM)", price: "₹2400" },
    { name: "Anti-Acne Facial (MEM)", price: "₹2200" },

    { name: "Anti Tan Facial (N-MEM)", price: "₹2400" },
    { name: "Anti Tan Facial (MEM)", price: "₹2200" },

    { name: "Vitamin C Glow Facial (N-MEM)", price: "₹2400" },
    { name: "Vitamin C Glow Facial (MEM)", price: "₹2200" },

    // Luxury Facials
    { name: "24K Gold Facial (N-MEM)", price: "₹3500" },
    { name: "24K Gold Facial (MEM)", price: "₹3200" },

    { name: "Skin Lightening Facial (N-MEM)", price: "₹3500" },
    { name: "Skin Lightening Facial (MEM)", price: "₹3200" },

    { name: "Advance Age Reversal Facial (N-MEM)", price: "₹3500" },
    { name: "Advance Age Reversal Facial (MEM)", price: "₹3200" },

    { name: "Advance Anti-Acne Facial (N-MEM)", price: "₹4000" },
    { name: "Advance Anti-Acne Facial (MEM)", price: "₹3700" },

    { name: "Skin Lightening & Brightening (N-MEM)", price: "₹4000" },
    { name: "Skin Lightening & Brightening (MEM)", price: "₹3700" },

    { name: "Bridal Glow Facial (N-MEM)", price: "₹4000" },
    { name: "Bridal Glow Facial (MEM)", price: "₹3700" },

    // Hydra Facials
    { name: "Hydra Facial (N-MEM)", price: "₹6000" },
    { name: "Hydra Facial (MEM)", price: "₹5000" }
  ]
},

  {
  group: "Body Care",
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/></svg>',
  services: [
    // Body Care - Detan
    { name: "Underarms Detan (N-MEM)", price: "₹300" },
    { name: "Underarms Detan (MEM)", price: "₹250" },

    { name: "Half Arms Detan (N-MEM)", price: "₹500" },
    { name: "Half Arms Detan (MEM)", price: "₹450" },

    { name: "Full Arms Detan (N-MEM)", price: "₹800" },
    { name: "Full Arms Detan (MEM)", price: "₹700" },

    { name: "Half Legs Detan (N-MEM)", price: "₹600" },
    { name: "Half Legs Detan (MEM)", price: "₹550" },

    { name: "Full Legs Detan (N-MEM)", price: "₹1000" },
    { name: "Full Legs Detan (MEM)", price: "₹900" },

    { name: "Lower Back / Upper Back Detan (N-MEM)", price: "₹600" },
    { name: "Lower Back / Upper Back Detan (MEM)", price: "₹500" },

    { name: "Abdomen Detan (N-MEM)", price: "₹500" },
    { name: "Abdomen Detan (MEM)", price: "₹450" },

    { name: "Full Body Detan (N-MEM)", price: "₹2500" },
    { name: "Full Body Detan (MEM)", price: "₹2200" },

    // Waxing Services
    { name: "Underarms Waxing (N-MEM)", price: "₹150" },
    { name: "Underarms Waxing (MEM)", price: "₹120" },

    { name: "Half Arms Waxing (N-MEM)", price: "₹350" },
    { name: "Half Arms Waxing (MEM)", price: "₹300" },

    { name: "Full Arms Waxing (N-MEM)", price: "₹600" },
    { name: "Full Arms Waxing (MEM)", price: "₹500" },

    { name: "Half Legs Waxing (N-MEM)", price: "₹450" },
    { name: "Half Legs Waxing (MEM)", price: "₹400" },

    { name: "Full Legs Waxing (N-MEM)", price: "₹800" },
    { name: "Full Legs Waxing (MEM)", price: "₹700" },

    { name: "Full Body Waxing (N-MEM)", price: "₹2200" },
    { name: "Full Body Waxing (MEM)", price: "₹2000" },

    { name: "Lower Back / Upper Back Waxing (N-MEM)", price: "₹400" },
    { name: "Lower Back / Upper Back Waxing (MEM)", price: "₹350" },

    { name: "Midriff Waxing (N-MEM)", price: "₹300" },
    { name: "Midriff Waxing (MEM)", price: "₹250" }
  ]
},
{
  group: "Manicure & Pedicure",
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>',
  services: [
    // Manicures
    { name: "Organic Manicure (N-MEM)", price: "₹600" },
    { name: "Organic Manicure (MEM)", price: "₹500" },

    { name: "Aromatic Manicure (N-MEM)", price: "₹800" },
    { name: "Aromatic Manicure (MEM)", price: "₹700" },

    { name: "Chocolate Mint Manicure (N-MEM)", price: "₹1000" },
    { name: "Chocolate Mint Manicure (MEM)", price: "₹800" },

    { name: "Fine Wine Manicure (N-MEM)", price: "₹1200" },
    { name: "Fine Wine Manicure (MEM)", price: "₹1000" },

    { name: "No More Tan Manicure (N-MEM)", price: "₹1200" },
    { name: "No More Tan Manicure (MEM)", price: "₹1000" },

    // Luxury Manicures
    { name: "Crystal Spa Manicure (N-MEM)", price: "₹1800" },
    { name: "Crystal Spa Manicure (MEM)", price: "₹1500" },

    { name: "Candle Spa Manicure (N-MEM)", price: "₹1800" },
    { name: "Candle Spa Manicure (MEM)", price: "₹1500" },

    { name: "Bombshell Manicure (N-MEM)", price: "₹2200" },
    { name: "Bombshell Manicure (MEM)", price: "₹2000" },

    // Pedicures
    { name: "Organic Pedicure (N-MEM)", price: "₹700" },
    { name: "Organic Pedicure (MEM)", price: "₹600" },

    { name: "Aromatic Pedicure (N-MEM)", price: "₹1000" },
    { name: "Aromatic Pedicure (MEM)", price: "₹800" },

    { name: "Chocolate Mint Pedicure (N-MEM)", price: "₹1200" },
    { name: "Chocolate Mint Pedicure (MEM)", price: "₹1000" },

    { name: "Fine Wine Pedicure (N-MEM)", price: "₹1500" },
    { name: "Fine Wine Pedicure (MEM)", price: "₹1400" },

    { name: "No More Tan Pedicure (N-MEM)", price: "₹1500" },
    { name: "No More Tan Pedicure (MEM)", price: "₹1400" },

    // Luxury Pedicures
    { name: "Crystal Spa Pedicure (N-MEM)", price: "₹2000" },
    { name: "Crystal Spa Pedicure (MEM)", price: "₹1800" },

    { name: "Candle Spa Pedicure (N-MEM)", price: "₹2000" },
    { name: "Candle Spa Pedicure (MEM)", price: "₹1800" },

    { name: "Bombshell Pedicure (N-MEM)", price: "₹2500" },
    { name: "Bombshell Pedicure (MEM)", price: "₹2400" },

    // Ayurasa
    { name: "Ayurasa Pedicure / Manicure (N-MEM)", price: "₹3000" },
    { name: "Ayurasa Pedicure / Manicure (MEM)", price: "₹2800" },

    // Heel Treatment
    { name: "Heel Peel (N-MEM)", price: "₹2500" },
    { name: "Heel Peel (MEM)", price: "₹2400" }
  ]
}
];



const customServiceSelect = document.getElementById('customServiceSelect');
const customServiceTrigger = customServiceSelect ? customServiceSelect.querySelector('.custom-select-trigger') : null;
const customServiceDropdown = customServiceSelect ? customServiceSelect.querySelector('.custom-select-dropdown') : null;
const customServiceOptionsContainer = document.getElementById('customServiceOptions');
const customServiceSearch = customServiceSelect ? customServiceSelect.querySelector('.custom-select-search') : null;
const customSelectText = customServiceSelect ? customServiceSelect.querySelector('.custom-select-text') : null;
const hiddenNativeSelect = document.getElementById('bService');

// Debounce Utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => { clearTimeout(timeout); func(...args); };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

if (customServiceSelect && hiddenNativeSelect) {
  // Populate hidden native select and custom dropdown accordion
  customServicesData.forEach((cat, index) => {
    // Native OptGroup
    const optgroup = document.createElement('optgroup');
    optgroup.label = cat.group;
    hiddenNativeSelect.appendChild(optgroup);

    // Accordion Header
    const groupLabel = document.createElement('div');
    groupLabel.className = 'custom-optgroup-label';
    groupLabel.innerHTML = `${cat.icon} <span>${cat.group}</span> <svg class="acc-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`;
    
    // Accordion Body
    const groupBody = document.createElement('div');
    groupBody.className = 'custom-optgroup-body';
    
    // Toggle Logic
    groupLabel.addEventListener('click', () => {
      const isOpen = groupBody.classList.contains('open');
      document.querySelectorAll('.custom-optgroup-body').forEach(b => b.classList.remove('open'));
      document.querySelectorAll('.custom-optgroup-label').forEach(l => l.classList.remove('open'));
      if (!isOpen) {
        groupBody.classList.add('open');
        groupLabel.classList.add('open');
      }
    });

    cat.services.forEach(srvObj => {
      // Native Option
      const opt = document.createElement('option');
      opt.value = srvObj.name;
      opt.textContent = srvObj.name;
      optgroup.appendChild(opt);

      // Custom Option
      const optDiv = document.createElement('div');
      optDiv.className = 'custom-option';
      optDiv.dataset.value = srvObj.name;
      optDiv.innerHTML = `
        <div class="opt-name"><svg class="opt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> ${srvObj.name}</div>
        <div class="opt-price">${srvObj.price}</div>
      `;
      
      optDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        hiddenNativeSelect.value = srvObj.name;
        customSelectText.textContent = srvObj.name;
        customSelectText.style.color = 'var(--gold)';
        closeCustomDropdown();
      });

      groupBody.appendChild(optDiv);
    });

    customServiceOptionsContainer.appendChild(groupLabel);
    customServiceOptionsContainer.appendChild(groupBody);
    
    // Open first category by default
    if (index === 0) {
      groupBody.classList.add('open');
      groupLabel.classList.add('open');
    }
  });

  let dropdownOpen = false;

  const openCustomDropdown = () => {
    if (dropdownOpen) return;
    dropdownOpen = true;
    customServiceSelect.classList.add('open');
    customServiceDropdown.style.display = 'block';
    gsap.fromTo(customServiceDropdown, 
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }
    );
    customServiceSearch.focus();
  };

  const closeCustomDropdown = () => {
    if (!dropdownOpen) return;
    dropdownOpen = false;
    customServiceSelect.classList.remove('open');
    gsap.to(customServiceDropdown, {
      opacity: 0, y: 10, duration: 0.2, ease: 'power2.in',
      onComplete: () => { customServiceDropdown.style.display = 'none'; }
    });
    customServiceSearch.value = '';
    filterOptions('');
  };

  customServiceTrigger.addEventListener('click', () => {
    dropdownOpen ? closeCustomDropdown() : openCustomDropdown();
  });

  document.addEventListener('click', (e) => {
    if (!customServiceSelect.contains(e.target)) {
      closeCustomDropdown();
    }
  });

  // Debounced Search Filter
  const filterOptions = (term) => {
    const lowerTerm = term.toLowerCase();
    const categories = document.querySelectorAll('.custom-optgroup-label');
    const bodies = document.querySelectorAll('.custom-optgroup-body');
    
    bodies.forEach((body, idx) => {
      let hasVisibleChild = false;
      const options = body.querySelectorAll('.custom-option');
      
      options.forEach(opt => {
        const match = opt.textContent.toLowerCase().includes(lowerTerm);
        opt.classList.toggle('hidden', !match);
        if (match) hasVisibleChild = true;
      });

      categories[idx].classList.toggle('hidden', !hasVisibleChild);
      
      // Auto-expand categories if searching
      if (term.length > 0 && hasVisibleChild) {
        body.classList.add('open');
        categories[idx].classList.add('open');
      } else if (term.length === 0) {
        // Reset to default (only first open)
        if (idx === 0) {
          body.classList.add('open');
          categories[idx].classList.add('open');
        } else {
          body.classList.remove('open');
          categories[idx].classList.remove('open');
        }
      }
    });
  };

  customServiceSearch.addEventListener('input', debounce((e) => filterOptions(e.target.value), 300));
}

document.getElementById('bookingForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name    = document.getElementById('bName').value.trim();
  const phone   = document.getElementById('bPhone').value.trim();
  const service = document.getElementById('bService').value;
  const date    = document.getElementById('bDate').value;
  const time    = document.getElementById('bTime').value;
  
  if (!name || !phone || !service || !date || !time) return;
  
  const message = `Hello STUDIE'O7, I would like to book an appointment.\n\nName: ${name}\nPhone Number: ${phone}\nService: ${service}\nPreferred Date: ${date}\nPreferred Time: ${time}`;
  window.open(`https://wa.me/919894737044?text=${encodeURIComponent(message)}`, '_blank');
  
  e.target.reset();
  if (customSelectText) {
    customSelectText.textContent = 'Select a service';
    customSelectText.style.color = 'var(--text)';
  }
});

// ── 16. BOOK NAV BTN PULSE ────────────────────────
const bookNavBtn = document.getElementById('navBookBtn');
if (bookNavBtn) {
  gsap.to(bookNavBtn, {
    boxShadow: '0 0 0 10px rgba(201,168,76,0)',
    duration: 1.4,
    ease: 'power2.out',
    repeat: -1,
    repeatDelay: 1.6,
  });
}

// ── 17. RIPPLE EFFECT ON LUXURY BUTTONS ───────────
function createRipple(e) {
  const btn  = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const existing = btn.querySelector('.ripple');
  if (existing) existing.remove();
  const size   = Math.max(rect.width, rect.height) * 2;
  const x      = e.clientX - rect.left - size / 2;
  const y      = e.clientY - rect.top  - size / 2;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
}
document.querySelectorAll('.btn-primary-luxury').forEach(btn => btn.addEventListener('click', createRipple));

// ── 18. HERO MOUSE PARALLAX ───────────────────────
const heroSection = document.querySelector('.hero-section');
if (heroSection) {
  let mouseX = 0, mouseY = 0;
  heroSection.addEventListener('mousemove', (e) => {
    const rect  = heroSection.getBoundingClientRect();
    const cx    = rect.width  / 2;
    const cy    = rect.height / 2;
    mouseX = (e.clientX - rect.left  - cx) / cx;
    mouseY = (e.clientY - rect.top   - cy) / cy;

    const ambient = heroSection.querySelector('.hero-ambient');
    const bg      = heroSection.querySelector('.hero-bg-gradient');
    const streaks = heroSection.querySelectorAll('.hero-streak');

    gsap.to(ambient, {
      x: mouseX * 22, y: mouseY * 14,
      duration: 1.4, ease: 'power2.out', overwrite: 'auto'
    });
    gsap.to(bg, {
      x: mouseX * 10, y: mouseY * 7,
      duration: 1.6, ease: 'power2.out', overwrite: 'auto'
    });
    streaks.forEach((s, i) => {
      const factor = 0.4 + i * 0.1;
      gsap.to(s, {
        x: mouseX * factor * 20,
        duration: 1.2 + i * 0.1, ease: 'power2.out', overwrite: 'auto'
      });
    });
    // 3D content tilt on mouse move
    gsap.to('.hero-content-wrap', {
      rotateX: -mouseY * 2.5,
      rotateY: mouseX * 2.5,
      duration: 1.6, ease: 'power2.out', overwrite: 'auto',
      transformPerspective: 1200,
    });
  });

  heroSection.addEventListener('mouseleave', () => {
    const ambient = heroSection.querySelector('.hero-ambient');
    const bg      = heroSection.querySelector('.hero-bg-gradient');
    gsap.to([ambient, bg, '.hero-streak', '.hero-content-wrap'], {
      x: 0, y: 0, rotateX: 0, rotateY: 0,
      duration: 1.4, ease: 'power3.out', overwrite: 'auto'
    });
  });
}

// ── 19. MAGNETIC HOVER ON PRIMARY BUTTONS ─────────
if (!window.matchMedia('(hover: none)').matches) {
  document.querySelectorAll('.btn-primary-luxury, .btn-ghost-luxury').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      gsap.to(btn, {
        x: dx * 7,
        y: dy * 5,
        duration: 0.4, ease: 'power2.out', overwrite: 'auto'
      });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
    });
  });
}

// ── 20. SUBTLE 3D TILT ON CARDS ───────────────────
if (!window.matchMedia('(hover: none)').matches) {
  const TILT_CARDS = [
    '.price-table-card', '.gallery-item', '.result-card',
    '.faq-item', '.contact-card', '.glass-card', '.bridal-hero-card',
  ].join(', ');

  const MAX_TILT = 5;
  const MAX_SHIFT = 6;

  function applyTilt(card, e) {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    const rotX = -dy * MAX_TILT;
    const rotY =  dx * MAX_TILT;

    gsap.to(card, {
      rotateX: rotX, rotateY: rotY,
      translateZ: MAX_SHIFT,
      translateY: -6,
      transformPerspective: 800,
      duration: 0.18, ease: 'none', overwrite: 'auto',
    });
  }

  function resetTilt(card) {
    gsap.to(card, {
      rotateX: 0, rotateY: 0, translateZ: 0, translateY: 0,
      duration: 0.6, ease: 'power3.out', overwrite: 'auto',
    });
  }

  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest(TILT_CARDS);
    if (!card) return;
    requestAnimationFrame(() => applyTilt(card, e));
  });

  document.addEventListener('mouseleave', (e) => {
    const card = e.target.closest(TILT_CARDS);
    if (card) resetTilt(card);
  }, true);

  document.querySelectorAll(TILT_CARDS).forEach(card => {
    card.addEventListener('mouseleave', () => resetTilt(card));
  });
}

// ── 21. FOOTER SOCIAL ICONS HOVER ANIMATION ───────
document.querySelectorAll('.social-icon-btn').forEach((btn, i) => {
  btn.addEventListener('mouseenter', () => {
    gsap.fromTo(btn, 
      { scale: 1 },
      { scale: 1.12, duration: 0.4, ease: 'back.out(2)' }
    );
    // Staggered glow pulse
    gsap.to(btn, {
      boxShadow: '0 0 24px rgba(201,168,76,0.5)',
      duration: 0.35, ease: 'power2.out'
    });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { scale: 1, boxShadow: 'none', duration: 0.45, ease: 'power3.out' });
  });
});

// ── 22. SCROLL-DRIVEN PROGRESS BAR ────────────────
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed; top: 0; left: 0; height: 2px; width: 0%;
  background: linear-gradient(90deg, var(--gold-dark), var(--gold-bright), var(--gold-dark));
  z-index: 9999; pointer-events: none;
  box-shadow: 0 0 10px var(--gold-glow);
  transition: width 0.05s linear;
`;
document.body.appendChild(progressBar);

lenis.on('scroll', ({ scroll, limit }) => {
  const progress = (scroll / limit) * 100;
  progressBar.style.width = `${progress}%`;
});

// ── 23. CONTACT SECTION – entrance glow ───────────
ScrollTrigger.create({
  trigger: '.contact-section',
  start: 'top 75%',
  onEnter: () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      gsap.from('.contact-card', { y: 40, opacity: 0, duration: 1.0, ease: 'power3.out', clearProps: 'all' });
      gsap.from('.map-wrap',     { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.3, clearProps: 'all' });
      gsap.from('.booking-card', { y: 40, opacity: 0, duration: 1.0, ease: 'power3.out', delay: 0.5, clearProps: 'all' });
    } else {
      gsap.from('.booking-card', { x: 60, opacity: 0, duration: 1.0, ease: 'power3.out', delay: 0.2, clearProps: 'all' });
      gsap.from('.contact-card', { x: -60, opacity: 0, duration: 1.0, ease: 'power3.out', clearProps: 'all' });
      gsap.from('.map-wrap',     { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.4, clearProps: 'all' });
    }
  },
  once: true,
});
