/* =================================================================
   THEARIA — PORTFOLIO SCRIPT
   No frameworks, no build step — plain ES6+.

   Contents:
   1.  Setup & cached DOM references
   2.  Viewport height fix (--vh) for mobile browser chrome
   3.  Section navigation engine (the "one section per scroll" core)
   4.  Wheel / touch / keyboard input handling
   5.  Nav + URL sync
   6.  Per-section one-time reveal triggers (counters, skill bars)
   7.  Hero: rotating role text + typewriter code card
   8.  Custom cursor & hero parallax
   9.  Portfolio carousel
   10. Contact form (front-end only simulation)
   11. Local clock

   FIXES APPLIED:
   - Issue 1: Nav icon color now works (fill-based symbols + CSS override)
   - Issue 2: setActiveSection delayed until after track transition
   - Issue 3: onWheel/touchmove check for .portfolio-track target
   - Issue 4: popstate listener for browser back/forward hash sync
   - Issue 5: Typewriter flag prevents re-run; highlighting on each char
   - Issue 6: has-no-cursor set in HTML by default; removed in initCursor
   - Issue 7: Form status gap handled in CSS
   - Polish: scroll-hint fades after first scroll; reduced-motion static code
   - Social section: dedicated reveal-up rules for smooth entry animation
   - Portfolio section: dedicated reveal-up rules for smooth card entry
   - Contact section: dedicated reveal-up rules for smooth entry
   - Global delay reduced from 70ms to 50ms for faster overall reveal
   ================================================================= */

