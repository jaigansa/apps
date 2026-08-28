// TamCalc Main Application Script
const tamilNumbers = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];

let currentExpression = "";

// DOM Elements
const ioDisplay = document.getElementById("io-display");
const tamDisplay = document.getElementById("tam-dis");
const expressionLine = document.getElementById("expression-line");
const toastMsg = document.getElementById("toast-msg");

// Initial Setup
document.addEventListener("DOMContentLoaded", () => {
    // Keyboard support
    document.addEventListener("keydown", handleKeyPress);
});

// Keypad Operations
function display(num) {
    // Prevent duplicate decimals in single number segment
    if (num === '.') {
        const lastNumSegment = currentExpression.split(/[\+\-\*\/\%]/).pop();
        if (lastNumSegment.includes('.')) return;
    }

    currentExpression += num;
    updateDisplays();
}

function clr() {
    currentExpression = "";
    if (expressionLine) expressionLine.innerText = "";
    updateDisplays();
}

function del() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplays();
}

function updateDisplays() {
    if (ioDisplay) ioDisplay.value = currentExpression || "0";
    if (tamDisplay) tamDisplay.value = convertToTamilNumber(currentExpression) || "௦";
}

function calculate() {
    if (!currentExpression) return;

    try {
        // Sanitize & Evaluate safely
        let evalExpr = currentExpression.replace(/×/g, "*").replace(/÷/g, "/");
        
        // Evaluate mathematical expression
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