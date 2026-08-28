// TamCalc Main Application Script
// Based on Authentic Tamil Number System & Wikipedia Specifications

const TAMIL_DIGITS = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];
const TAMIL_TEN = "௰";
const TAMIL_HUNDRED = "௱";
const TAMIL_THOUSAND = "௲";

// Special Large Powers Table from Tamil Mathematics Document
const TAMIL_LARGE_POWERS = {
    1: { word: "ஒன்று", symbol: "௧" },
    10: { word: "பத்து", symbol: "௰" },
    100: { word: "நூறு", symbol: "௱" },
    1000: { word: "ஆயிரம்", symbol: "௲" },
    10000: { word: "பத்தாயிரம்", symbol: "௰௲" },
    100000: { word: "நூறாயிரம் (இலட்சம்)", symbol: "௱௲" },
    1000000: { word: "பத்து நூறாயிரம்", symbol: "௰௱௲" },
    10000000: { word: "கோடி", symbol: "௱௱௲" },
    100000000: { word: "அற்புதம்", symbol: "௰௱௱௲" },
    1000000000: { word: "நிகற்புதம்", symbol: "௱௱௱௲" },
    10000000000: { word: "கும்பம்", symbol: "௲௱௱௲" },
    100000000000: { word: "கணம்", symbol: "௰௲௱௱௲" },
    1000000000000: { word: "கற்பம்", symbol: "௱௲௱௱௲" },
    10000000000000: { word: "நிகற்பம்", symbol: "௰௱௲௱௱௲" },
    100000000000000: { word: "பதுமம்", symbol: "௱௱௲௱௱௲" },
    1000000000000000: { word: "சங்கம்", symbol: "௰௱௱௲௱௱௲" },
    10000000000000000: { word: "வெள்ளம்", symbol: "௱௱௱௲௱௱௲" },
    100000000000000000: { word: "அந்நியம்", symbol: "௲௱௱௲௱௱௲" },
    1000000000000000000: { word: "அர்த்தம்", symbol: "௰௲௱௱௲௱௱௲" },
    10000000000000000000: { word: "பரார்த்தம்", symbol: "௱௲௱௱௲௱௱௲" },
    100000000000000000000: { word: "பூரியம்", symbol: "௰௱௲௱௱௲௱௱௲" },
    1000000000000000000000: { word: "பிரமகற்பம்", symbol: "௱௱௲௱௱௲௱௱௲" }
};

let currentExpression = "";
let tamilSystemMode = "traditional"; // 'traditional' (மரபு: ௨௲௪௱௫௰௩) or 'modern' (நவீன: ௨௪௫௩)

// DOM Elements
const ioDisplay = document.getElementById("io-display");
const tamDisplay = document.getElementById("tam-dis");
const tamWordsDisplay = document.getElementById("tam-words");
const expressionLine = document.getElementById("expression-line");
const modeBtnText = document.getElementById("mode-btn-text");
const toastMsg = document.getElementById("toast-msg");

// Initial Setup
document.addEventListener("DOMContentLoaded", () => {
    // Keyboard support
    document.addEventListener("keydown", handleKeyPress);
    
    // Restore saved mode
    const savedMode = localStorage.getItem("tamcalc_mode");
    if (savedMode) {
        tamilSystemMode = savedMode;
        updateModeUI();
    }
});

