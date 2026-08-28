// TamCalc Main Application Script
const tamilNumbers = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];

let currentExpression = "";
let soundEnabled = false;

// DOM Elements
const ioDisplay = document.getElementById("io-display");
const tamDisplay = document.getElementById("tam-dis");
const expressionLine = document.getElementById("expression-line");
const themePickerBar = document.getElementById("theme-picker-bar");
const toastMsg = document.getElementById("toast-msg");
const soundToggleBtn = document.getElementById("sound-toggle-btn");

// Initial Setup
document.addEventListener("DOMContentLoaded", () => {
    // Restore theme from localStorage or default to classic old buttons
    const savedTheme = localStorage.getItem("tamcalc_theme") || "classic";
    setTheme(savedTheme);

    const savedCustomColor = localStorage.getItem("tamcalc_custom_color");
    if (savedCustomColor) {
        applyCustomColor(savedCustomColor);
        document.getElementById("custom-color-picker").value = savedCustomColor;
    }

    // Keyboard support
    document.addEventListener("keydown", handleKeyPress);
});

// Sound / Audio Feedback
let audioCtx = null;
function playTapFeedback() {
    // Haptic vibration
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }

    // Web Audio tick sound if enabled
    if (soundEnabled) {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === "suspended") audioCtx.resume();
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.04);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.04);
        } catch (e) {
            console.warn("Audio feedback error", e);
        }
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundToggleBtn) {
        soundToggleBtn.innerHTML = soundEnabled ? '<i class="bi bi-volume-up-fill"></i>' : '<i class="bi bi-volume-mute-fill"></i>';
    }
    showToast(soundEnabled ? "ஒலி ஆன் (Sound On)" : "ஒலி ஆஃப் (Sound Off)");
}

// Keypad Operations
function display(num) {
    playTapFeedback();
    
    // Prevent duplicate decimals in single number segment
    if (num === '.') {
        const lastNumSegment = currentExpression.split(/[\+\-\*\/\%]/).pop();
        if (lastNumSegment.includes('.')) return;
    }

    currentExpression += num;
    updateDisplays();
}

function clr() {
    playTapFeedback();
    currentExpression = "";
    if (expressionLine) expressionLine.innerText = "";
    updateDisplays();
}

function del() {
    playTapFeedback();
    currentExpression = currentExpression.slice(0, -1);
    updateDisplays();
}

function updateDisplays() {
    if (ioDisplay) ioDisplay.value = currentExpression || "0";
    if (tamDisplay) tamDisplay.value = convertToTamilNumber(currentExpression) || "௦";
}

function calculate() {
    playTapFeedback();
    if (!currentExpression) return;

    try {
        // Sanitize & Evaluate safely
        let evalExpr = currentExpression.replace(/×/g, "*").replace(/÷/g, "/");
        
        // Evaluate mathematical expression using Function instead of direct eval
        let result = Function(`"use strict"; return (${evalExpr})`)();

        // Round decimal places to avoid float precision issues
        if (typeof result === "number") {
            if (!Number.isInteger(result)) {
                result = parseFloat(result.toFixed(8));
            }
        }

        if (expressionLine) {
            expressionLine.innerText = `${currentExpression} = ${result}`;
        }

        currentExpression = result.toString();
        updateDisplays();
    } catch (err) {
        if (tamDisplay) tamDisplay.value = "பிழை (Error)";
        showToast("தவறான கணிப்பு! (Invalid Expression)");
    }
}

// Tamil Transliteration Converter
function convertToTamilNumber(str) {
    if (!str && str !== 0) return "";
    return str.toString().split("").map(char => {
        if (char >= '0' && char <= '9') {
            return tamilNumbers[parseInt(char)];
        }
        // Retain operators and decimal points
        if (char === '*') return '×';
        if (char === '/') return '÷';
        return char;
    }).join("");
}

// Keyboard Event Handler
function handleKeyPress(e) {
    if (e.target.tagName === 'INPUT' && e.target.type === 'color') return;
    
    const key = e.key;

    if (key >= '0' && key <= '9') {
        display(key);
        highlightButton(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '%') {
        display(key);
        highlightButton(key);
    } else if (key === '.') {
        display('.');
        highlightButton('.');
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
        highlightButton('=');
    } else if (key === 'Backspace') {
        del();
        highlightButton('del');
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clr();
        highlightButton('clr');
    }
}

function highlightButton(key) {
    let btn = document.querySelector(`[data-key="${key}"]`);
    if (btn) {
        btn.classList.add("active-touch");
        setTimeout(() => btn.classList.remove("active-touch"), 150);
    }
}

// Theme & Color Management
function toggleThemePicker() {
    if (themePickerBar) {
        themePickerBar.classList.toggle("show");
    }
}

function setTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
    localStorage.setItem("tamcalc_theme", themeName);

    // Update active theme chip indicator
    document.querySelectorAll(".theme-chip").forEach(chip => {
        if (chip.getAttribute("data-t") === themeName) {
            chip.classList.add("active");
        } else {
            chip.classList.remove("active");
        }
    });
}

function setCustomColor(colorHex) {
    localStorage.setItem("tamcalc_custom_color", colorHex);
    applyCustomColor(colorHex);
    document.documentElement.setAttribute("data-theme", "custom");
    
    document.querySelectorAll(".theme-chip").forEach(chip => chip.classList.remove("active"));
}

function applyCustomColor(colorHex) {
    document.documentElement.style.setProperty("--btn-num-bg", colorHex);
    // Dark text if color is bright, white if dark
    const rgb = hexToRgb(colorHex);
    if (rgb) {
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        document.documentElement.style.setProperty("--btn-num-color", brightness > 128 ? "#1e293b" : "#ffffff");
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Copy Tamil result to clipboard
function copyTamilResult() {
    const valueToCopy = tamDisplay ? tamDisplay.value : "";
    if (!valueToCopy) return;

    navigator.clipboard.writeText(valueToCopy).then(() => {
        showToast("தமிழ் விடை நகலெடுக்கப்பட்டது! (Copied)");
    }).catch(() => {
        showToast("நகலெடுக்க முடியவில்லை! (Copy failed)");
    });
}

// Toast notification
function showToast(message) {
    if (!toastMsg) return;
    toastMsg.innerText = message;
    toastMsg.classList.add("show");
    setTimeout(() => {
        toastMsg.classList.remove("show");
    }, 2000);
}