const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", function (event) {
    const clickedInsideMenu =
      navLinks.contains(event.target) ||
      menuButton.contains(event.target);

    if (!clickedInsideMenu) {
      navLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

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
        href === "connect.html"
      ) {
        link.classList.toggle(
          "active",
          href === currentFile
        );
      }
    });
}

ensureChurchNavigation();

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

const staffSiteModule =
  document.createElement("script");

staffSiteModule.type =
  "module";

staffSiteModule.src =
  "staff-site.js?v=4";

document.body.appendChild(
  staffSiteModule
);

const publicLinksModule =
  document.createElement("script");

publicLinksModule.type =
  "module";

publicLinksModule.src =
  "site-links.js?v=1";

document.body.appendChild(
  publicLinksModule
);