(() => {
  'use strict';

  /* ---------- MOBILE GUARD ----------
     On viewports ≤ 640px the CSS hides the desktop layout and shows the
     mobile teaser instead. Skip all portfolio JS to avoid touching DOM
     elements that are hidden or irrelevant on mobile.
  ---------------------------------------- */
  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  if (isMobile) {
    // Nothing to init — the teaser is pure HTML/CSS, no JS needed.
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. CACHED DOM ---------- */
  const viewport = document.getElementById('viewport');
  const track = document.getElementById('track');
  const sections = Array.from(document.querySelectorAll('.section'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const navProgressFill = document.getElementById('navProgressFill');
  const gotoTargets = Array.from(document.querySelectorAll('[data-goto]'));
  const scrollHint = document.querySelector('.scroll-hint');

  const TOTAL = sections.length;
  const TRANSITION_MS = prefersReducedMotion ? 260 : 1050;

  let activeIndex = 0;
  let isAnimating = false;

  /* ---------- 2. MOBILE-SAFE VIEWPORT HEIGHT ---------- */
  function setViewportHeight() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  }
  setViewportHeight();

  /* ---------- 3. SECTION NAVIGATION ENGINE ---------- */
  function applyTransform(index, instant = false) {
    if (instant) track.style.transition = 'none';
    track.style.transform = `translateY(calc(var(--vh, 1vh) * -100 * ${index}))`;
    if (instant) {
      requestAnimationFrame(() => {
        track.style.transition = '';
      });
    }
  }

  function updateNav(index) {
    navLinks.forEach((link, i) => {
      const active = i === index;
      link.classList.toggle('is-active', active);
      link.setAttribute('aria-current', active ? 'true' : 'false');
    });
    navProgressFill.style.transform = `translateY(${index * 100}%)`;
  }

  function setActiveSection(index) {
    sections.forEach((sec, i) => sec.classList.toggle('is-active', i === index));

    const current = sections[index];
    const inner = current.querySelector(':scope > .section-inner');
    if (inner) inner.scrollTop = 0;

    runOneTimeReveals(current);
  }

  function goTo(index) {
    index = Math.max(0, Math.min(TOTAL - 1, index));
    if (index === activeIndex || isAnimating) return;

    isAnimating = true;
    activeIndex = index;

    // Fade scroll hint after first scroll away from home
    if (index > 0 && scrollHint) {
      scrollHint.classList.add('is-hidden');
    }

    applyTransform(index);
    updateNav(index);

    // Delay setActiveSection until after track transition completes
    setTimeout(() => {
      setActiveSection(index);
      isAnimating = false;
    }, TRANSITION_MS);

    history.replaceState(null, '', `#${sections[index].id}`);
  }

  /* ---------- 4. INPUT HANDLING ---------- */

  function innerScrollBlocksNavigation(deltaY, target) {
    // If event originated inside the portfolio track, block nav
    if (target && target.closest && target.closest('.portfolio-track')) {
      return true;
    }

    const current = sections[activeIndex];
    const inner = current.querySelector(':scope > .section-inner');
    if (!inner) return false;

    const scrollable = inner.scrollHeight > inner.clientHeight + 2;
    if (!scrollable) return false;

    const atTop = inner.scrollTop <= 1;
    const atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1;

    if (deltaY > 0 && !atBottom) return true;
    if (deltaY < 0 && !atTop) return true;

    return false;
  }

  function onWheel(e) {
    if (Math.abs(e.deltaY) < 2) return;
    if (innerScrollBlocksNavigation(e.deltaY, e.target)) return;

    e.preventDefault();
    if (isAnimating) return;
    goTo(activeIndex + (e.deltaY > 0 ? 1 : -1));
  }
  viewport.addEventListener('wheel', onWheel, { passive: false });

  let touchStartY = 0;
  let touchStartX = 0;
  let touchActive = false;

  viewport.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    touchActive = true;
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (!touchActive) return;
    const deltaY = touchStartY - e.touches[0].clientY;
    const deltaX = Math.abs(touchStartX - e.touches[0].clientX);

    // If horizontal swipe dominates, don't trigger section nav
    if (deltaX > Math.abs(deltaY) * 1.2) return;

    if (innerScrollBlocksNavigation(deltaY, e.target)) {
      return;
    }

    if (Math.abs(deltaY) > 56) {
      e.preventDefault();
      if (!isAnimating) goTo(activeIndex + (deltaY > 0 ? 1 : -1));
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: false });

  viewport.addEventListener('touchend', () => {
    touchActive = false;
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.key === ' ' && (tag === 'button' || tag === 'a')) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      goTo(activeIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goTo(activeIndex - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(TOTAL - 1);
    }
  });

  gotoTargets.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(parseInt(el.dataset.goto, 10));
    });
  });

  window.addEventListener('resize', () => {
    setViewportHeight();
    applyTransform(activeIndex, true);
  });

  // Respond to browser back/forward button hash changes
  window.addEventListener('popstate', () => {
    const hashId = window.location.hash.replace('#', '');
    const matched = sections.findIndex((s) => s.id === hashId);
    if (matched > -1 && matched !== activeIndex && !isAnimating) {
      const targetIndex = matched;
      isAnimating = true;
      activeIndex = targetIndex;
      applyTransform(targetIndex);
      updateNav(targetIndex);
      setTimeout(() => {
        setActiveSection(targetIndex);
        isAnimating = false;
      }, TRANSITION_MS);
    }
  });

  /* ---------- 6. ONE-TIME REVEAL TRIGGERS ---------- */

  function animateCounters(container) {
    container.querySelectorAll('.stat-num[data-count]').forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      const duration = 1100;
      const start = performance.now();

      function tick(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  function fillSkillBars(container) {
    container.querySelectorAll('.skill-row[data-level]').forEach((row) => {
      const level = row.dataset.level;
      const fill = row.querySelector('.skill-fill');
      requestAnimationFrame(() => {
        fill.style.width = `${level}%`;
      });
    });
  }

  function runOneTimeReveals(section) {
    if (section.dataset.revealed) return;
    section.dataset.revealed = '1';

    if (section.id === 'about') animateCounters(section);
    if (section.id === 'skills') fillSkillBars(section);
  }

  sections.forEach((section) => {
    section.querySelectorAll('.reveal-up').forEach((el, i) => {
      el.style.setProperty('--ri', i);
    });
  });

  /* ---------- 7. HERO: ROLE ROTATOR + TYPEWRITER ---------- */

  function startRoleRotator() {
    const words = Array.from(document.querySelectorAll('.role-word'));
    if (!words.length || prefersReducedMotion) return;
    let i = 0;
    setInterval(() => {
      words[i].classList.remove('is-active');
      i = (i + 1) % words.length;
      words[i].classList.add('is-active');
    }, 2600);
  }

  const codeSnippet = `const thearia = {
  role: "Frontend Developer",
  status: "CS Student",
  stack: ["HTML", "CSS", "JS", "React"],
  passion: "pixel-perfect UI",
  available: true
};`;

  function highlightCode(rawText) {
    return rawText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"([^"]*)"/g, '<span class="tok-string">"$1"</span>')
      .replace(/\b(const|true|false)\b/g, '<span class="tok-kw">$1</span>')
      .replace(/\b([a-zA-Z_]+)\b(?=:)/g, '<span class="tok-key">$1</span>');
  }

  let typewriterDone = false;

  function startTypewriter() {
    const codeEl = document.getElementById('typedCode');
    const cursorEl = document.getElementById('codeCursor');
    if (!codeEl) return;

    if (prefersReducedMotion) {
      codeEl.innerHTML = highlightCode(codeSnippet);
      if (cursorEl) cursorEl.style.display = 'none';
      typewriterDone = true;
      return;
    }

    if (typewriterDone) {
      codeEl.innerHTML = highlightCode(codeSnippet);
      if (cursorEl) cursorEl.style.display = 'none';
      return;
    }

    let i = 0;
    const chars = [...codeSnippet];

    function step() {
      const current = chars.slice(0, i).join('');
      codeEl.innerHTML = highlightCode(current);
      i++;
      if (i <= chars.length) {
        setTimeout(step, 14);
      } else {
        codeEl.innerHTML = highlightCode(codeSnippet);
        if (cursorEl) cursorEl.style.display = 'none';
        typewriterDone = true;
      }
    }
    setTimeout(step, 650);
  }

  /* ---------- 8. CUSTOM CURSOR + HERO PARALLAX ---------- */

  function initCursor() {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (!supportsFinePointer || prefersReducedMotion) {
      return;
    }

    document.body.classList.remove('has-no-cursor');
    document.body.classList.add('custom-cursor-active');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    (function follow() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    })();

    const hoverTargets = 'a, button, .project-card, .social-card, .nav-link, input, textarea';
    document.querySelectorAll(hoverTargets).forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
    });
  }

  function initHeroParallax() {
    if (prefersReducedMotion) return;
    const blobs = document.querySelectorAll('.hero-section .mesh-blob');
    if (!blobs.length) return;

    let rafId = null;
    let lastX = 0;
    let lastY = 0;

    function updateBlobs(x, y) {
      const relX = x / window.innerWidth - 0.5;
      const relY = y / window.innerHeight - 0.5;
      blobs.forEach((blob, i) => {
        const depth = (i + 1) * 12;
        blob.style.transform = `translate(${relX * depth}px, ${relY * depth}px)`;
      });
    }

    function onMove(e) {
      if (activeIndex !== 0) return;
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateBlobs(lastX, lastY);
        rafId = null;
      });
    }

    window.addEventListener('mousemove', onMove);
  }

  /* ---------- 9. PORTFOLIO CAROUSEL ---------- */

  function initPortfolioCarousel() {
    const trackEl = document.getElementById('portfolioTrack');
    const prevBtn = document.getElementById('prevProject');
    const nextBtn = document.getElementById('nextProject');
    if (!trackEl) return;

    function step(dir) {
      const card = trackEl.querySelector('.project-card');
      if (!card) return;
      const gap = 24;
      const distance = card.getBoundingClientRect().width + gap;
      trackEl.scrollBy({ left: dir * distance, behavior: 'smooth' });
    }
    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));

    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    trackEl.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a, button')) return;
      dragging = true;
      startX = e.clientX;
      startScroll = trackEl.scrollLeft;
      trackEl.setPointerCapture(e.pointerId);
      trackEl.style.touchAction = 'none';
      e.stopPropagation();
    });

    trackEl.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      trackEl.scrollLeft = startScroll - (e.clientX - startX);
      e.stopPropagation();
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach((evt) => {
      trackEl.addEventListener(evt, () => {
        if (dragging) {
          dragging = false;
          trackEl.style.touchAction = '';
        }
      });
    });
  }

  /* ---------- 10. CONTACT FORM ---------- */

  function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');
    if (!form) return;
    const label = submitBtn.querySelector('.btn-submit-label');
    let clearTimer = null;

    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (status.textContent) {
          status.textContent = '';
          status.classList.remove('is-error');
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        status.textContent = 'Please fill in every field with a valid email address.';
        status.classList.add('is-error');
        return;
      }

      status.classList.remove('is-error');
      submitBtn.disabled = true;
      label.textContent = 'Sending...';

      setTimeout(() => {
        submitBtn.disabled = false;
        label.textContent = 'Send Message';
        status.textContent = "Thanks! I'll get back to you within a day or two.";
        form.reset();

        if (clearTimer) clearTimeout(clearTimer);
        clearTimer = setTimeout(() => {
          status.textContent = '';
          clearTimer = null;
        }, 6000);
      }, 1100);
    });
  }

  /* ---------- 11. LOCAL CLOCK ---------- */

  function initClock() {
    const el = document.getElementById('localTime');
    if (!el) return;
    function tick() {
      el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    tick();
    setInterval(tick, 15000);
  }

  /* ---------- INIT ---------- */

  function init() {
    const hashId = window.location.hash.replace('#', '');
    const matched = sections.findIndex((s) => s.id === hashId);
    if (matched > -1) activeIndex = matched;

    applyTransform(activeIndex, true);
    updateNav(activeIndex);
    setActiveSection(activeIndex);

    if (activeIndex > 0 && scrollHint) {
      scrollHint.classList.add('is-hidden');
    }

    if (scrollHint && activeIndex === 0) {
      setTimeout(() => {
        scrollHint.classList.add('is-hidden');
      }, 5000);
    }

    startRoleRotator();
    startTypewriter();
    initCursor();
    initHeroParallax();
    initPortfolioCarousel();
    initContactForm();
    initClock();
  }

  document.addEventListener('DOMContentLoaded', init);
})();