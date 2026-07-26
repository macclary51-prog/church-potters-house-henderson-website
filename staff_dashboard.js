import {
  auth,
  db,
  firebaseConfig
} from "./firebase-config.js";

import {
  initializeApp,
  deleteApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const loadingScreen = document.getElementById("dashboardLoading");
const dashboardContent = document.getElementById("dashboardContent");
const staffName = document.getElementById("staffName");
const staffRole = document.getElementById("staffRole");
const logoutButton = document.getElementById("logoutButton");
const ministryAccountsPanel = document.getElementById("ministryAccountsPanel");
const accountForm = document.getElementById("ministryAccountForm");
const accountMessage = document.getElementById("accountMessage");
const ministryAccountList = document.getElementById("ministryAccountList");

let currentUser = null;
let currentStaff = null;
const contentCache = new Map();

function showStatus(element, message, isError = false) {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.toggle("error", isError);
  element.style.display = "block";
}

function hideStatus(element) {
  if (element) {
    element.style.display = "none";
  }
}

function formatValue(value) {
  if (!value) {
    return "";
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toLocaleString();
  }

  return String(value);
}

async function loadStaffProfile(user) {
  const snapshot = await getDoc(doc(db, "staff", user.uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  if (
    data.active !== true ||
    !["pastor", "ministry"].includes(data.role)
  ) {
    return null;
  }

  return data;
}

function openTab(tabName) {
  document.querySelectorAll(".dashboard-tab").forEach(function (button) {
    button.classList.toggle(
      "active",
      button.dataset.tab === tabName
    );
  });

  document.querySelectorAll(".dashboard-panel").forEach(function (panel) {
    panel.classList.toggle(
      "active",
      panel.dataset.panel === tabName
    );
  });
}

document.querySelectorAll(".dashboard-tab").forEach(function (button) {
  button.addEventListener("click", function () {
    openTab(button.dataset.tab);
  });
});

if (logoutButton) {
  logoutButton.addEventListener("click", async function () {
    await signOut(auth);
    window.location.href = "staff-login.html";
  });
}

function getFormForCollection(collectionName) {
  return document.querySelector(
    `[data-content-form="${collectionName}"]`
  );
}

function clearEditingState(form) {
  form.reset();
  form.elements.documentId.value = "";

  const submitButton = form.querySelector('[type="submit"]');
  const cancelButton = form.querySelector("[data-cancel-edit]");

  submitButton.textContent = submitButton.dataset.defaultText;

  if (cancelButton) {
    cancelButton.hidden = true;
  }
}

document.querySelectorAll("[data-cancel-edit]").forEach(function (button) {
  button.addEventListener("click", function () {
    clearEditingState(button.closest("form"));
  });
});

document.querySelectorAll("[data-content-form]").forEach(function (form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const collectionName = form.dataset.contentForm;
    const status = form.querySelector(".status-message");
    const submitButton = form.querySelector('[type="submit"]');
    const formData = new FormData(form);
    const documentId = String(formData.get("documentId") || "").trim();

    const data = {};

    for (const [key, value] of formData.entries()) {
      if (key === "documentId") {
        continue;
      }

      data[key] = String(value).trim();
    }

    submitButton.disabled = true;
    hideStatus(status);

    try {
      if (documentId) {
        await updateDoc(
          doc(db, collectionName, documentId),
          {
            ...data,
            updatedAt: serverTimestamp(),
            updatedBy: currentUser.uid
          }
        );

        showStatus(status, "Changes saved.");
      } else {
        await addDoc(
          collection(db, collectionName),
          {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: currentUser.uid
          }
        );

        showStatus(status, "Published successfully.");
      }

      clearEditingState(form);
    } catch (error) {
      console.error(error);
      showStatus(
        status,
        "Could not save this item. Check your Firestore rules.",
        true
      );
    } finally {
      submitButton.disabled = false;
    }
  });
});

function startEditing(collectionName, documentId, data) {
  const form = getFormForCollection(collectionName);

  if (!form) {
    return;
  }

  form.elements.documentId.value = documentId;

  Object.entries(data).forEach(function ([key, value]) {
    if (form.elements[key]) {
      form.elements[key].value = formatValue(value);
    }
  });

  const submitButton = form.querySelector('[type="submit"]');
  const cancelButton = form.querySelector("[data-cancel-edit]");

  submitButton.textContent = "Save Changes";

  if (cancelButton) {
    cancelButton.hidden = false;
  }

  form.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

async function removeContent(collectionName, documentId, title) {
  const confirmed = window.confirm(
    `Remove "${title || "this item"}" from the website?`
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteDoc(doc(db, collectionName, documentId));
  } catch (error) {
    console.error(error);
    window.alert(
      "The item could not be removed. Check your Firestore rules."
    );
  }
}

function renderManageList(collectionName, snapshot) {
  const container = document.querySelector(
    `[data-manage-list="${collectionName}"]`
  );

  if (!container) {
    return;
  }

  container.replaceChildren();

  if (snapshot.empty) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No items have been published yet.";
    container.appendChild(empty);
    return;
  }

  const documents = snapshot.docs
    .map(function (documentSnapshot) {
      return {
        id: documentSnapshot.id,
        data: documentSnapshot.data()
      };
    })
    .sort(function (a, b) {
      const aTime = a.data.createdAt?.seconds || 0;
      const bTime = b.data.createdAt?.seconds || 0;
      return bTime - aTime;
    });

  documents.forEach(function (item) {
    contentCache.set(
      `${collectionName}:${item.id}`,
      item.data
    );

    const card = document.createElement("article");
    card.className = "manage-item";

    const head = document.createElement("div");
    head.className = "manage-item-head";

    const title = document.createElement("h3");
    title.textContent = item.data.title || "Untitled";

    const badge = document.createElement("span");
    badge.className = "role-badge";
    badge.textContent = collectionName.replace(/s$/, "");

    head.append(title, badge);

    const details = document.createElement("p");
    details.textContent =
      item.data.details ||
      item.data.description ||
      "No description provided.";

    const actions = document.createElement("div");
    actions.className = "manage-actions";

    const editButton = document.createElement("button");
    editButton.className = "button button-light button-small";
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", function () {
      startEditing(
        collectionName,
        item.id,
        item.data
      );
    });

    const removeButton = document.createElement("button");
    removeButton.className = "button button-danger button-small";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
      removeContent(
        collectionName,
        item.id,
        item.data.title
      );
    });

    actions.append(editButton, removeButton);
    card.append(head, details, actions);
    container.appendChild(card);
  });
}

