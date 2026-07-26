import {
  auth,
  db
} from "./firebase-config.js";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const loginForm =
  document.getElementById("staffLoginForm");

const loginButton =
  document.getElementById("staffLoginButton");

const resetButton =
  document.getElementById("resetPasswordButton");

const messageBox =
  document.getElementById("authMessage");


function showMessage(message, isError = false) {
  if (!messageBox) {
    return;
  }

  messageBox.textContent = message;
  messageBox.classList.toggle("error", isError);
  messageBox.style.display = "block";
}


function friendlyAuthError(error) {
  switch (error.code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";

    case "auth/invalid-credential":
      return "The email address or password is incorrect.";

    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";

    case "auth/network-request-failed":
      return "Check your internet connection and try again.";

    case "auth/unauthorized-domain":
      return "Your GitHub Pages domain must be added to Firebase Authorized domains.";

    case "permission-denied":
    case "firestore/permission-denied":
      return "Firestore denied access. Check that your security rules were published.";

    default:
      console.error("Firebase error:", error);
      return (
        "Firebase error: " +
        (error.code || error.message || "Unknown error")
      );
  }
}


async function checkStaffAccount(user) {
  const staffDocumentPath =
    `/staff/${user.uid}`;

  console.log("Logged-in email:", user.email);
  console.log("Logged-in UID:", user.uid);
  console.log("Checking:", staffDocumentPath);

  const staffReference =
    doc(db, "staff", user.uid);

  const staffSnapshot =
    await getDoc(staffReference);

  if (!staffSnapshot.exists()) {
    return {
      approved: false,
      reason:
        "No staff document was found at " +
        staffDocumentPath +
        ". The UID of the account that logged in is " +
        user.uid +
        "."
    };
  }

  const staffData =
    staffSnapshot.data();

  console.log("Staff document data:", staffData);

  const role =
    typeof staffData.role === "string"
      ? staffData.role.trim().toLowerCase()
      : "";

  if (staffData.active !== true) {
    return {
      approved: false,
      reason:
        "The staff document exists, but active is not the Boolean true."
    };
  }

  if (
    role !== "pastor" &&
    role !== "ministry"
  ) {
    return {
      approved: false,
      reason:
        'The staff document exists, but the role is "' +
        String(staffData.role) +
        '". It must be pastor or ministry.'
    };
  }

  return {
    approved: true,
    staff: {
      ...staffData,
      role: role
    }
  };
}


if (loginForm) {
  loginForm.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      const email =
        document
          .getElementById("staffEmail")
          .value
          .trim();

      const password =
        document
          .getElementById("staffPassword")
          .value;

      loginButton.disabled = true;
      loginButton.textContent = "Signing In...";

      showMessage("");

      try {
        const result =
          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );

        const check =
          await checkStaffAccount(
            result.user
          );

        if (!check.approved) {
          await signOut(auth);

          showMessage(
            check.reason,
            true
          );

          return;
        }

        window.location.href =
          "staff-dashboard.html";

      } catch (error) {
        showMessage(
          friendlyAuthError(error),
          true
        );

      } finally {
        loginButton.disabled = false;
        loginButton.textContent =
          "Staff Sign In";
      }
    }
  );
}


if (resetButton) {
  resetButton.addEventListener(
    "click",
    async function () {
      const email =
        document
          .getElementById("staffEmail")
          .value
          .trim();

      if (!email) {
        showMessage(
          "Enter your email address first.",
          true
        );

        return;
      }

      try {
        await sendPasswordResetEmail(
          auth,
          email
        );

        showMessage(
          "A password reset email has been sent."
        );

      } catch (error) {
        showMessage(
          friendlyAuthError(error),
          true
        );
      }
    }
  );
}


onAuthStateChanged(
  auth,
  async function (user) {
    if (!user) {
      return;
    }

    try {
      const check =
        await checkStaffAccount(user);

      if (check.approved) {
        window.location.href =
          "staff-dashboard.html";
      }

    } catch (error) {
      console.error(
        "Automatic staff check failed:",
        error
      );
    }
  }
);
