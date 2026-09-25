const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

function syncHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 18);
}
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.classList.toggle('is-open');
  mobileNav.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
});

mobileNav?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    mobileNav.classList.remove('is-open');
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  })
);

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (formNote) formNote.hidden = false;
});

/* ---------- Depth Gauge & Top Scroll Progress ---------- */
const scrollProgress = document.getElementById('scrollProgress');
const depthDrop = document.getElementById('depthDrop');
const depthRead = document.getElementById('depthRead');
const maxDepth = 3600; // in meters (from 0000 SURFACE to 3600 ABYSS)

let targetScrollProgress = 0;
let currentScrollProgress = 0;

function updateScrollProgress() {
  const doc = document.documentElement;
  const span = Math.max(1, doc.scrollHeight - window.innerHeight);
  targetScrollProgress = Math.min(1, Math.max(0, window.scrollY / span));
}

function renderDepthGauge() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prev = currentScrollProgress;
  currentScrollProgress = prefersReduced
    ? targetScrollProgress
    : currentScrollProgress + (targetScrollProgress - currentScrollProgress) * 0.14;

  if (Math.abs(targetScrollProgress - currentScrollProgress) < 0.0003) {
    currentScrollProgress = targetScrollProgress;
  }

  if (scrollProgress) {
    scrollProgress.style.width = (targetScrollProgress * 100).toFixed(2) + '%';
  }

  if (depthDrop) {
    const velocity = Math.min(1, Math.abs(currentScrollProgress - prev) * 40);
    depthDrop.style.top = (8 + currentScrollProgress * 84).toFixed(3) + '%';
    depthDrop.style.transform = `rotate(45deg) scaleY(${(1 + velocity * 1.6).toFixed(3)})`;
  }

  if (depthRead) {
    const depth = Math.round(currentScrollProgress * maxDepth);
    const label = `−${String(depth).padStart(4, '0')} M`;
    if (depthRead.textContent !== label) {
      depthRead.textContent = label;
    }
  }

  requestAnimationFrame(renderDepthGauge);
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();
renderDepthGauge();

/* ---------- 3D Geology Cube Interaction ---------- */
const cubeSection = document.getElementById('geology-cube');
const cubeStage = document.getElementById('cubeStage');
const cubeScene = document.getElementById('cubeScene');
const geologyCube = document.getElementById('geologyCube');
const cubeResetBtn = document.getElementById('cubeResetBtn');
const cubeAutoSpinBtn = document.getElementById('cubeAutoSpinBtn');

if (geologyCube && cubeStage) {
  let rotX = -18;
  let rotY = -36;
  let targetRotX = -18;
  let targetRotY = -36;
  let velX = 0;
  let velY = 0;
  let isDragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let autoSpin = false;
  let scrollTumbleProgress = 0;

  function measureCubeSection() {
    if (!cubeSection) return;
    const rect = cubeSection.getBoundingClientRect();
    const sectionHeight = cubeSection.offsetHeight;
    const windowH = window.innerHeight;
    const scrolled = windowH - rect.top;
    const total = sectionHeight + windowH;
    scrollTumbleProgress = Math.min(1, Math.max(0, scrolled / total));
  }

  cubeStage.addEventListener('pointerdown', (e) => {
    isDragging = true;
    autoSpin = false;
    cubeAutoSpinBtn?.classList.remove('is-active');
    if (cubeAutoSpinBtn) cubeAutoSpinBtn.textContent = 'Auto Spin ⏵';
    cubeStage.setPointerCapture(e.pointerId);
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    velX = 0;
    velY = 0;
  });

  cubeStage.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPointerX;
    const dy = e.clientY - lastPointerY;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;

    targetRotY += dx * 0.55;
    targetRotX -= dy * 0.55;

    velX = dx * 0.55;
    velY = -dy * 0.55;
  });

  const endDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    try {
      cubeStage.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  cubeStage.addEventListener('pointerup', endDrag);
  cubeStage.addEventListener('pointercancel', endDrag);

  cubeResetBtn?.addEventListener('click', () => {
    targetRotX = -18;
    targetRotY = -36;
    velX = 0;
    velY = 0;
    autoSpin = false;
    cubeAutoSpinBtn?.classList.remove('is-active');
    if (cubeAutoSpinBtn) cubeAutoSpinBtn.textContent = 'Auto Spin ⏵';
  });

  cubeAutoSpinBtn?.addEventListener('click', () => {
    autoSpin = !autoSpin;
    cubeAutoSpinBtn.classList.toggle('is-active', autoSpin);
    cubeAutoSpinBtn.textContent = autoSpin ? 'Auto Spin ⏸' : 'Auto Spin ⏵';
  });

  window.addEventListener('scroll', measureCubeSection, { passive: true });
  window.addEventListener('resize', measureCubeSection);
  measureCubeSection();

  function animateCube() {
    if (autoSpin) {
      targetRotY += 0.45;
    } else if (!isDragging) {
      targetRotX += velY;
      targetRotY += velX;
      velX *= 0.92;
      velY *= 0.92;

      const scrollInfluenceY = (scrollTumbleProgress - 0.5) * 280;
      const scrollInfluenceX = (scrollTumbleProgress - 0.5) * 35;
      targetRotY += (scrollInfluenceY - (targetRotY % 360)) * 0.015;
      targetRotX += (scrollInfluenceX - targetRotX) * 0.02;
    }

    targetRotX = Math.max(-80, Math.min(80, targetRotX));

    rotX += (targetRotX - rotX) * 0.12;
    rotY += (targetRotY - rotY) * 0.12;

    geologyCube.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;

    if (cubeScene && cubeSection) {
      const rect = cubeSection.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        const distFromCenter = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
        const norm = Math.max(0, 1 - distFromCenter / (rect.height * 0.7));
        const scale = 0.85 + norm * 0.15;
        cubeScene.style.transform = `scale(${scale.toFixed(3)})`;
      }
    }

    requestAnimationFrame(animateCube);
  }

  animateCube();
}