// Keypad Operations
function display(num) {
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

function toggleTamilSystemMode() {
    tamilSystemMode = (tamilSystemMode === "traditional") ? "modern" : "traditional";
    localStorage.setItem("tamcalc_mode", tamilSystemMode);
    updateModeUI();
    updateDisplays();
    showToast(tamilSystemMode === "traditional" ? "மரபு முறை (Traditional System)" : "நவீன முறை (Modern System)");
}

function updateModeUI() {
    if (modeBtnText) {
        modeBtnText.innerText = tamilSystemMode === "traditional" ? "மரபு" : "நவீன";
    }
}

function updateDisplays() {
    if (ioDisplay) ioDisplay.value = currentExpression || "0";
    
    if (!currentExpression) {
        if (tamDisplay) tamDisplay.value = "௦";
        if (tamWordsDisplay) tamWordsDisplay.innerText = "பூஜ்யம்";
        return;
    }

    if (tamDisplay) {
        tamDisplay.value = renderTamilExpression(currentExpression);
    }

    if (tamWordsDisplay) {
        const num = Number(currentExpression);
        if (!isNaN(num)) {
            tamWordsDisplay.innerText = toTamilWords(num);
        } else {
            tamWordsDisplay.innerText = "";
        }
    }
}

function calculate() {
    if (!currentExpression) return;

    try {
        let evalExpr = currentExpression.replace(/×/g, "*").replace(/÷/g, "/");
        let result = Function(`"use strict"; return (${evalExpr})`)();

        if (typeof result === "number") {
            if (!Number.isInteger(result)) {
                result = parseFloat(result.toFixed(8));
            }
        }

        if (expressionLine) {
            expressionLine.innerText = `${currentExpression} = ${result}`;
        }

        currentExpression = result.toString();
        
        if (ioDisplay) ioDisplay.value = currentExpression;
        if (tamDisplay) tamDisplay.value = renderTamilExpression(currentExpression);
        if (tamWordsDisplay) tamWordsDisplay.innerText = toTamilWords(result);
        
    } catch (err) {
        if (tamDisplay) tamDisplay.value = "பிழை (Error)";
        if (tamWordsDisplay) tamWordsDisplay.innerText = "";
        showToast("தவறான கணிப்பு! (Invalid Expression)");
    }
}

function renderTamilExpression(expr) {
    if (!expr) return "௦";
    const num = Number(expr);
    if (!isNaN(num)) {
        return formatTamilNumber(num);
    }
    
    return expr.toString().split(/([\+\-\*\/\%])/).map(part => {
        const n = Number(part);
        if (!isNaN(n) && part.trim() !== "") {
            return formatTamilNumber(n);
        }
        if (part === '*') return '×';
        if (part === '/') return '÷';
        return part;
    }).join("");
}

function formatTamilNumber(num) {
    if (isNaN(num)) return "";
    
    // Check exact power of 10 from Tamil Large Powers table
    if (TAMIL_LARGE_POWERS[num]) {
        return tamilSystemMode === "traditional" ? TAMIL_LARGE_POWERS[num].symbol : toModernTamilNumeral(num);
    }

    if (tamilSystemMode === "traditional" && Number.isInteger(num) && Math.abs(num) < 100000000) {
        return toTraditionalTamilNumeral(num);
    }
    return toModernTamilNumeral(num);
}

// Traditional Tamil Numeral Algorithm
function toTraditionalTamilNumeral(num) {
    if (num === 0) return "௦";
    let isNeg = num < 0;
    let n = Math.abs(num);

    let result = convertIntToTraditional(n);
    return isNeg ? "-" + result : result;
}

function convertIntToTraditional(n) {
    if (n === 0) return "";
    if (n < 10) return TAMIL_DIGITS[n];

    let res = "";

    // Thousands (௲)
    if (n >= 1000) {
        let th = Math.floor(n / 1000);
        n %= 1000;
        res += convertIntToTraditional(th) + TAMIL_THOUSAND;
    }

    // Hundreds (௱)
    if (n >= 100) {
        let h = Math.floor(n / 100);
        n %= 100;
        if (h === 1) {
            res += TAMIL_HUNDRED;
        } else {
            res += TAMIL_DIGITS[h] + TAMIL_HUNDRED;
        }
    }

    // Tens (௰)
    if (n >= 10) {
        let t = Math.floor(n / 10);
        n %= 10;
        if (t === 1) {
            res += TAMIL_TEN;
        } else {
            res += TAMIL_DIGITS[t] + TAMIL_TEN;
        }
    }

    // Units
    if (n > 0) {
        res += TAMIL_DIGITS[n];
    }

    return res;
}

// Modern Positional System
function toModernTamilNumeral(val) {
    if (val === undefined || val === null) return "";
    return val.toString().split("").map(char => {
        if (char >= '0' && char <= '9') {
            return TAMIL_DIGITS[parseInt(char)];
        }
        if (char === '*') return '×';
        if (char === '/') return '÷';
        return char;
    }).join("");
}

// ----------------------------------------------------
// Tamil Number Words Generator (எழுத்து வடிவம் / எண் ஒலிப்பு)
// ----------------------------------------------------
function toTamilWords(num) {
    if (isNaN(num)) return "";
    if (num === 0) return "பூஜ்யம் (சுழியம்)";

    // Check large powers table directly first
    if (TAMIL_LARGE_POWERS[num]) {
        return TAMIL_LARGE_POWERS[num].word;
    }

    let isNegative = num < 0;
    let n = Math.abs(num);
    let intPart = Math.floor(n);
    let fracPart = n - intPart;

    let words = convertIntToTamilWords(intPart);
    if (isNegative) words = "மைனஸ் " + words;

    if (fracPart > 0) {
        const roundedFrac = parseFloat(fracPart.toFixed(4));
        if (roundedFrac === 0.5) words += " அரையே";
        else if (roundedFrac === 0.25) words += " காலே";
        else if (roundedFrac === 0.75) words += " முக்காலே";
        else if (roundedFrac === 0.125) words += " அரைக்காலே";
        else {
            words += " புள்ளி " + roundedFrac.toString().substring(2).split("").map(d => convertSingleDigitToWord(parseInt(d))).join(" ");
        }
    }

    return words;
}

function convertSingleDigitToWord(d) {
    const units = ["பூஜ்யம்", "ஒன்று", "இரண்டு", "மூன்று", "நான்கு", "ஐந்து", "ஆறு", "ஏழு", "எட்டு", "ஒன்பது"];
    return units[d] || "";
}

function convertIntToTamilWords(n) {
    if (n === 0) return "பூஜ்யம்";

    // Direct lookup for powers of 10 if available
    if (TAMIL_LARGE_POWERS[n]) {
        return TAMIL_LARGE_POWERS[n].word;
    }

    const units = ["", "ஒன்று", "இரண்டு", "மூன்று", "நான்கு", "ஐந்து", "ஆறு", "ஏழு", "எட்டு", "ஒன்பது"];
    const teens = ["பத்து", "பதினொன்று", "பன்னிரண்டு", "பதின்மூன்று", "பதினான்கு", "பதினைந்து", "பதினாறு", "பதினேழு", "பதினெட்டு", "பத்தொன்பது"];
    
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];

    if (n < 100) {
        const tens = Math.floor(n / 10);
        const rem = n % 10;
        const tensWords = ["", "", "இருபது", "முப்பது", "நாற்பது", "ஐம்பது", "அறுபது", "எழுபது", "எண்பது", "தொண்ணூறு"];
        const tensPrefix = ["", "", "இருபத்து ", "முப்பத்து ", "நாற்பத்து ", "ஐம்பத்து ", "அறுபத்து ", "எழுபத்து ", "எண்பத்து ", "தொண்ணூற்று "];

        if (rem === 0) return tensWords[tens];
        return tensPrefix[tens] + units[rem];
    }

    if (n < 1000) {
        const h = Math.floor(n / 100);
        const rem = n % 100;
        const hundredWords = ["", "நூறு", "இருநூறு", "முந்நூறு", "நானூறு", "ஐநூறு", "அறுநூறு", "எழுநூறு", "எண்ணூறு", "தொள்ளாயிரம்"];
        const hundredPrefix = ["", "நூற்றி ", "இருநூற்றி ", "முந்நூற்றி ", "நானூற்றி ", "ஐநூற்றி ", "அறுநூற்றி ", "எழுநூற்றி ", "எண்ணூற்றி ", "தொள்ளாயிரத்து "];

        if (rem === 0) return hundredWords[h];
        return hundredPrefix[h] + convertIntToTamilWords(rem);
    }

    if (n < 100000) {
        const th = Math.floor(n / 1000);
        const rem = n % 1000;
        let thWord = "";
        
        if (th === 1) thWord = rem === 0 ? "ஆயிரம்" : "ஆயிரத்து ";
        else if (th === 2) thWord = rem === 0 ? "இரண்டாயிரம்" : "இரண்டாயிரத்து ";
        else {
            thWord = convertIntToTamilWords(th) + (rem === 0 ? " ஆயிரம்" : " ஆயிரத்து ");
        }

        if (rem === 0) return thWord;
        return thWord + convertIntToTamilWords(rem);
    }

    if (n < 10000000) {
        const l = Math.floor(n / 100000);
        const rem = n % 100000;
        let lWord = convertIntToTamilWords(l) + (rem === 0 ? " லட்சம்" : " லட்சத்து ");
        if (rem === 0) return lWord;
        return lWord + convertIntToTamilWords(rem);
    }

    const c = Math.floor(n / 10000000);
    const rem = n % 10000000;
    let cWord = convertIntToTamilWords(c) + (rem === 0 ? " கோடி" : " கோடியே ");
    if (rem === 0) return cWord;
    return cWord + convertIntToTamilWords(rem);
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
    const numVal = tamDisplay ? tamDisplay.value : "";
    const wordVal = tamWordsDisplay ? tamWordsDisplay.innerText : "";
    if (!numVal) return;

    const copyText = `${numVal} (${wordVal})`;
    navigator.clipboard.writeText(copyText).then(() => {
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