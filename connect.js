import {
  auth,
  db
} from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const grid =
  document.getElementById("connectGrid");

const pastorShell =
  document.getElementById("connectPastorShell");

const pastorName =
  document.getElementById("connectPastorName");

const addButton =
  document.getElementById("connectAddButton");

const headingAdd =
  document.getElementById("connectHeadingAdd");

const editor =
  document.getElementById("connectEditor");

const editorMode =
  document.getElementById("connectEditorMode");

const editorTitle =
  document.getElementById("connectEditorTitle");

const closeButton =
  document.getElementById("connectCloseButton");

const cancelButton =
  document.getElementById("connectCancelButton");

const saveButton =
  document.getElementById("connectSaveButton");

const statusBox =
  document.getElementById("connectStatus");

const pageHint =
  document.getElementById("connectPageHint");

const toast =
  document.getElementById("connectToast");

let currentUser = null;
let currentLinks = [];
let toastTimer = null;


const TYPE_LABELS = {
  location: "Location",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  x: "X / Twitter",
  website: "Website",
  email: "Email",
  phone: "Phone",
  other: "Other"
};

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


function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase();
}


function showToast(message, isError = false) {
  window.clearTimeout(toastTimer);

  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");

  toastTimer = window.setTimeout(function () {
    toast.classList.remove("show");
  }, 3200);
}


function showStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.toggle("error", isError);
  statusBox.style.display = "block";
}


function hideStatus() {
  statusBox.textContent = "";
  statusBox.classList.remove("error");
  statusBox.style.display = "none";
}


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
    if (text.startsWith("tel:")) {
      return text;
    }

    return `tel:${text.replace(/[^\d+]/g, "")}`;
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


function timestampSeconds(value) {
  if (!value) {
    return 0;
  }

  if (typeof value.seconds === "number") {
    return value.seconds;
  }

  if (typeof value.toDate === "function") {
    return Math.floor(
      value.toDate().getTime() / 1000
    );
  }

  return 0;
}


