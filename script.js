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

function getProjectScrollStep(scroller) {
  if (!scroller) {
    return 0;
  }

  const firstCard = scroller.querySelector(".project-card");
  const track = scroller.querySelector(".projects-track");

  if (!firstCard) {
    return scroller.clientWidth;
  }

  let gap = 0;

  if (track) {
    gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || "0");
  }

  return firstCard.getBoundingClientRect().width + gap;
}

function updateProjectArrowState(scroller, prevButton, nextButton) {
  if (!scroller || !prevButton || !nextButton) {
    return;
  }

  const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
  const currentScrollLeft = scroller.scrollLeft;

  prevButton.disabled = currentScrollLeft <= 1;
  nextButton.disabled = currentScrollLeft >= maxScrollLeft - 1;
}

function setupProjectSlider(slider) {
  if (!slider) {
    return;
  }

  const scroller = slider.querySelector("[data-project-scroll]");
  const prevButton = slider.querySelector(".project-arrow-left");
  const nextButton = slider.querySelector(".project-arrow-right");

  if (!scroller || !prevButton || !nextButton) {
    return;
  }

  function scrollProjects(direction) {
    const step = getProjectScrollStep(scroller);
    scroller.scrollBy({
      left: step * direction,
      behavior: "smooth",
    });
  }

  prevButton.addEventListener("click", function () {
    scrollProjects(-1);
  });

  nextButton.addEventListener("click", function () {
    scrollProjects(1);
  });

  scroller.addEventListener("scroll", function () {
    updateProjectArrowState(scroller, prevButton, nextButton);
  });

  window.addEventListener("resize", function () {
    updateProjectArrowState(scroller, prevButton, nextButton);
  });

  updateProjectArrowState(scroller, prevButton, nextButton);
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
  }
);

sections.forEach(function (section) {
  observer.observe(section);
});

document.querySelectorAll(".projects-slider").forEach(function (slider) {
  setupProjectSlider(slider);
});
