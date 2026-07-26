const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");


/* =========================================================
   MOBILE NAVIGATION FIX
   ========================================================= */

function addMobileNavigationFixStyles() {
  if (document.getElementById("mobileNavigationFixStyles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "mobileNavigationFixStyles";

  style.textContent = `
    @media (max-width: 960px) {
      html {
        overflow-x: hidden !important;
      }

      body {
        overflow-x: hidden !important;
      }

      #navLinks {
        box-sizing: border-box !important;
      }

      #navLinks.open {
        position: fixed !important;
        z-index: 99999 !important;
        top: 88px !important;
        right: 14px !important;
        bottom: 14px !important;
        left: 14px !important;

        display: flex !important;
        width: auto !important;
        max-width: none !important;
        height: auto !important;
        max-height: calc(100dvh - 102px) !important;

        flex-direction: column !important;
        align-items: stretch !important;
        justify-content: flex-start !important;
        gap: 4px !important;

        padding: 14px !important;
        padding-bottom: calc(20px + env(safe-area-inset-bottom)) !important;

        overflow-x: hidden !important;
        overflow-y: auto !important;
        overscroll-behavior: contain !important;
        -webkit-overflow-scrolling: touch !important;

        background: #ffffff !important;
        border: 1px solid #dce2e9 !important;
        border-radius: 18px !important;
        box-shadow: 0 22px 55px rgba(7, 24, 44, 0.28) !important;
      }

      #navLinks.open a {
        display: flex !important;
        width: 100% !important;
        min-height: 48px !important;
        flex: 0 0 auto !important;
        align-items: center !important;
        justify-content: flex-start !important;

        box-sizing: border-box !important;
        padding: 12px 14px !important;

        color: #102b4e !important;
        background: transparent !important;
        border-radius: 10px !important;

        font-size: 0.95rem !important;
        font-weight: 800 !important;
        text-align: left !important;
        text-decoration: none !important;
      }

      #navLinks.open a:hover,
      #navLinks.open a:focus,
      #navLinks.open a.active {
        color: #ffffff !important;
        background: linear-gradient(135deg, #e03a2f, #f26a32) !important;
      }

      #navLinks.open a[data-staff-navigation="true"],
      #navLinks.open a.staff-link {
        color: #ffffff !important;
        background: linear-gradient(135deg, #102b4e, #07182c) !important;
        border: 2px solid #f26a32 !important;
      }

      #navLinks.open::after {
        content: "Scroll for all menu options";
        display: block;
        flex: 0 0 auto;
        padding: 12px 8px 4px;
        color: #667085;
        font-size: 0.72rem;
        font-weight: 700;
        text-align: center;
      }

      body.mobile-menu-open {
        overflow: hidden !important;
        touch-action: none;
      }

      body.mobile-menu-open #navLinks.open {
        touch-action: pan-y;
      }

      #menuButton {
        position: relative;
        z-index: 100000 !important;
      }
    }

    @media (max-width: 620px) {
      #navLinks.open {
        top: 78px !important;
        right: 9px !important;
        bottom: 9px !important;
        left: 9px !important;
        max-height: calc(100dvh - 87px) !important;
      }
    }
  `;

  document.head.appendChild(style);
}


function isMobileNavigation() {
  return window.matchMedia("(max-width: 960px)").matches;
}


function findStaffLink() {
  if (!navLinks) {
    return null;
  }

  return navLinks.querySelector(
    'a[data-staff-navigation="true"], a.staff-link, a[href="staff-login.html"], a[href="staff-dashboard.html"]'
  );
}


function moveStaffLinkToTopOnMobile() {
  if (!navLinks || !isMobileNavigation()) {
    return;
  }

  const staffLink = findStaffLink();

  if (!staffLink) {
    return;
  }

  staffLink.dataset.staffNavigation = "true";

  /*
    Put Staff first on phones so the pastor does not need to scroll
    through every public page before reaching it.
  */
  if (navLinks.firstElementChild !== staffLink) {
    navLinks.insertBefore(
      staffLink,
      navLinks.firstElementChild
    );
  }
}


function openMobileMenu() {
  if (!navLinks || !menuButton) {
    return;
  }

  navLinks.classList.add("open");
  menuButton.setAttribute("aria-expanded", "true");

  if (isMobileNavigation()) {
    document.body.classList.add("mobile-menu-open");
    moveStaffLinkToTopOnMobile();

    navLinks.scrollTop = 0;
  }
}


function closeMobileMenu() {
  if (!navLinks || !menuButton) {
    return;
  }

  navLinks.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("mobile-menu-open");
}


addMobileNavigationFixStyles();


if (menuButton && navLinks) {
  menuButton.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (navLinks.classList.contains("open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  navLinks.addEventListener("click", function (event) {
    const clickedLink = event.target.closest("a");

    if (clickedLink) {
      closeMobileMenu();
    }
  });

  /*
    Do not close merely because the user swiped inside the menu.
  */
  document.addEventListener("click", function (event) {
    if (!navLinks.classList.contains("open")) {
      return;
    }

    const clickedInsideMenu =
      navLinks.contains(event.target) ||
      menuButton.contains(event.target);

    if (!clickedInsideMenu) {
      closeMobileMenu();
    }
  });

  window.addEventListener("resize", function () {
    if (!isMobileNavigation()) {
      closeMobileMenu();
    } else {
      moveStaffLinkToTopOnMobile();
    }
  });

  window.addEventListener("pageshow", function () {
    closeMobileMenu();
    moveStaffLinkToTopOnMobile();
  });
}


/* =========================================================
   SHARED WEBSITE NAVIGATION LINKS
   ========================================================= */

function insertNavigationLink({
  href,
  label,
  beforeSelectors
}) {
  const navigation =
    document.getElementById("navLinks");

  if (!navigation) {
    return null;
  }

  let link =
    navigation.querySelector(
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
        navigation.querySelector(selector);

      if (beforeElement) {
        break;
      }
    }

    navigation.insertBefore(
      link,
      beforeElement || null
    );
  }

  return link;
}


function ensureChurchNavigation() {
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
      'a[href="contact.html"]',
      'a[href="staff-login.html"]',
      'a[data-staff-navigation]'
    ]
  });

  /*
    Ensure Staff exists even before Firebase staff-site.js finishes loading.
  */
  let staffLink = findStaffLink();

  if (!staffLink && navLinks) {
    staffLink = document.createElement("a");
    staffLink.href = "staff-login.html";
    staffLink.textContent = "Staff";
    staffLink.className = "staff-link";
    staffLink.dataset.staffNavigation = "true";
    navLinks.appendChild(staffLink);
  }

  const currentFile =
    window.location.pathname
      .split("/")
      .pop() || "index.html";

  document
    .querySelectorAll("#navLinks a")
    .forEach(function (link) {
      const href =
        link.getAttribute("href");

      if (
        href === "services.html" ||
        href === "giving.html" ||
        href === "connect.html" ||
        href === "staff-login.html"
      ) {
        link.classList.toggle(
          "active",
          href === currentFile
        );
      }
    });

  moveStaffLinkToTopOnMobile();
}


ensureChurchNavigation();


/*
  staff-site.js may update or create the Staff link after Firebase loads.
  Keep watching the menu and move that same link to the top on phones.
*/
if (navLinks) {
  const navigationObserver =
    new MutationObserver(function () {
      moveStaffLinkToTopOnMobile();
    });

  navigationObserver.observe(
    navLinks,
    {
      childList: true,
      subtree: true,
      characterData: true
    }
  );
}


/* =========================================================
   EXISTING SHARED WEBSITE FEATURES
   ========================================================= */

document.querySelectorAll("[data-demo-form]").forEach(function (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const status =
      form.querySelector(".status-message");

    if (status) {
      status.style.display = "block";
    }

    form.reset();
  });
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
  "staff-site.js?v=5";

document.body.appendChild(
  staffSiteModule
);


/* Footer location and social links */
const publicLinksModule =
  document.createElement("script");

publicLinksModule.type =
  "module";

publicLinksModule.src =
  "site-links.js?v=2";

document.body.appendChild(
  publicLinksModule
);
