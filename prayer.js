import {
  auth,
  db
} from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const requestForm =
  document.getElementById("prayerRequestForm");

const submitButton =
  document.getElementById("prayerSubmitButton");

const formStatus =
  document.getElementById("prayerFormStatus");

const staffShell =
  document.getElementById("prayerStaffShell");

const staffName =
  document.getElementById("prayerStaffName");

const staffRole =
  document.getElementById("prayerStaffRole");

const staffInitials =
  document.getElementById("prayerStaffInitials");

const signOutButton =
  document.getElementById("prayerSignOutButton");


const requestList =
  document.getElementById("prayerRequestList");

const countLabel =
  document.getElementById("prayerCount");

const toast =
  document.getElementById("prayerToast");

let currentUser = null;
let currentStaff = null;
let currentRequests = [];
let requestUnsubscribe = null;
let toastTimer = null;


function cleanText(value) {
  return String(value || "").trim();
}


function normalizeRole(role) {
  return cleanText(role).toLowerCase();
}


function getInitials(name) {
  const parts =
    cleanText(name)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

  if (parts.length === 0) {
    return "SM";
  }

  return parts
    .map(function (part) {
      return part.charAt(0).toUpperCase();
    })
    .join("");
}


function showFormStatus(message, isError = false) {
  formStatus.textContent = message;
  formStatus.classList.toggle("error", isError);
  formStatus.style.display = "block";
}


function hideFormStatus() {
  formStatus.textContent = "";
  formStatus.classList.remove("error");
  formStatus.style.display = "none";
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


function formatDate(timestamp) {
  if (
    !timestamp ||
    typeof timestamp.toDate !== "function"
  ) {
    return "Just submitted";
  }

  return timestamp
    .toDate()
    .toLocaleString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }
    );
}


function statusLabel(status) {
  if (status === "praying") {
    return "Praying";
  }

  if (status === "completed") {
    return "Completed";
  }

  return "New";
}


function createBadge(text, className) {
  const badge =
    document.createElement("span");

  badge.className =
    `prayer-badge ${className}`;

  badge.textContent =
    text;

  return badge;
}


function createActionButton({
  text,
  className,
  onClick
}) {
  const button =
    document.createElement("button");

  button.type =
    "button";

  button.className =
    className;

  button.textContent =
    text;

  button.addEventListener(
    "click",
    async function () {
      button.disabled = true;

      try {
        await onClick();
      } finally {
        button.disabled = false;
      }
    }
  );

  return button;
}


function createRequestCard(item) {
  const data =
    item.data;

  const card =
    document.createElement("article");

  card.className =
    "prayer-request-card";

  const head =
    document.createElement("div");

  head.className =
    "prayer-request-head";

  const person =
    document.createElement("div");

  person.className =
    "prayer-request-person";

  const name =
    document.createElement("strong");

  name.textContent =
    cleanText(data.name) ||
    "Anonymous";

  const date =
    document.createElement("small");

  date.textContent =
    formatDate(data.createdAt);

  person.append(
    name,
    date
  );

  const badges =
    document.createElement("div");

  badges.className =
    "prayer-request-badges";

  if (data.confidential === true) {
    badges.appendChild(
      createBadge(
        "Confidential",
        "confidential"
      )
    );
  }

  head.append(
    person,
    badges
  );

  const prayerText =
    document.createElement("p");

  prayerText.className =
    "prayer-request-text";

  prayerText.textContent =
    cleanText(data.prayerText);

  card.append(
    head,
    prayerText
  );

  const contact =
    cleanText(data.contact);

  if (contact) {
    const contactBox =
      document.createElement("div");

    contactBox.className =
      "prayer-contact";

    const contactLabel =
      document.createElement("strong");

    contactLabel.textContent =
      "Contact:";

    const contactText =
      document.createElement("span");

    contactText.textContent =
      contact;

    contactBox.append(
      contactLabel,
      contactText
    );

    card.appendChild(
      contactBox
    );
  }

  return card;
}


function renderRequests() {
  requestList.replaceChildren();

  countLabel.textContent =
    `${currentRequests.length} ${
      currentRequests.length === 1
        ? "request"
        : "requests"
    }`;

  if (currentRequests.length === 0) {
    const empty =
      document.createElement("div");

    empty.className =
      "prayer-empty";

    empty.textContent =
      "No prayer requests have been submitted yet.";

    requestList.appendChild(
      empty
    );

    return;
  }

  currentRequests.forEach(function (item) {
    requestList.appendChild(
      createRequestCard(item)
    );
  });
}


