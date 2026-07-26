const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");
const navWrap = document.querySelector(".nav-wrap");


/* =========================================================
   SHARED NAVIGATION LINKS
   ========================================================= */

function findStaffNavigationLink() {
  if (!navLinks) {
    return null;
  }

  return navLinks.querySelector(
    'a[data-staff-navigation="true"], a.staff-link, a[href="staff-login.html"], a[href="staff-dashboard.html"]'
  );
}


function insertNavigationLink({
  href,
  label,
  beforeSelectors
}) {
  if (!navLinks) {
    return null;
  }

  let link =
    navLinks.querySelector(
      `a[href="${href}"]`
    );

  if (!link) {
    link =
      document.createElement("a");

    link.href =
      href;

    link.textContent =
      label;

    let beforeElement = null;

    for (const selector of beforeSelectors) {
      beforeElement =
        navLinks.querySelector(selector);

      if (beforeElement) {
        break;
      }
    }

    navLinks.insertBefore(
      link,
      beforeElement || null
    );
  }

  return link;
}


function ensureChurchNavigation() {
  if (!navLinks) {
    return;
  }

  insertNavigationLink({
    href: "services.html",
    label: "Services",
    beforeSelectors: [
      'a[href="ministries.html"]',
      'a[href="sermons.html"]',
      'a[href="giving.html"]'
    ]
  });

  insertNavigationLink({
    href: "giving.html",
    label: "Giving",
    beforeSelectors: [
      'a[href="connect.html"]',
      'a[href="prayer.html"]',
      'a[href="contact.html"]'
    ]
  });

  insertNavigationLink({
    href: "connect.html",
    label: "Connect",
    beforeSelectors: [
      'a[href="prayer.html"]',
      'a[href="contact.html"]'
    ]
  });

  let staffLink =
    findStaffNavigationLink();

  if (!staffLink) {
    staffLink =
      document.createElement("a");

    staffLink.href =
      "staff-login.html";

    staffLink.textContent =
      "Staff";

    staffLink.className =
      "staff-link";

    staffLink.dataset.staffNavigation =
      "true";

    navLinks.appendChild(
      staffLink
    );
  } else {
    staffLink.dataset.staffNavigation =
      "true";
  }

  const currentFile =
    window.location.pathname
      .split("/")
      .pop() || "index.html";

  navLinks
    .querySelectorAll("a")
    .forEach(function (link) {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === currentFile
      );
    });
}


/* =========================================================
   DIRECT STAFF SHORTCUT
   ========================================================= */

function ensureStaffShortcut() {
  if (!navWrap || !menuButton) {
    return null;
  }

  let shortcut =
    document.getElementById(
      "mobileStaffShortcut"
    );

  if (!shortcut) {
    shortcut =
      document.createElement("a");

    shortcut.id =
      "mobileStaffShortcut";

    shortcut.className =
      "mobile-staff-shortcut";

    shortcut.href =
      "staff-login.html";

    shortcut.textContent =
      "Staff";

    shortcut.setAttribute(
      "aria-label",
      "Open staff sign in"
    );

    navWrap.insertBefore(
      shortcut,
      menuButton
    );
  }

  return shortcut;
}


function syncStaffShortcut() {
  const shortcut =
    ensureStaffShortcut();

  if (!shortcut) {
    return;
  }

  const staffLink =
    findStaffNavigationLink();

  shortcut.href =
    staffLink?.getAttribute("href") ||
    "staff-login.html";

  shortcut.textContent =
    "Staff";
}


/* =========================================================
   MENU OPEN AND CLOSE
   ========================================================= */

function closeMenu() {
  if (!navLinks || !menuButton) {
    return;
  }

  navLinks.classList.remove("open");

  menuButton.setAttribute(
    "aria-expanded",
    "false"
  );
}


function toggleMenu() {
  if (!navLinks || !menuButton) {
    return;
  }

  const isOpening =
    !navLinks.classList.contains("open");

  navLinks.classList.toggle(
    "open",
    isOpening
  );

  menuButton.setAttribute(
    "aria-expanded",
    String(isOpening)
  );

  if (isOpening) {
    navLinks.scrollTop = 0;
  }
}


ensureChurchNavigation();
ensureStaffShortcut();
syncStaffShortcut();


if (menuButton && navLinks) {
  menuButton.addEventListener(
    "click",
    function (event) {
      event.preventDefault();
      event.stopPropagation();
      toggleMenu();
    }
  );

  navLinks.addEventListener(
    "click",
    function (event) {
      if (event.target.closest("a")) {
        closeMenu();
      }
    }
  );

  document.addEventListener(
    "click",
    function (event) {
      if (
        !navLinks.classList.contains("open")
      ) {
        return;
      }

      if (
        navLinks.contains(event.target) ||
        menuButton.contains(event.target)
      ) {
        return;
      }

      closeMenu();
    }
  );

  window.addEventListener(
    "resize",
    function () {
      if (
        window.matchMedia(
          "(min-width: 1281px)"
        ).matches
      ) {
        closeMenu();
      }
    }
  );

  window.addEventListener(
    "pageshow",
    closeMenu
  );
}


/*
  staff-site.js changes the normal Staff link after Firebase checks
  the signed-in account. Keep the direct shortcut synchronized.
*/
if (navLinks) {
  const staffLinkObserver =
    new MutationObserver(
      syncStaffShortcut
    );

  staffLinkObserver.observe(
    navLinks,
    {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href"]
    }
  );
}


/* =========================================================
   EXISTING SHARED WEBSITE FEATURES
   ========================================================= */

document
  .querySelectorAll("[data-demo-form]")
  .forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();

        const status =
          form.querySelector(
            ".status-message"
          );

        if (status) {
          status.style.display =
            "block";
        }

        form.reset();
      }
    );
  });


const year =
  document.getElementById("year");

if (year) {
  year.textContent =
    new Date().getFullYear();
}


/* Universal staff mode */
const staffSiteModule =
  document.createElement("script");

staffSiteModule.type =
  "module";

staffSiteModule.src =
  "staff-site.js?v=6";

document.body.appendChild(
  staffSiteModule
);


/* Footer location and social links */
const publicLinksModule =
  document.createElement("script");

publicLinksModule.type =
  "module";

publicLinksModule.src =
  "site-links.js?v=3";

document.body.appendChild(
  publicLinksModule
);
