const body = document.body;
const burger = document.querySelector(".burger");
const mobileMenu = document.querySelector(".mobile-menu");
const desktopLinks = document.querySelectorAll(".nav-link");
const mobileLinks = document.querySelectorAll(".mobile-link");
const allLinks = document.querySelectorAll('a[href^="#"]');
const sections = document.querySelectorAll("section[id]");

function openMenu() {
  body.classList.add("menu-open");
  if (burger) {
    burger.setAttribute("aria-expanded", "true");
  }
}

function closeMenu() {
  body.classList.remove("menu-open");
  if (burger) {
    burger.setAttribute("aria-expanded", "false");
  }
}

function toggleMenu() {
  if (body.classList.contains("menu-open")) {
    closeMenu();
    return;
  }

  openMenu();
}

function setActiveLink(id) {
  desktopLinks.forEach(function (link) {
    const href = link.getAttribute("href");
    const isCurrent = href === "#" + id;
    link.classList.toggle("active-link", isCurrent);
  });

  mobileLinks.forEach(function (link) {
    const href = link.getAttribute("href");
    const isCurrent = href === "#" + id;
    link.classList.toggle("active-link", isCurrent);
  });
}

burger?.addEventListener("click", toggleMenu);

document.addEventListener("click", function (event) {
  if (!body.classList.contains("menu-open")) {
    return;
  }

  if (mobileMenu && mobileMenu.contains(event.target)) {
    return;
  }

  if (burger && burger.contains(event.target)) {
    return;
  }

  closeMenu();
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeMenu();
  }
});

allLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    const href = link.getAttribute("href");

    if (!href) {
      return;
    }

    if (!href.startsWith("#")) {
      return;
    }

    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    closeMenu();
  });
});

const observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) {
        return;
      }

      setActiveLink(entry.target.id);
    });
  },
  {
    rootMargin: "-32% 0px -42% 0px",
    threshold: 0.12,
  },
);

sections.forEach(function (section) {
  observer.observe(section);
});

const projectScrollers = document.querySelectorAll('[data-project-scroll]');

function canScrollProjects(scroller) {
  if (!scroller) {
    return false;
  }

  return scroller.scrollWidth > scroller.clientWidth + 1;
}

function isAtProjectsStart(scroller) {
  if (!scroller) {
    return true;
  }

  return scroller.scrollLeft <= 1;
}

function isAtProjectsEnd(scroller) {
  if (!scroller) {
    return true;
  }

  const rightEdge = scroller.scrollLeft + scroller.clientWidth;
  return rightEdge >= scroller.scrollWidth - 1;
}

function handleProjectsWheel(event) {
  const scroller = event.currentTarget;

  if (!canScrollProjects(scroller)) {
    return;
  }

  if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
    return;
  }

  if (event.deltaY > 0 && isAtProjectsEnd(scroller)) {
    return;
  }

  if (event.deltaY < 0 && isAtProjectsStart(scroller)) {
    return;
  }

  event.preventDefault();
  scroller.scrollLeft += event.deltaY;
}

projectScrollers.forEach(function (scroller) {
  scroller.addEventListener('wheel', handleProjectsWheel, { passive: false });
});