function subscribeToRequests() {
  if (requestUnsubscribe) {
    requestUnsubscribe();
  }

  requestUnsubscribe =
    onSnapshot(
      query(
        collection(db, "prayerRequests"),
        orderBy("createdAt", "desc")
      ),
      function (snapshot) {
        currentRequests =
          snapshot.docs.map(
            function (documentSnapshot) {
              return {
                id: documentSnapshot.id,
                data: documentSnapshot.data()
              };
            }
          );

        renderRequests();
      },
      function (error) {
        console.error(error);

        requestList.innerHTML =
          '<div class="prayer-empty">Prayer requests could not be loaded. Check the Firestore rules.</div>';
      }
    );
}


async function loadStaffProfile(user) {
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
    !["pastor", "ministry"].includes(role)
  ) {
    return null;
  }

  return {
    ...profile,
    role
  };
}


function enableStaffInbox(user, profile) {
  currentUser =
    user;

  currentStaff =
    profile;

  const displayName =
    profile.name ||
    user.email ||
    "Staff Member";

  staffName.textContent =
    displayName;

  staffRole.textContent =
    profile.role === "pastor"
      ? "Pastor"
      : "Ministry";

  staffInitials.textContent =
    getInitials(displayName);

  staffShell.hidden =
    false;

  subscribeToRequests();
}


function disableStaffInbox() {
  currentUser =
    null;

  currentStaff =
    null;

  staffShell.hidden =
    true;

  currentRequests =
    [];

  if (requestUnsubscribe) {
    requestUnsubscribe();
    requestUnsubscribe = null;
  }
}


requestForm.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();
    hideFormStatus();

    const name =
      cleanText(
        requestForm.elements.name.value
      );

    const contact =
      cleanText(
        requestForm.elements.contact.value
      );

    const prayerText =
      cleanText(
        requestForm.elements.prayerText.value
      );

    const confidential =
      requestForm.elements.confidential.checked;

    const honeypot =
      cleanText(
        requestForm.elements.website.value
      );

    /*
      Silently accept likely automated spam without writing it.
    */
    if (honeypot) {
      requestForm.reset();

      showFormStatus(
        "Your prayer request was submitted."
      );

      return;
    }

    if (
      prayerText.length < 5 ||
      prayerText.length > 3000
    ) {
      showFormStatus(
        "Enter a prayer request between 5 and 3,000 characters.",
        true
      );

      requestForm.elements.prayerText.focus();
      return;
    }

    const lastSubmission =
      Number(
        localStorage.getItem(
          "lastPrayerRequestSubmission"
        ) || 0
      );

    if (
      Date.now() - lastSubmission <
      30000
    ) {
      showFormStatus(
        "Please wait a moment before submitting another request.",
        true
      );

      return;
    }

    submitButton.disabled =
      true;

    submitButton.textContent =
      "Submitting...";

    try {
      await addDoc(
        collection(db, "prayerRequests"),
        {
          name,
          contact,
          prayerText,
          confidential,
          status: "new",
          source: "website",
          createdAt:
            serverTimestamp()
        }
      );

      localStorage.setItem(
        "lastPrayerRequestSubmission",
        String(Date.now())
      );

      requestForm.reset();

      showFormStatus(
        "Your prayer request was submitted successfully."
      );
    } catch (error) {
      console.error(error);

      let message =
        "The prayer request could not be submitted.";

      if (
        error.code === "permission-denied" ||
        error.code === "firestore/permission-denied"
      ) {
        message =
          "Firebase blocked the prayer request. Publish the updated Firestore rules.";
      } else if (
        error.code === "unavailable" ||
        error.code === "firestore/unavailable"
      ) {
        message =
          "Firebase is temporarily unavailable. Check the connection and try again.";
      } else if (error.code) {
        message =
          `The prayer request could not be submitted (${error.code}).`;
      }

      showFormStatus(
        message,
        true
      );
    } finally {
      submitButton.disabled =
        false;

      submitButton.textContent =
        "Submit Prayer Request";
    }
  }
);



signOutButton.addEventListener(
  "click",
  async function () {
    signOutButton.disabled =
      true;

    try {
      await signOut(auth);

      window.location.href =
        "index.html";
    } catch (error) {
      console.error(error);

      showToast(
        "Could not sign out. Please try again.",
        true
      );

      signOutButton.disabled =
        false;
    }
  }
);


onAuthStateChanged(
  auth,
  async function (user) {
    disableStaffInbox();

    if (!user) {
      return;
    }

    try {
      const profile =
        await loadStaffProfile(user);

      if (!profile) {
        return;
      }

      enableStaffInbox(
        user,
        profile
      );
    } catch (error) {
      console.error(error);
    }
  }
);
