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
  const servicesLink =
    insertNavigationLink({
      href: "services.html",
      label: "Services",
      beforeSelectors: [
        'a[href="ministries.html"]',
        'a[href="sermons.html"]',
        'a[href="giving.html"]',
        'a[href="prayer.html"]',
        'a[href="contact.html"]'
      ]
    });

  const givingLink =
    insertNavigationLink({
      href: "giving.html",
      label: "Giving",
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
      const linkFile =
        link.getAttribute("href");

      if (
        linkFile === "services.html" ||
        linkFile === "giving.html"
      ) {
        link.classList.toggle(
          "active",
          linkFile === currentFile
        );
      }
    });

  return {
    servicesLink,
    givingLink
  };
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
  "staff-site.js?v=3";

document.body.appendChild(
  staffSiteModule
);
