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

/*
  Load the universal staff navigation and staff-status bar.
  This keeps Staff visible on every page of the same website.
*/
const staffSiteModule =
  document.createElement("script");

staffSiteModule.type =
  "module";

staffSiteModule.src =
  "staff-site.js?v=1";

document.body.appendChild(
  staffSiteModule
);
