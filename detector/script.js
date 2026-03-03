// Utility to log activities
function logActivity(message, type = 'info') {
    const logContainer = document.getElementById('log-container');
    const entry = document.createElement('div');
    const time = new Date().toLocaleTimeString();
    entry.className = `log-entry ${type}`;
    entry.setAttribute('data-time', time);
    entry.textContent = message;
    logContainer.prepend(entry);
    console.log(`[${time}] ${message}`);
}

// 1. DevTools Detection (Common technique: debugger/timing)
function detectDevTools() {
    const statusDevTools = document.getElementById('status-devtools');
    const cardDevTools = document.getElementById('card-devtools');

    let devtoolsOpen = false;

    // Method 1: Debugger timing
    const startTime = performance.now();
    debugger;
    const endTime = performance.now();

    if (endTime - startTime > 100) { // If debugger pauses execution, timing will be long
        devtoolsOpen = true;
    }

    // Method 2: Element id with getter (works in some browsers)
    const devtools = /./;
    devtools.toString = function() {
        devtoolsOpen = true;
        return 'devtools';
    }
    console.log(devtools);

    if (devtoolsOpen) {
        statusDevTools.textContent = 'DETECTED';
        statusDevTools.className = 'status negative';
        logActivity('Developer Tools detected!', 'alert');
    } else {
        statusDevTools.textContent = 'Not detected';
        statusDevTools.className = 'status positive';
    }
}

// 2. Incognito/Private Mode Detection
async function detectIncognito() {
    const statusIncognito = document.getElementById('status-incognito');
    let isIncognito = false;

    // Chrome/Blink based detection (using storage estimate)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        const { quota } = await navigator.storage.estimate();
        // Chrome incognito quota is usually much smaller (e.g., < 100MB or based on RAM)
        // This is not 100% reliable but a common heuristic
        if (quota < 120000000) { // < 120MB approx
            isIncognito = true;
        }
    }

    // Safari Private Mode detection
    try {
        window.openDatabase(null, null, null, null);
    } catch (e) {
        isIncognito = true;
    }

    // Firefox Private Mode detection
    if (navigator.serviceWorker === undefined) {
        // Service workers are often disabled in private mode in older Firefox versions
        // isIncognito = true;
    }

    if (isIncognito) {
        statusIncognito.textContent = 'DETECTED';
        statusIncognito.className = 'status negative';
        logActivity('Private/Incognito mode detected!', 'alert');
    } else {
        statusIncognito.textContent = 'Normal Mode';
        statusIncognito.className = 'status positive';
    }
}

// 3. Click Monitoring
let clickCount = 0;
document.addEventListener('click', (e) => {
    clickCount++;
    const statusClicks = document.getElementById('status-clicks');
    statusClicks.textContent = `${clickCount} Clicks`;
    statusClicks.className = 'status neutral';
    logActivity(`Click at (${e.clientX}, ${e.clientY}) on ${e.target.tagName}`, 'info');
});

// 4. Context Menu Monitoring
document.addEventListener('contextmenu', (e) => {
    const statusContextMenu = document.getElementById('status-contextmenu');
    statusContextMenu.textContent = 'ATTEMPTED';
    statusContextMenu.className = 'status negative';
    logActivity('Right-click context menu attempt blocked/detected!', 'alert');
    // e.preventDefault(); // Uncomment if you want to block it
});

// 5. Keyboard Shortcuts Monitoring
document.addEventListener('keydown', (e) => {
    const statusShortcuts = document.getElementById('status-shortcuts');
    const keyCombo = [];
    if (e.ctrlKey) keyCombo.push('Ctrl');
    if (e.shiftKey) keyCombo.push('Shift');
    if (e.altKey) keyCombo.push('Alt');
    keyCombo.push(e.key);

    const comboStr = keyCombo.join('+');

    // Detect F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    const isInspection = (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
    );

    if (isInspection) {
        statusShortcuts.textContent = `DETECTED: ${comboStr}`;
        statusShortcuts.className = 'status negative';
        logActivity(`Inspection shortcut detected: ${comboStr}`, 'alert');
    } else {
        statusShortcuts.textContent = `Last key: ${comboStr}`;
        statusShortcuts.className = 'status neutral';
    }
});

// 6. Window Focus/Blur Monitoring
window.addEventListener('focus', () => {
    const statusFocus = document.getElementById('status-focus');
    statusFocus.textContent = 'Focused';
    statusFocus.className = 'status positive';
    logActivity('Window focused', 'info');
});

window.addEventListener('blur', () => {
    const statusFocus = document.getElementById('status-focus');
    statusFocus.textContent = 'Blurred (Inactive)';
    statusFocus.className = 'status negative';
    logActivity('Window blurred / focus lost', 'alert');
});

// Initial Checks
window.onload = () => {
    logActivity('Security Dashboard Started', 'system');
    detectIncognito();

    // DevTools check is tricky, run it periodically
    setInterval(detectDevTools, 2000);
    detectDevTools();
};
