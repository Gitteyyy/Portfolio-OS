// Global tracking for Window layering (Z-Index manipulation)
let topZIndex = 10;

// Initialize DOM loads completely
document.addEventListener("DOMContentLoaded", () => {
    // Make all windows draggable
    const windows = document.querySelectorAll(".window");
    windows.forEach(win => {
        makeWindowDraggable(win);
        
        // Bring window to front when clicked anywhere on it
        win.addEventListener("mousedown", () => {
            bringToFront(win);
        });
    });

    // Close Start Menu if clicking outside
    document.addEventListener("click", (e) => {
        const menu = document.getElementById("start-menu");
        const startBtn = document.getElementById("start-btn");
        if (menu.style.display === "flex" && !menu.contains(e.target) && !startBtn.contains(e.target)) {
            menu.style.display = "none";
        }
    });

    // Setup CMD Authentication Routines
    setupLogonAuthentication();

    // Start the system clock updates
    startClock();
});

// CMD Sign-in Engine
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
                        // Cleanly show desktop & taskbar layout environments upon success
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

// Global System Logout Sequence
function triggerLogout() {
    const logonScreen = document.getElementById("logon-screen");
    const userInp = document.getElementById("login-username");
    const passInp = document.getElementById("login-password");
    const passLine = document.getElementById("cmd-pass-line");
    const menu = document.getElementById("start-menu");

    // Close Start Menu
    if (menu) menu.style.display = "none";

    // Reset fields
    if (userInp) userInp.value = "";
    if (passInp) passInp.value = "";
    if (passLine) passLine.style.display = "none";

    /* FIX: Purges manual coordinates from previous drag movements 
       so it centers perfectly using the default stylesheet rules */
    if (logonScreen) {
        logonScreen.style.top = "";
        logonScreen.style.left = "";
        
        // Re-engage screen lockout states immediately
        document.body.classList.add("auth-mode");

        // Show authentication screen
        logonScreen.style.animation = "none";
        logonScreen.style.display = "flex";
    }
    
    if (userInp) userInp.focus();
}

// Toggle Windows 7 styled Start Menu
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

// App selection handler from start menu
function handleMenuAppClick(id) {
    const menu = document.getElementById("start-menu");
    if (menu) menu.style.display = "none";
    openWindow(id);
}

// Open a specific window target by ID with animation
function openWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.classList.remove("close-animation");
        win.style.display = "flex";
        win.classList.add("open-animation");
        bringToFront(win);
    }
}

// Hide&Close a specific window target by ID with animation
function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.classList.remove("open-animation");
        win.classList.add("close-animation");
        setTimeout(() => {
            win.style.display = "none";
            win.classList.remove("close-animation");
        }, 200);
    }
}

// Elevate window stack depth hierarchy
function bringToFront(windowElement) {
    if (!windowElement) return;
    topZIndex++;
    windowElement.style.zIndex = topZIndex;
}

// Logic dealing with manual coordinate displacement
function makeWindowDraggable(windowElement) {
    if (!windowElement) return;
    const header = windowElement.querySelector(".window-header") || windowElement.querySelector(".cmd-header");
    let changeInX = 0, changeInY = 0, currentMouseX = 0, currentMouseY = 0;

    if (header) {
        header.onmousedown = initiateDrag;
    }

    function initiateDrag(e) {
        // Essential Fix: Keeps input text selection functional and avoids drag locks inside forms
        if (e.target.closest(".window-controls") || e.target.closest("input") || e.target.closest(".cmd-row")) return;
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
        windowElement.style.top = (windowElement.offsetTop - changeInY) + "px";
        windowElement.style.left = (windowElement.offsetLeft - changeInX) + "px";
    }

    function terminateDrag() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Real-time taskbar digital clock, date, and year routine
function startClock() {
    const clockElement = document.getElementById("system-clock");
    if (!clockElement) return;

    setInterval(() => {
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
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

// Target the logon interface container component node reference element directly
const consoleLogonWindow = document.getElementById('logon-screen');
if (consoleLogonWindow) {
    makeWindowDraggable(consoleLogonWindow);
    consoleLogonWindow.addEventListener('mousedown', () => {
        bringToFront(consoleLogonWindow);
    });
}