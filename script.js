(function () {
  const body = document.body;
  const menuButtons = document.querySelectorAll("[data-menu-toggle]");
  const utilityPanel = document.querySelector("#site-menu-panel");
  const allLinks = document.querySelectorAll('a[href]');
  const sections = document.querySelectorAll("section[id]");
  const projectSliders = document.querySelectorAll(".projects-slider");
  const langButtons = document.querySelectorAll("[data-lang-switch]");
  const themeButtons = document.querySelectorAll("[data-theme-toggle]");
  const fontStepButtons = document.querySelectorAll("[data-font-step]");
  const fontResetButtons = document.querySelectorAll("[data-font-reset]");
  const fontValueTargets = document.querySelectorAll("[data-font-value]");
  const isProjectsPage = document.body.dataset.page === "projects";

  let currentLang = getCurrentLang();
  let currentScale = getCurrentScale();
  let projectsData = { featured: [], groups: [], projects: [] };
  let translations = { ua: {}, en: {} };

  function getCurrentLang() {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get("lang");
    if (langParam === "en" || langParam === "ua") {
      localStorage.setItem("shum-lang", langParam);
      return langParam;
    }
    const saved = localStorage.getItem("shum-lang");
    if (saved === "en" || saved === "ua") {
      return saved;
    }
    return "ua";
  }

  function getCurrentScale() {
    const saved = parseFloat(localStorage.getItem("shum-font-scale") || "1");
    if (Number.isFinite(saved)) {
      return Math.min(1.3, Math.max(0.9, saved));
    }
    return 1;
  }

  async function loadJson(path, fallback) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Cannot load " + path);
      }
      return await response.json();
    } catch (error) {
      console.warn(error);
      return fallback;
    }
  }

  function openMenu() {
    body.classList.add("menu-open");
    menuButtons.forEach(function (button) {
      button.setAttribute("aria-expanded", "true");
    });
  }

  function closeMenu() {
    body.classList.remove("menu-open");
    menuButtons.forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
    });
  }

  function toggleMenu() {
    if (body.classList.contains("menu-open")) {
      closeMenu();
      return;
    }
    openMenu();
  }

  function setActiveLink(id) {
    document.querySelectorAll("[data-nav-key]").forEach(function (link) {
      const matches = link.dataset.section === id;
      link.classList.toggle("active-link", matches);
    });
  }

  function dict() {
    return translations[currentLang] || translations.ua || {};
  }

  function textByLang(value) {
    if (!value) {
      return "";
    }
    if (typeof value === "string") {
      return value;
    }
    return value[currentLang] || value.ua || value.en || "";
  }

  function arrayByLang(value) {
    const result = textByLang(value);
    if (Array.isArray(result)) {
      return result;
    }
    if (typeof result === "string" && result.trim()) {
      return [result];
    }
    return [];
  }

  function getProjectById(projectId) {
    return projectsData.projects.find(function (project) {
      return project.id === projectId;
    });
  }

  function buildLocalizedHref(targetPath, hash) {
    const url = new URL(targetPath, window.location.href);
    url.searchParams.set("lang", currentLang);
    if (hash) {
      url.hash = hash;
    }
    return url.pathname.split("/").pop() + url.search + (url.hash || "");
  }

  function applyLocalizedLinks() {
    document.querySelectorAll("[data-lang-link]").forEach(function (link) {
      const targetPath = link.dataset.langLink || (window.location.pathname.split("/").pop() || "index.html");
      const hash = link.dataset.hash || "";
      link.setAttribute("href", buildLocalizedHref(targetPath, hash));
    });
  }

  function updateLanguageButtons() {
    langButtons.forEach(function (button) {
      const isActive = button.dataset.langSwitch === currentLang;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function updateThemeButtons() {
    const darkEnabled = body.classList.contains("theme-dark");
    themeButtons.forEach(function (button) {
      button.classList.toggle("is-active", darkEnabled);
      button.setAttribute("aria-pressed", darkEnabled ? "true" : "false");
    });
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      body.classList.add("theme-dark");
    } else {
      body.classList.remove("theme-dark");
    }
    localStorage.setItem("shum-theme", theme);
    updateThemeButtons();
  }

  function initTheme() {
    const saved = localStorage.getItem("shum-theme") || "light";
    applyTheme(saved);
  }

  function applyFontScale(scale) {
    currentScale = Math.min(1.3, Math.max(0.9, Number(scale) || 1));
    document.documentElement.style.setProperty("--font-scale", currentScale.toFixed(2));
    localStorage.setItem("shum-font-scale", String(currentScale));
    fontValueTargets.forEach(function (target) {
      target.textContent = Math.round(currentScale * 100) + "%";
    });
  }

  function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (text) {
      element.textContent = text;
    }
    return element;
  }

  function renderMembers(container, project, className) {
    const members = arrayByLang(project.members);
    container.innerHTML = "";
    members.forEach(function (member) {
      container.appendChild(makeElement("span", className, member));
    });
  }

  function renderDescription(container, project, className) {
    const paragraphs = arrayByLang(project.description);
    container.innerHTML = "";
    paragraphs.forEach(function (paragraph) {
      container.appendChild(makeElement("p", className, paragraph));
    });
  }

  function renderHomeProjectCards() {
    document.querySelectorAll("[data-project-id]").forEach(function (card) {
      const project = getProjectById(card.dataset.projectId);
      if (!project) {
        return;
      }
      const title = card.querySelector("[data-project-title]");
      const lead = card.querySelector("[data-project-lead]");
      const members = card.querySelector("[data-project-members]");
      const text = card.querySelector("[data-project-text]");
      const links = card.querySelectorAll("[data-project-link]");

      if (title) {
        title.textContent = textByLang(project.title);
      }
      if (lead) {
        lead.textContent = textByLang(project.membersLabel);
      }
      if (members) {
        renderMembers(members, project, "project-member-line");
      }
      if (text) {
        renderDescription(text, project, "project-text-line");
      }
      links.forEach(function (link) {
        link.setAttribute("href", buildLocalizedHref("projects.html", "project-" + project.id));
      });
    });
  }

  function createCatalogTile(project, activeProjectId, grid) {
    const tile = document.createElement("button");
    const title = textByLang(project.title);
    const tag = textByLang(project.tag);
    const membersLabel = textByLang(project.membersLabel);
    const altText = title || dict()["project.emptyAlt"] || "";

    tile.type = "button";
    tile.className = "catalog-tile";
    tile.dataset.projectTile = project.id;
    if (project.empty) {
      tile.classList.add("catalog-tile-empty");
    }
    if (project.id === activeProjectId) {
      tile.classList.add("is-active");
      tile.id = "project-" + project.id;
    }
    tile.setAttribute("aria-expanded", project.id === activeProjectId ? "true" : "false");
    tile.setAttribute("aria-label", title || altText);

    const media = makeElement("span", "catalog-tile-media");
    const image = document.createElement("img");
    image.src = project.image || "assets/images/empty-project.svg";
    image.alt = altText;
    media.appendChild(image);

    const caption = makeElement("span", "catalog-tile-caption");
    caption.appendChild(makeElement("span", "catalog-tile-tag", tag));
    caption.appendChild(makeElement("span", "catalog-tile-title", title));

    const details = makeElement("span", "catalog-tile-details");
    details.appendChild(makeElement("p", "catalog-tile-detail-tag", tag));
    details.appendChild(makeElement("h3", "catalog-tile-detail-title", title));

    const meta = makeElement("div", "catalog-tile-detail-meta");
    if (membersLabel) {
      meta.appendChild(makeElement("p", "catalog-tile-detail-label", membersLabel));
    }
    const membersList = makeElement("div", "catalog-tile-detail-members");
    renderMembers(membersList, project, "catalog-tile-detail-member");
    meta.appendChild(membersList);
    details.appendChild(meta);

    const bodyText = makeElement("div", "catalog-tile-detail-body");
    renderDescription(bodyText, project, "catalog-tile-detail-text");
    details.appendChild(bodyText);

    tile.appendChild(media);
    tile.appendChild(caption);
    tile.appendChild(details);

    if (project.empty) {
      tile.disabled = true;
      tile.setAttribute("aria-disabled", "true");
    } else {
      tile.addEventListener("click", function () {
        activateCatalogTile(grid, tile, project.id);
      });
    }

    return tile;
  }

  function activateCatalogTile(grid, tile, projectId) {
    function update() {
      const isAlreadyActive = tile.classList.contains("is-active");
      grid.querySelectorAll(".catalog-tile").forEach(function (otherTile) {
        otherTile.classList.remove("is-active");
        otherTile.removeAttribute("id");
        otherTile.setAttribute("aria-expanded", "false");
      });

      if (!isAlreadyActive) {
        tile.classList.add("is-active");
        tile.id = "project-" + projectId;
        tile.setAttribute("aria-expanded", "true");
        history.replaceState({}, "", buildLocalizedHref("projects.html", "project-" + projectId));
      } else {
        history.replaceState({}, "", buildLocalizedHref("projects.html", ""));
      }
    }

    if (document.startViewTransition) {
      document.startViewTransition(update);
    } else {
      update();
    }
  }

  function applyCatalogGroups() {
    const hashProjectId = window.location.hash.startsWith("#project-")
      ? window.location.hash.replace("#project-", "")
      : "";

    document.querySelectorAll("[data-catalog-group]").forEach(function (grid) {
      const groupName = grid.dataset.catalogGroup;
      const projectEntries = projectsData.projects.filter(function (project) {
        return project.group === groupName;
      });

      grid.innerHTML = "";

      if (!projectEntries.length) {
        return;
      }

      let activeProjectId = "";
      if (hashProjectId) {
        const hashProject = getProjectById(hashProjectId);
        if (hashProject && hashProject.group === groupName) {
          activeProjectId = hashProjectId;
        }
      }

      projectEntries.forEach(function (project) {
        grid.appendChild(createCatalogTile(project, activeProjectId, grid));
      });
    });
  }

  function applyHashAfterRender() {
    if (!window.location.hash) {
      return;
    }
    const target = document.querySelector(window.location.hash);
    if (!target) {
      return;
    }
    requestAnimationFrame(function () {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function applyTranslations() {
    const currentDict = dict();
    document.documentElement.lang = currentLang === "en" ? "en" : "uk";
    document.title = isProjectsPage ? currentDict["html.title.projects"] : currentDict["html.title.home"];

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      const key = element.dataset.i18n;
      if (currentDict[key]) {
        element.textContent = currentDict[key];
      }
    });

    renderHomeProjectCards();

    if (isProjectsPage) {
      applyCatalogGroups();
      applyHashAfterRender();
    }

    updateLanguageButtons();
    updateThemeButtons();
    applyLocalizedLinks();
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
      const styles = window.getComputedStyle(track);
      gap = parseFloat(styles.columnGap || styles.gap || "0");
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
    const scroller = slider.querySelector("[data-project-scroll]");
    const prevButton = slider.querySelector(".project-arrow-left");
    const nextButton = slider.querySelector(".project-arrow-right");
    if (!scroller || !prevButton || !nextButton) {
      return;
    }

    function scrollProjects(direction) {
      const step = getProjectScrollStep(scroller);
      scroller.scrollBy({ left: step * direction, behavior: "smooth" });
    }

    prevButton.addEventListener("click", function () { scrollProjects(-1); });
    nextButton.addEventListener("click", function () { scrollProjects(1); });
    scroller.addEventListener("scroll", function () {
      updateProjectArrowState(scroller, prevButton, nextButton);
    });
    window.addEventListener("resize", function () {
      updateProjectArrowState(scroller, prevButton, nextButton);
    });
    updateProjectArrowState(scroller, prevButton, nextButton);
  }

  function bindStaticEvents() {
    menuButtons.forEach(function (button) {
      button.addEventListener("click", toggleMenu);
    });

    document.addEventListener("click", function (event) {
      if (!body.classList.contains("menu-open")) {
        return;
      }
      if (utilityPanel && utilityPanel.contains(event.target)) {
        return;
      }
      const clickedToggle = Array.from(menuButtons).some(function (button) {
        return button.contains(event.target);
      });
      if (clickedToggle) {
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
        const parsed = new URL(href, window.location.href);
        if (parsed.origin !== window.location.origin || !parsed.hash) {
          return;
        }
        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        const targetPath = parsed.pathname.split("/").pop() || "index.html";
        if (currentPath !== targetPath) {
          return;
        }
        const target = document.querySelector(parsed.hash);
        if (!target) {
          return;
        }
        event.preventDefault();
        history.replaceState({}, "", parsed.pathname.split("/").pop() + parsed.search + parsed.hash);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeMenu();
      });
    });

    if (sections.length) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          setActiveLink(entry.target.id);
        });
      }, { rootMargin: "-32% 0px -42% 0px", threshold: 0.12 });

      sections.forEach(function (section) {
        observer.observe(section);
      });
    }

    langButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentLang = button.dataset.langSwitch || "ua";
        localStorage.setItem("shum-lang", currentLang);
        const url = new URL(window.location.href);
        url.searchParams.set("lang", currentLang);
        history.replaceState({}, "", url.pathname.split("/").pop() + url.search + url.hash);
        applyTranslations();
      });
    });

    themeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const nextTheme = body.classList.contains("theme-dark") ? "light" : "dark";
        applyTheme(nextTheme);
      });
    });

    fontStepButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const step = parseFloat(button.dataset.fontStep || "0");
        applyFontScale(currentScale + step);
      });
    });

    fontResetButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyFontScale(1);
      });
    });

    projectSliders.forEach(function (slider) {
      setupProjectSlider(slider);
    });
  }

  async function start() {
    bindStaticEvents();
    initTheme();
    applyFontScale(currentScale);
    const loaded = await Promise.all([
      loadJson("data/projects.json", projectsData),
      loadJson("data/translations.json", translations)
    ]);
    projectsData = loaded[0];
    translations = loaded[1];
    applyTranslations();
  }

  start();
})();