/* ---------- GIS Results Interactive Layer & Thumbnail Controls ---------- */
const layerItems = document.querySelectorAll('.gis-layer-item');
const thumbCards = document.querySelectorAll('.gis-thumb-card');
const mainGisImage = document.querySelector('.gis-main-image');

layerItems.forEach((item) => {
  item.addEventListener('click', () => {
    item.classList.toggle('is-active');
    const checkbox = item.querySelector('.gis-checkbox');
    if (checkbox) {
      checkbox.textContent = item.classList.contains('is-active') ? '✓' : '';
    }
  });
});

thumbCards.forEach((card) => {
  card.addEventListener('click', () => {
    const img = card.querySelector('img');
    if (img && mainGisImage) {
      mainGisImage.style.transition = 'opacity 0.2s ease';
      mainGisImage.style.opacity = '0.7';
      setTimeout(() => {
        mainGisImage.src = img.src;
        mainGisImage.style.opacity = '1';
      }, 150);
    }
  });
});

/* ---------- Hero Showcase Slider ---------- */
(function initHeroSlider() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero-slide');
  const dots = slider.querySelectorAll('.hero-dot');
  const prevBtn = document.getElementById('heroPrevBtn');
  const nextBtn = document.getElementById('heroNextBtn');
  let current = 0;
  let timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  function nextSlide() {
    showSlide(current + 1);
  }

  function prevSlide() {
    showSlide(current - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(nextSlide, 5500);
  }

  function stopAutoplay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  nextBtn?.addEventListener('click', () => {
    nextSlide();
    startAutoplay();
  });

  prevBtn?.addEventListener('click', () => {
    prevSlide();
    startAutoplay();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
      showSlide(idx);
      startAutoplay();
    });
  });

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
})();

/* ---------- Scroll-Triggered Reveals (GSAP / WOW style) ---------- */
(function initScrollReveals() {
  const reveals = document.querySelectorAll('[data-reveal]');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach((el) => observer.observe(el));
})();

/* ---------- Number Counters Animation ---------- */
(function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-counter') || '0');
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const isFloat = String(target).includes('.');
    const duration = 1400; // ms
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const val = eased * target;
      el.textContent = `${prefix}${isFloat ? val.toFixed(1) : Math.floor(val)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach((c) => observer.observe(c));
})();

/* ---------- Solutions Filter Tabs ---------- */
(function initSolutionTabs() {
  const tabContainer = document.getElementById('solutionTabs');
  const cards = document.querySelectorAll('.solution-card');
  if (!tabContainer || !cards.length) return;

  const tabs = tabContainer.querySelectorAll('.solution-tab');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter') || 'all';

      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });

      cards.forEach((card) => {
        const category = card.getAttribute('data-category');
        const match = filter === 'all' || category === filter;
        if (match) {
          card.classList.remove('is-filtered-out');
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          setTimeout(() => {
            card.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.classList.add('is-filtered-out');
        }
      });
    });
  });
})();

/* ---------- Video Modal Lightbox ---------- */
(function initVideoModal() {
  const modal = document.getElementById('videoModal');
  const backdrop = document.getElementById('videoModalBackdrop');
  const closeBtn = document.getElementById('closeVideoBtn');
  const triggers = document.querySelectorAll('.video-trigger-btn');
  const video = document.getElementById('modalVideo');

  if (!modal) return;

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (video) {
      video.pause();
    }
  }

  triggers.forEach((btn) => btn.addEventListener('click', openModal));
  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });
})();

/* ---------- Floating Back-to-Top Button ---------- */
(function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  function toggleBtn() {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }

  window.addEventListener('scroll', toggleBtn, { passive: true });
  toggleBtn();

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
})();

