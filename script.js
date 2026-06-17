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

    // Start the system clock updates
    startClock();
});

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
    topZIndex++;
    windowElement.style.zIndex = topZIndex;
}

// Logic dealing with manual coordinate displacement
function makeWindowDraggable(windowElement) {
    const header = windowElement.querySelector(".window-header");
    let changeInX = 0, changeInY = 0, currentMouseX = 0, currentMouseY = 0;

    if (header) {
        header.onmousedown = initiateDrag;
    }

    function initiateDrag(e) {
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
    
    setInterval(() => {
        const now = new Date();
        
        // Added 'year: numeric' to the options
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        const dateStr = now.toLocaleDateString(undefined, options);
        
        // Time formatting
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedHours = String(hours).padStart(2, "0");
        
        const timeStr = `${formattedHours}:${minutes}:${seconds} ${ampm}`;

        // Displays: Sun, Jun 14, 2026 | 09:28:32 PM
        clockElement.textContent = `${dateStr} | ${timeStr}`;
    }, 1000);
}