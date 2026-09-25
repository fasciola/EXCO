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