function openEditor(item = null) {
  editor.reset();
  hideStatus();

  editor.elements.documentId.value =
    item?.id || "";

  if (item) {
    editorMode.textContent =
      "Edit Existing";

    editorTitle.textContent =
      item.data.title ||
      "Church Link";

    saveButton.textContent =
      "Save Changes";

    editor.elements.type.value =
      item.data.type || "other";

    editor.elements.title.value =
      item.data.title || "";

    editor.elements.url.value =
      item.data.url || "";

    editor.elements.description.value =
      item.data.description || "";
  } else {
    editorMode.textContent =
      "Add New";

    editorTitle.textContent =
      "Church Link";

    saveButton.textContent =
      "Publish Link";
  }

  editor.hidden = false;

  editor.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


function closeEditor() {
  editor.reset();
  editor.elements.documentId.value = "";
  editor.hidden = true;
  hideStatus();
}


function createCard(item) {
  const data =
    item.data;

  const type =
    data.type || "other";

  const safeUrl =
    normalizeLink(
      type,
      data.url
    );

  const card =
    document.createElement("article");

  card.className =
    "connect-card";

  card.dataset.type =
    type;

  const icon =
    document.createElement("span");

  icon.className =
    "connect-card-icon";

  icon.textContent =
    TYPE_ICONS[type] ||
    TYPE_ICONS.other;

  const heading =
    document.createElement("h3");

  heading.textContent =
    data.title ||
    TYPE_LABELS[type] ||
    "Church Link";

  const badge =
    document.createElement("span");

  badge.className =
    "connect-card-type";

  badge.textContent =
    TYPE_LABELS[type] ||
    "Other";

  const description =
    document.createElement("p");

  description.textContent =
    data.description ||
    (
      type === "location"
        ? "Open the church location and directions."
        : "Open the church's official page."
    );

  card.append(
    icon,
    heading,
    badge,
    description
  );

  if (safeUrl) {
    const openLink =
      document.createElement("a");

    openLink.className =
      "connect-card-open";

    openLink.href =
      safeUrl;

    if (
      type !== "email" &&
      type !== "phone"
    ) {
      openLink.target =
        "_blank";

      openLink.rel =
        "noopener noreferrer";
    }

    openLink.textContent =
      type === "location"
        ? "Get Directions →"
        : type === "phone"
          ? "Call Church →"
          : type === "email"
            ? "Email Church →"
            : "Open Link →";

    card.appendChild(
      openLink
    );
  }

  if (currentUser) {
    const actions =
      document.createElement("div");

    actions.className =
      "connect-card-actions";

    const edit =
      document.createElement("button");

    edit.type =
      "button";

    edit.className =
      "connect-edit-button";

    edit.textContent =
      "✏ Edit";

    edit.addEventListener(
      "click",
      function () {
        openEditor(item);
      }
    );

    const remove =
      document.createElement("button");

    remove.type =
      "button";

    remove.className =
      "connect-remove-button";

    remove.textContent =
      "🗑 Remove Link";

    remove.addEventListener(
      "click",
      async function () {
        const confirmed =
          window.confirm(
            `Remove "${data.title || "this link"}" from the website?\n\nThis cannot be undone.`
          );

        if (!confirmed) {
          return;
        }

        try {
          await deleteDoc(
            doc(db, "siteLinks", item.id)
          );

          showToast(
            "Link removed from the website."
          );
        } catch (error) {
          console.error(error);

          showToast(
            "The link could not be removed.",
            true
          );
        }
      }
    );

    actions.append(
      edit,
      remove
    );

    card.appendChild(
      actions
    );
  }

  return card;
}


function renderLinks() {
  grid.replaceChildren();

  if (currentLinks.length === 0) {
    const empty =
      document.createElement("div");

    empty.className =
      "connect-empty";

    empty.textContent =
      currentUser
        ? "No links have been added yet. Select Add Link to add the church location or social media."
        : "The church has not published location or social media links yet.";

    grid.appendChild(
      empty
    );

    return;
  }

  currentLinks.forEach(function (item) {
    grid.appendChild(
      createCard(item)
    );
  });
}


async function loadPastorProfile(user) {
  const snapshot =
    await getDoc(
      doc(db, "staff", user.uid)
    );

  if (!snapshot.exists()) {
    return null;
  }

  const profile =
    snapshot.data();

  const role =
    normalizeRole(profile.role);

  if (
    profile.active !== true ||
    role !== "pastor"
  ) {
    return null;
  }

  return {
    ...profile,
    role
  };
}


addButton.addEventListener(
  "click",
  function () {
    openEditor();
  }
);

headingAdd.addEventListener(
  "click",
  function () {
    openEditor();
  }
);

closeButton.addEventListener(
  "click",
  closeEditor
);

cancelButton.addEventListener(
  "click",
  closeEditor
);


editor.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();

    if (!currentUser) {
      showStatus(
        "Only the approved pastor can change church links.",
        true
      );

      return;
    }

    const formData =
      new FormData(editor);

    const documentId =
      String(
        formData.get("documentId") || ""
      ).trim();

    const type =
      String(
        formData.get("type") || "other"
      ).trim();

    const title =
      String(
        formData.get("title") || ""
      ).trim();

    const enteredUrl =
      String(
        formData.get("url") || ""
      ).trim();

    const safeUrl =
      normalizeLink(
        type,
        enteredUrl
      );

    if (!safeUrl) {
      showStatus(
        "Enter a valid website link, email address, or phone number.",
        true
      );

      return;
    }

    const data = {
      type,
      title,
      url: enteredUrl,
      description:
        String(
          formData.get("description") || ""
        ).trim(),
      updatedAt:
        serverTimestamp(),
      updatedBy:
        currentUser.uid
    };

    saveButton.disabled =
      true;

    saveButton.textContent =
      documentId
        ? "Saving..."
        : "Publishing...";

    hideStatus();

    try {
      if (documentId) {
        await updateDoc(
          doc(db, "siteLinks", documentId),
          data
        );

        showToast(
          "Link updated."
        );
      } else {
        await addDoc(
          collection(db, "siteLinks"),
          {
            ...data,
            createdAt:
              serverTimestamp(),
            createdBy:
              currentUser.uid
          }
        );

        showToast(
          "Link added to the website."
        );
      }

      closeEditor();
    } catch (error) {
      console.error(error);

      showStatus(
        "The link could not be saved. Publish the updated Firestore rules and try again.",
        true
      );

      showToast(
        "The link could not be saved.",
        true
      );
    } finally {
      saveButton.disabled =
        false;
    }
  }
);


onSnapshot(
  collection(db, "siteLinks"),
  function (snapshot) {
    currentLinks =
      snapshot.docs
        .map(function (documentSnapshot) {
          return {
            id: documentSnapshot.id,
            data: documentSnapshot.data()
          };
        })
        .sort(function (a, b) {
          return (
            timestampSeconds(a.data.createdAt) -
            timestampSeconds(b.data.createdAt)
          );
        });

    renderLinks();
  },
  function (error) {
    console.error(error);

    grid.innerHTML =
      '<div class="connect-empty">Church links could not be loaded.</div>';
  }
);


onAuthStateChanged(
  auth,
  async function (user) {
    currentUser = null;
    pastorShell.hidden = true;
    headingAdd.hidden = true;
    closeEditor();

    if (!user) {
      pageHint.textContent =
        "Use the verified links below to find and follow the church.";

      renderLinks();
      return;
    }

    try {
      const profile =
        await loadPastorProfile(user);

      if (!profile) {
        renderLinks();
        return;
      }

      currentUser =
        user;

      pastorName.textContent =
        profile.name ||
        user.email ||
        "Pastor";

      pastorShell.hidden =
        false;

      headingAdd.hidden =
        false;

      pageHint.textContent =
        "Pastor editing is active. Use Edit or Remove Link directly on an item.";

      renderLinks();
    } catch (error) {
      console.error(error);
      renderLinks();
    }
  }
);
