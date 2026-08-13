/**
 * Quick Chat - Professional Main Logic
 * Optimised for Mobile and Desktop
 */

// 1. Cache DOM Elements for performance
const UI = {
    display: document.getElementById("display"),
    dCode: document.getElementById("dCode"),
    message: document.getElementById("txt"),
    sendBtn: document.querySelector(".primary-btn"),
    numpad: document.querySelector(".numpad") // If using the numpad buttons
};

// 2. Constants
const WA_API = "https://wa.me/";

/**
 * Core: Open WhatsApp Link
 */
function chat_open() {
    // 1. Get and Clean Data
    const country = UI.dCode.value.replace('+', '');
    let number = UI.display.value.trim();
    const text = UI.message.value;

    // 2. Sanitize Number (Remove leading zeros, spaces, or dashes)
    number = number.replace(/^0+|[^0-9]/g, "");

    // 3. Validation (Standard WhatsApp numbers are 7-15 digits)
    if (number.length >= 7 && number.length <= 15) {
        // Use URL Object for perfect encoding of special characters (&, #, ?, etc.)
        const finalUrl = new URL(`${WA_API}${country}${number}`);
        
        if (text) {
            finalUrl.searchParams.append("text", text);
        }

        // Open in new tab
        window.open(finalUrl.href, "_blank");
    } else {
        showError();
    }
}

/**
 * Handle Inputs & Sanitization
 */
function digitonly(input) {
    // Immediate regex to prevent non-numeric typing
    input.value = input.value.replace(/[^0-9]/g, "");
}

function num(val) {
    if (UI.display.value.length < 15) {
        UI.display.value += val;
    }
}

function clears() {
    UI.display.value = UI.display.value.slice(0, -1);
}

function allclear() {
    UI.display.value = "";
    UI.message.value = "";
    UI.message.style.height = "auto";
}

/**
 * UI Feedback: Error State
 */
function showError() {
    UI.display.style.borderColor = "#ff3b30";
    alert("Please enter a valid 10-digit mobile number.");
    setTimeout(() => {
        UI.display.style.borderColor = "";
    }, 2000);
}

/**
 * Auto-growing Textarea
 */
function textAreaAdjust(element) {
    element.style.height = "auto";
    element.style.height = (element.scrollHeight) + "px";
}

/**
 * Event Listeners (Professional Setup)
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Handle keyboard "Enter" to send
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            chat_open();
        }
    });

    // 2. Clear input if user pastes a number with a '+' or '0'
    UI.display.addEventListener('paste', (e) => {
        setTimeout(() => {
            UI.display.value = UI.display.value.replace(/^0+|[^0-9]/g, "");
        }, 1);
    });

});