function subscribeToContent() {
  [
    "announcements",
    "events",
    "sermons",
    "ministries"
  ].forEach(function (collectionName) {
    onSnapshot(
      collection(db, collectionName),
      function (snapshot) {
        renderManageList(collectionName, snapshot);
      },
      function (error) {
        console.error(error);
      }
    );
  });
}

function renderMinistryAccounts(snapshot) {
  if (!ministryAccountList) {
    return;
  }

  ministryAccountList.replaceChildren();

  const accounts = snapshot.docs
    .filter(function (documentSnapshot) {
      return documentSnapshot.data().role === "ministry";
    })
    .map(function (documentSnapshot) {
      return {
        id: documentSnapshot.id,
        data: documentSnapshot.data()
      };
    })
    .sort(function (a, b) {
      return String(a.data.name || "").localeCompare(
        String(b.data.name || "")
      );
    });

  if (accounts.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No ministry accounts have been added yet.";
    ministryAccountList.appendChild(empty);
    return;
  }

  accounts.forEach(function (account) {
    const card = document.createElement("article");
    card.className = "manage-item";

    const head = document.createElement("div");
    head.className = "manage-item-head";

    const left = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = account.data.name || "Ministry Member";

    const email = document.createElement("p");
    email.textContent = account.data.email || "";

    left.append(title, email);

    const badge = document.createElement("span");
    badge.className = account.data.active
      ? "role-badge"
      : "role-badge inactive";
    badge.textContent = account.data.active
      ? "Active"
      : "Access Removed";

    head.append(left, badge);

    const actions = document.createElement("div");
    actions.className = "manage-actions";

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = account.data.active
      ? "button button-danger button-small"
      : "button button-primary button-small";
    toggleButton.textContent = account.data.active
      ? "Remove Access"
      : "Restore Access";

    toggleButton.addEventListener("click", async function () {
      const nextActive = !account.data.active;
      const action = nextActive ? "restore" : "remove";

      if (
        !window.confirm(
          `${action === "remove" ? "Remove" : "Restore"} access for ${account.data.name || account.data.email}?`
        )
      ) {
        return;
      }

      try {
        await updateDoc(
          doc(db, "staff", account.id),
          {
            active: nextActive,
            updatedAt: serverTimestamp(),
            updatedBy: currentUser.uid
          }
        );
      } catch (error) {
        console.error(error);
        window.alert("The account could not be updated.");
      }
    });

    actions.appendChild(toggleButton);
    card.append(head, actions);
    ministryAccountList.appendChild(card);
  });
}

