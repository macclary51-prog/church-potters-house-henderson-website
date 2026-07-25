document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.getElementById("menuButton");
  const navLinks = document.getElementById("navLinks");

  if (menuButton && navLinks) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-controls", "navLinks");

    menuButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      const isOpen = navLinks.classList.toggle("open");

      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close menu" : "Open menu"
      );

      menuButton.textContent = isOpen ? "✕" : "☰";
    });

    navLinks
      .querySelectorAll("a")
      .forEach(function (link) {
        link.addEventListener("click", function () {
          navLinks.classList.remove("open");

          menuButton.setAttribute(
            "aria-expanded",
            "false"
          );

          menuButton.setAttribute(
            "aria-label",
            "Open menu"
          );

          menuButton.textContent = "☰";
        });
      });

    document.addEventListener("click", function (event) {
      const clickedOutsideMenu =
        !navLinks.contains(event.target);

      const clickedOutsideButton =
        !menuButton.contains(event.target);

      if (
        clickedOutsideMenu &&
        clickedOutsideButton
      ) {
        navLinks.classList.remove("open");

        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );

        menuButton.setAttribute(
          "aria-label",
          "Open menu"
        );

        menuButton.textContent = "☰";
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) {
        navLinks.classList.remove("open");

        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );

        menuButton.setAttribute(
          "aria-label",
          "Open menu"
        );

        menuButton.textContent = "☰";
      }
    });
  }

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
            status.style.display = "block";
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
});
