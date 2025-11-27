// src/oneid/oneid.js

const CLIENT_ID = "1001518175730-ek890j9lnitvfeh5otoub3g353nn24gj.apps.googleusercontent.com";
const REDIRECT_URI = "http://localhost:5000/oneid-callback";

// =============================
// GLOBAL listener for popup → sandbox fix
// Makes sure Phaser (running in JS sandbox) receives the token
// =============================
window.addEventListener("message", (event) => {
  if (!event.data || !event.data.oneid_redirect) return;

  const hash = event.data.oneid_redirect.substring(1);
  const params = new URLSearchParams(hash);
  const token = params.get("access_token");

  if (!token) return;

  window.oneIdToken = token;
  window.oneIdAddress = "oneid_" + token.slice(0, 12);

  console.log("📩 OneID (global listener) received:", window.oneIdAddress);
});


// ------------------------------
// Listen for token from popup
// ------------------------------
function waitForToken(resolve, reject, popup, interval) {
  window.addEventListener("message", function handler(event) {
    if (event.data && event.data.oneid_redirect) {
      console.log("Popup message received:", event.data.oneid_redirect);
      window.removeEventListener("message", handler);

      const hash = event.data.oneid_redirect.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get("access_token");

      if (!token) {
        popup.close();
        clearInterval(interval);
        return reject("No token received");
      }

      popup.close();
      clearInterval(interval);

      window.oneIdToken = token;
      window.oneIdAddress = "oneid_" + token.slice(0, 10);

      console.log("OneID login success:", window.oneIdAddress);

      resolve({
        oneId: window.oneIdAddress,
        idToken: token,
      });
    }
  });
}

// ------------------------------
// Open Google login popup
// ------------------------------
export async function loginWithOneID() {
  return new Promise((resolve, reject) => {
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${CLIENT_ID}` +
      `&redirect_uri=${REDIRECT_URI}` +
      `&response_type=token` +
      `&scope=openid%20email%20profile`;

    const popup = window.open(
      authUrl,
      "oneidLoginWindow",
      "width=500,height=600"
    );

    if (!popup) return reject("Popup blocked");

    const interval = setInterval(() => {
      if (popup.closed) {
        clearInterval(interval);
        reject("Popup closed by user");
      }
    }, 500);

    waitForToken(resolve, reject, popup, interval);
  });
}

// ------------------------------
// Helper utilities
// ------------------------------
export function getOneID() {
  return {
    oneId: window.oneIdAddress ?? null,
    idToken: window.oneIdToken ?? null,
  };
}

export function isOneIDLogged() {
  return !!window.oneIdAddress;
}

export function clearOneID() {
  window.oneIdAddress = null;
  window.oneIdToken = null;
}

// ===============================
// Make OneID functions global for Phaser
// ===============================
window.loginWithOneID = loginWithOneID;
window.getOneID = getOneID;
window.isOneIDLogged = isOneIDLogged;
window.clearOneID = clearOneID;