function subscribeToMinistryAccounts() {
  onSnapshot(
    collection(db, "staff"),
    renderMinistryAccounts,
    function (error) {
      console.error(error);
      showStatus(
        accountMessage,
        "Could not load ministry accounts.",
        true
      );
    }
  );
}

if (accountForm) {
  accountForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (currentStaff?.role !== "pastor") {
      showStatus(
        accountMessage,
        "Only the pastor can add ministry accounts.",
        true
      );
      return;
    }

    const name = document
      .getElementById("ministryName")
      .value
      .trim();

    const email = document
      .getElementById("ministryEmail")
      .value
      .trim();

    const password = document
      .getElementById("ministryPassword")
      .value;

    const submitButton = accountForm.querySelector('[type="submit"]');
    let secondaryApp = null;
    let createdUser = null;

    submitButton.disabled = true;
    submitButton.textContent = "Creating Account...";
    hideStatus(accountMessage);

    try {
      secondaryApp = initializeApp(
        firebaseConfig,
        `ministry-account-${Date.now()}`
      );

      const secondaryAuth = getAuth(secondaryApp);

      const credential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );

      createdUser = credential.user;

      await setDoc(
        doc(db, "staff", createdUser.uid),
        {
          name,
          email,
          role: "ministry",
          active: true,
          createdAt: serverTimestamp(),
          createdBy: currentUser.uid
        }
      );

      await signOut(secondaryAuth);

      accountForm.reset();

      showStatus(
        accountMessage,
        "Ministry account created. Give the person their email and temporary password."
      );
    } catch (error) {
      console.error(error);

      if (createdUser) {
        try {
          await deleteUser(createdUser);
        } catch (cleanupError) {
          console.error(cleanupError);
        }
      }

      let message = "The ministry account could not be created.";

      if (error.code === "auth/email-already-in-use") {
        message = "An account already exists with that email address.";
      } else if (error.code === "auth/weak-password") {
        message = "The temporary password must contain at least 6 characters.";
      } else if (error.code === "auth/invalid-email") {
        message = "Enter a valid email address.";
      }

      showStatus(accountMessage, message, true);
    } finally {
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch (error) {
          console.error(error);
        }
      }

      submitButton.disabled = false;
      submitButton.textContent = "Create Ministry Account";
    }
  });
}

onAuthStateChanged(auth, async function (user) {
  if (!user) {
    window.location.href = "staff-login.html";
    return;
  }

  try {
    const profile = await loadStaffProfile(user);

    if (!profile) {
      await signOut(auth);
      window.location.href = "staff-login.html?error=access";
      return;
    }

    currentUser = user;
    currentStaff = profile;

    staffName.textContent = profile.name || user.email;
    staffRole.textContent =
      profile.role === "pastor"
        ? "Pastor"
        : "Ministry";

    if (profile.role === "pastor") {
      ministryAccountsPanel.hidden = false;
      subscribeToMinistryAccounts();
    } else {
      ministryAccountsPanel.hidden = true;

      document
        .querySelector('[data-tab="accounts"]')
        ?.remove();
    }

    subscribeToContent();

    loadingScreen.hidden = true;
    dashboardContent.hidden = false;
  } catch (error) {
    console.error(error);
    await signOut(auth);
    window.location.href = "staff-login.html?error=access";
  }
});
