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

function ensureGivingNavigation() {
  const navigation =
    document.getElementById("navLinks");

  if (!navigation) {
    return;
  }

  let givingLink =
    navigation.querySelector(
      'a[href="giving.html"]'
    );

  if (!givingLink) {
    givingLink =
      document.createElement("a");

    givingLink.href =
      "giving.html";

    givingLink.textContent =
      "Giving";

    const prayerLink =
      navigation.querySelector(
        'a[href="prayer.html"]'
      );

    const contactLink =
      navigation.querySelector(
        'a[href="contact.html"]'
      );

    const staffLink =
      navigation.querySelector(
        'a[href="staff-login.html"], a[data-staff-navigation]'
      );

    navigation.insertBefore(
      givingLink,
      prayerLink ||
      contactLink ||
      staffLink ||
      null
    );
  }

  const path =
    window.location.pathname
      .split("/")
      .pop();

  if (path === "giving.html") {
    navigation
      .querySelectorAll("a")
      .forEach(function (link) {
        link.classList.toggle(
          "active",
          link.getAttribute("href") ===
            "giving.html"
        );
      });
  }
}

ensureGivingNavigation();

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
  "staff-site.js?v=2";

document.body.appendChild(
  staffSiteModule
);
