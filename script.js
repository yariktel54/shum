const body = document.body;
const header = document.querySelector('.header');
const menuBtn = document.querySelector('.menu-btn');
const menuPanel = document.querySelector('.menu-panel');
const links = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section[id]');
const horizontalScrollers = document.querySelectorAll('[data-horizontal-scroll]');

function closeMenu() {
  body.classList.remove('menu-open');
  if (menuBtn) {
    menuBtn.setAttribute('aria-expanded', 'false');
  }
}

function openMenu() {
  body.classList.add('menu-open');
  if (menuBtn) {
    menuBtn.setAttribute('aria-expanded', 'true');
  }
}

function toggleMenu() {
  const isOpen = body.classList.contains('menu-open');
  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
}

links.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    closeMenu();
  });
});

menuBtn?.addEventListener('click', toggleMenu);

document.addEventListener('click', (event) => {
  if (!body.classList.contains('menu-open')) return;
  if (header?.contains(event.target)) return;
  closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;

      links.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  },
  {
    rootMargin: '-35% 0px -45% 0px',
    threshold: 0.1,
  }
);

sections.forEach((section) => observer.observe(section));

horizontalScrollers.forEach((scroller) => {
  scroller.addEventListener(
    'wheel',
    (event) => {
      const mostlyVertical = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
      if (!mostlyVertical) return;

      const canScroll = scroller.scrollWidth > scroller.clientWidth;
      if (!canScroll) return;

      event.preventDefault();
      scroller.scrollLeft += event.deltaY;
    },
    { passive: false }
  );
});
