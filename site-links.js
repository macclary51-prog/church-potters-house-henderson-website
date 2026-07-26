import {
  db
} from "./firebase-config.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const TYPE_ICONS = {
  location: "⌖",
  facebook: "f",
  instagram: "◎",
  youtube: "▶",
  tiktok: "♪",
  x: "X",
  website: "↗",
  email: "✉",
  phone: "☎",
  other: "🔗"
};


function normalizeLink(type, value) {
  const text =
    String(value || "").trim();

  if (!text) {
    return "";
  }

  if (type === "email") {
    return text.startsWith("mailto:")
      ? text
      : `mailto:${text}`;
  }

  if (type === "phone") {
    return text.startsWith("tel:")
      ? text
      : `tel:${text.replace(/[^\d+]/g, "")}`;
  }

  try {
    const url =
      new URL(text);

    if (
      url.protocol === "https:" ||
      url.protocol === "http:"
    ) {
      return url.href;
    }
  } catch (error) {
    return "";
  }

  return "";
}


function addStyles() {
  if (
    document.getElementById(
      "globalChurchLinksStyles"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "globalChurchLinksStyles";

  style.textContent = `
    .global-church-links {
      width: 100%;
      padding: 15px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    }

    .global-church-links-title {
      display: block;
      margin-bottom: 9px;
      color: #ffd0bb;
      font-size: 0.7rem;
      font-weight: 900;
      letter-spacing: 0.09em;
      text-transform: uppercase;
    }

    .global-church-links-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .global-church-links-list a {
      display: inline-flex;
      min-height: 38px;
      align-items: center;
      gap: 7px;
      padding: 0 12px;
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 850;
      text-decoration: none;
    }

    .global-church-links-list a:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    .global-church-links-icon {
      display: inline-grid;
      width: 20px;
      height: 20px;
      place-items: center;
      color: #ffd0bb;
      font-weight: 900;
    }

    @media (max-width: 620px) {
      .global-church-links-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      .global-church-links-list a {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(
    style
  );
}


function ensureContainer() {
  const footerWrap =
    document.querySelector(
      "footer .footer-wrap"
    );

  if (!footerWrap) {
    return null;
  }

  let shell =
    footerWrap.querySelector(
      ".global-church-links"
    );

  if (!shell) {
    shell =
      document.createElement("div");

    shell.className =
      "global-church-links";

    const title =
      document.createElement("span");

    title.className =
      "global-church-links-title";

    title.textContent =
      "Connect With Us";

    const list =
      document.createElement("div");

    list.className =
      "global-church-links-list";

    shell.append(
      title,
      list
    );

    const copyright =
      footerWrap.lastElementChild;

    footerWrap.insertBefore(
      shell,
      copyright || null
    );
  }

  return shell.querySelector(
    ".global-church-links-list"
  );
}


function renderLinks(items) {
  const list =
    ensureContainer();

  if (!list) {
    return;
  }

  list.replaceChildren();

  items.slice(0, 8).forEach(function (item) {
    const data =
      item.data;

    const type =
      data.type || "other";

    const href =
      normalizeLink(
        type,
        data.url
      );

    if (!href) {
      return;
    }

    const link =
      document.createElement("a");

    link.href =
      href;

    if (
      type !== "email" &&
      type !== "phone"
    ) {
      link.target =
        "_blank";

      link.rel =
        "noopener noreferrer";
    }

    const icon =
      document.createElement("span");

    icon.className =
      "global-church-links-icon";

    icon.textContent =
      TYPE_ICONS[type] ||
      TYPE_ICONS.other;

    const label =
      document.createElement("span");

    label.textContent =
      data.title ||
      "Church Link";

    link.append(
      icon,
      label
    );

    list.appendChild(
      link
    );
  });

  const shell =
    list.closest(
      ".global-church-links"
    );

  shell.hidden =
    list.children.length === 0;
}


addStyles();

onSnapshot(
  collection(db, "siteLinks"),
  function (snapshot) {
    const items =
      snapshot.docs.map(function (documentSnapshot) {
        return {
          id: documentSnapshot.id,
          data: documentSnapshot.data()
        };
      });

    renderLinks(items);
  },
  function (error) {
    console.error(
      "Church footer links could not be loaded:",
      error
    );
  }
);
