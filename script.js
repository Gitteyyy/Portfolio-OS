// Window layering tracker
let topZIndex = 10;
// Set to track open application IDs for the taskbar
const openApps = new Set();

// Initialize DOM Events
document.addEventListener("DOMContentLoaded", () => {
  const windows = document.querySelectorAll(".window");
  windows.forEach((win) => {
    makeWindowDraggable(win);

    win.addEventListener("mousedown", () => {
      bringToFront(win);
    });
  });

  // Close Start Menu on outside click
  document.addEventListener("click", (e) => {
    const menu = document.getElementById("start-menu");
    const startBtn = document.getElementById("start-btn");
    if (
      menu.style.display === "flex" &&
      !menu.contains(e.target) &&
      !startBtn.contains(e.target)
    ) {
      menu.style.display = "none";
    }
  });

  setupLogonAuthentication();
  startClock();
});

// CMD Authentication Engine
function setupLogonAuthentication() {
  const userInp = document.getElementById("login-username");
  const passInp = document.getElementById("login-password");
  const passLine = document.getElementById("cmd-pass-line");
  const errBanner = document.getElementById("login-error");
  const logonScreen = document.getElementById("logon-screen");

  if (!userInp || !passInp) return;

  userInp.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (userInp.value.trim() === "admin") {
        if (errBanner) errBanner.style.display = "none";
        if (passLine) passLine.style.display = "flex";
        passInp.focus();
      } else {
        showAuthError();
      }
    }
  });

  passInp.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (passInp.value === "admin") {
        if (logonScreen) {
          logonScreen.style.animation = "windowClose 0.25s ease-out forwards";
          setTimeout(() => {
            logonScreen.style.display = "none";
            document.body.classList.remove("auth-mode");
          }, 250);
        }
      } else {
        showAuthError();
      }
    }
  });

  function showAuthError() {
    if (errBanner) errBanner.style.display = "block";
    userInp.value = "";
    passInp.value = "";
    if (passLine) passLine.style.display = "none";
    userInp.focus();
  }
}

// System Logout Manager
function triggerLogout() {
  const logonScreen = document.getElementById("logon-screen");
  const userInp = document.getElementById("login-username");
  const passInp = document.getElementById("login-password");
  const passLine = document.getElementById("cmd-pass-line");
  const menu = document.getElementById("start-menu");

  if (menu) menu.style.display = "none";

  if (userInp) userInp.value = "";
  if (passInp) passInp.value = "";
  if (passLine) passLine.style.display = "none";

  if (logonScreen) {
    logonScreen.style.top = "";
    logonScreen.style.left = "";
    document.body.classList.add("auth-mode");
    logonScreen.style.animation = "none";
    logonScreen.style.display = "flex";
  }

  openApps.clear();
  updateTaskbar();

  if (userInp) userInp.focus();
}

// Start Menu Controls
function toggleStartMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById("start-menu");
  if (!menu) return;

  if (menu.style.display === "none" || menu.style.display === "") {
    menu.style.display = "flex";
  } else {
    menu.style.display = "none";
  }
}

function handleMenuAppClick(id) {
  const menu = document.getElementById("start-menu");
  if (menu) menu.style.display = "none";
  openWindow(id);
}

// Taskbar Tracking & Synchronizer System
function updateTaskbar() {
  const activeAppsContainer = document.getElementById("active-apps");
  if (!activeAppsContainer) return;
  activeAppsContainer.innerHTML = "";

  openApps.forEach((id) => {
    const win = document.getElementById(id);
    if (!win) return;

    const fullTitle = win.querySelector(".window-title")?.textContent || "App";
    const cleanTitle = fullTitle.replace(/[\n\r]+/g, "").trim();

    const appBtn = document.createElement("button");
    appBtn.className = "taskbar-app-btn";

    if (!win.classList.contains("minimized") && win.style.display !== "none") {
      if (parseInt(win.style.zIndex) === topZIndex) {
        appBtn.classList.add("active");
      }
    }

    appBtn.textContent = cleanTitle;

    appBtn.onclick = () => {
      if (win.classList.contains("minimized")) {
        restoreWindow(id);
      } else if (parseInt(win.style.zIndex) === topZIndex) {
        minimizeWindow(id);
      } else {
        bringToFront(win);
        updateTaskbar();
      }
    };

    activeAppsContainer.appendChild(appBtn);
  });
}

// Window Visibility Controllers
function openWindow(id) {
  const win = document.getElementById(id);
  if (win) {
    win.classList.remove("close-animation", "minimized");
    win.style.display = "flex";
    win.classList.add("open-animation");
    bringToFront(win);

    openApps.add(id);
    updateTaskbar();
  }
}

// Minimize a window view safely
function minimizeWindow(id) {
  const win = document.getElementById(id);
  if (win) {
    win.classList.add("minimized");
    updateTaskbar();
  }
}

// Restore a minimized window from taskbar interaction
function restoreWindow(id) {
  const win = document.getElementById(id);
  if (win) {
    win.classList.remove("minimized");
    bringToFront(win);
    updateTaskbar();
  }
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (win) {
    win.classList.remove("open-animation");
    win.classList.add("close-animation");
    setTimeout(() => {
      win.style.display = "none";
      win.classList.remove("close-animation");
      openApps.delete(id);
      updateTaskbar();
    }, 200);
  }
}

// Window Depth Stack Manager
function bringToFront(windowElement) {
  if (!windowElement) return;
  topZIndex++;
  windowElement.style.zIndex = topZIndex;

  if (windowElement.id && openApps.has(windowElement.id)) {
    updateTaskbar();
  }
}

// Drag & Drop Window Core Engine
function makeWindowDraggable(windowElement) {
  if (!windowElement) return;
  const header =
    windowElement.querySelector(".window-header") ||
    windowElement.querySelector(".cmd-header");
  let changeInX = 0,
    changeInY = 0,
    currentMouseX = 0,
    currentMouseY = 0;

  if (header) {
    header.onmousedown = initiateDrag;
  }

  function initiateDrag(e) {
    if (
      e.target.closest(".window-controls") ||
      e.target.closest("input") ||
      e.target.closest(".cmd-row")
    )
      return;
    e.preventDefault();
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
    document.onmouseup = terminateDrag;
    document.onmousemove = executeElementShift;
  }

  function executeElementShift(e) {
    e.preventDefault();
    changeInX = currentMouseX - e.clientX;
    changeInY = currentMouseY - e.clientY;
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
    windowElement.style.top = windowElement.offsetTop - changeInY + "px";
    windowElement.style.left = windowElement.offsetLeft - changeInX + "px";
  }

  function terminateDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Live Digital Clock Engine
function startClock() {
  const clockElement = document.getElementById("system-clock");
  if (!clockElement) return;

  setInterval(() => {
    const now = new Date();
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const dateStr = now.toLocaleDateString(undefined, options);

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, "0");

    const timeStr = `${formattedHours}:${minutes}:${seconds} ${ampm}`;
    clockElement.textContent = `${dateStr} | ${timeStr}`;
  }, 1000);
}

// Logon Window Drag Binding
const consoleLogonWindow = document.getElementById("logon-screen");
if (consoleLogonWindow) {
  makeWindowDraggable(consoleLogonWindow);
  consoleLogonWindow.addEventListener("mousedown", () => {
    bringToFront(consoleLogonWindow);
  });
}
