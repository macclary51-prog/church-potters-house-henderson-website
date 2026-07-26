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

const loginForm = document.getElementById("staffLoginForm");
const loginButton = document.getElementById("staffLoginButton");
const resetButton = document.getElementById("resetPasswordButton");
const messageBox = document.getElementById("authMessage");

function showMessage(message, isError = false) {
  if (!messageBox) {
    return;
  }

  messageBox.textContent = message;
  messageBox.classList.toggle("error", isError);
  messageBox.style.display = "block";
}

function friendlyError(error) {
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
      return "This website domain must be added to Firebase Authorized domains.";
    default:
      console.error(error);
      return "Something went wrong. Please try again.";
  }
}

async function getApprovedStaff(user) {
  const staffSnapshot = await getDoc(
    doc(db, "staff", user.uid)
  );

  if (!staffSnapshot.exists()) {
    return null;
  }

  const staff = staffSnapshot.data();

  if (
    staff.active !== true ||
    !["pastor", "ministry"].includes(staff.role)
  ) {
    return null;
  }

  return staff;
}

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document
      .getElementById("staffEmail")
      .value
      .trim();

    const password = document
      .getElementById("staffPassword")
      .value;

    loginButton.disabled = true;
    loginButton.textContent = "Signing In...";

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const staff = await getApprovedStaff(result.user);

      if (!staff) {
        await signOut(auth);
        showMessage(
          "This account is not approved for church staff access.",
          true
        );
        return;
      }

      window.location.href = "staff-dashboard.html";
    } catch (error) {
      showMessage(friendlyError(error), true);
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Staff Sign In";
    }
  });
}

if (resetButton) {
  resetButton.addEventListener("click", async function () {
    const email = document
      .getElementById("staffEmail")
      .value
      .trim();

    if (!email) {
      showMessage(
        "Enter your email address first, then select Reset Password.",
        true
      );
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showMessage("A password reset email has been sent.");
    } catch (error) {
      showMessage(friendlyError(error), true);
    }
  });
}

onAuthStateChanged(auth, async function (user) {
  if (!user) {
    return;
  }

  try {
    const staff = await getApprovedStaff(user);

    if (staff) {
      window.location.href = "staff-dashboard.html";
    }
  } catch (error) {
    console.error(error);
  }
});
