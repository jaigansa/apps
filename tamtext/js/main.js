/*
 * TamText - Tamil Font Converter & Transliteration Engine
 * Author: jaigansa
 * License: CC BY-NC-SA
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');
    const sourceCount = document.getElementById('sourceCount');
    const targetCount = document.getElementById('targetCount');
    const liveToggle = document.getElementById('liveToggle');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const toast = document.getElementById('toast');
    const convertBtn = document.getElementById('convertBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const swapBtn = document.getElementById('swapBtn');
    const inspectorGrid = document.getElementById('inspectorGrid');

    // Compact Selector Elements
    const categoryPills = document.querySelectorAll('.category-pill');
    const legacySubToolbar = document.getElementById('legacySubToolbar');
    const codePointsSubToolbar = document.getElementById('codePointsSubToolbar');
    const directionBtns = document.querySelectorAll('.direction-btn');
    const fontSelect = document.getElementById('fontSelect');
    const modeTabs = document.querySelectorAll('#codePointsSubToolbar .mode-tab');

    let currentCategory = 'legacy'; // 'legacy' | 'tanglish' | 'code_points'
    let currentDirection = 'forward'; // 'forward' | 'reverse'
    let selectedFont = 'bamini'; // 'bamini', 'tscii', 'tab', 'tam', 'senthamizh', 'vanavil', 'anjal'
    let codePointMode = 'unicode_hex'; // 'unicode_hex', 'html_entities', 'unicode_hex_rev'
    let currentMode = 'bamini'; // Computed mode string for trans logic
    let liveConvertEnabled = true;

    // Initialize Theme
    const savedTheme = localStorage.getItem('tamtext_theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('tamtext_theme', theme);
        const icon = themeToggleBtn.querySelector('.material-icons');
        if (icon) {
            icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
        }
    }

    // Category Segmented Control Handler
    categoryPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            categoryPills.forEach(p => p.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentCategory = e.currentTarget.getAttribute('data-category');

            if (currentCategory === 'legacy') {
                legacySubToolbar.style.display = 'flex';
                codePointsSubToolbar.style.display = 'none';
            } else if (currentCategory === 'code_points') {
                legacySubToolbar.style.display = 'none';
                codePointsSubToolbar.style.display = 'flex';
            } else { // tanglish
                legacySubToolbar.style.display = 'none';
                codePointsSubToolbar.style.display = 'none';
            }

            updateComputedMode();
        });
    });

    // Direction Toggle Handler
    directionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            directionBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentDirection = e.currentTarget.getAttribute('data-dir');
            updateComputedMode();
        });
    });

    // Font Selector Dropdown Handler
    if (fontSelect) {
        fontSelect.addEventListener('change', (e) => {
            selectedFont = e.target.value;
            updateComputedMode();
        });
    }

    // Code Points Mode Tabs Handler
    modeTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            modeTabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            codePointMode = e.currentTarget.getAttribute('data-mode');
            updateComputedMode();
        });
    });

    // Compute Active Mode and Update Placeholders
    function updateComputedMode() {
        if (currentCategory === 'tanglish') {
            currentMode = 'tanglish';
            sourceText.placeholder = 'Type Tanglish here (e.g. vanakkam, thamizh, thaai)...';
            targetText.placeholder = 'Tamil Unicode result will auto-generate here...';
        } else if (currentCategory === 'code_points') {
            currentMode = codePointMode;
            if (codePointMode === 'unicode_hex') {
                sourceText.placeholder = 'Write or paste Tamil text to convert to Unicode Hex (U+0BA4 U+0BAE)...';
                targetText.placeholder = 'Unicode Code Points (U+0BA4) will appear here...';
            } else if (codePointMode === 'html_entities') {
                sourceText.placeholder = 'Write or paste Tamil text to convert to HTML Entities (&#x0BA4;)...';
                targetText.placeholder = 'HTML Entities will appear here...';
            } else {
                sourceText.placeholder = 'Paste Unicode Code Points (e.g. U+0BA4 U+0BAE U+0BBF U+0BB4 or &#x0BA4;)...';
                targetText.placeholder = 'Decoded Tamil Unicode text will appear here...';
            }
        } else { // legacy
            if (currentDirection === 'reverse') {
                currentMode = selectedFont + '_rev';
                sourceText.placeholder = 'Paste or type legacy font text here...';
                targetText.placeholder = 'Unicode text output will appear here...';
            } else {
                currentMode = selectedFont;
                sourceText.placeholder = 'Write or paste Unicode Tamil text here...';
                targetText.placeholder = 'Converted legacy font text will appear here...';
            }
        }

        performConversion();
    }

    // Conversion Logic
    function performConversion() {
        const input = sourceText.value;
        if (!input.trim()) {
            targetText.value = '';
            updateStats();
            updateInspector();
            return;
        }

        let output = '';
        try {
            switch (currentMode) {
                // Unicode Code Points
                case 'unicode_hex':
                    output = textToUnicodeHex(input);
                    break;
                case 'html_entities':
                    output = textToHtmlEntities(input);
                    break;
                case 'unicode_hex_rev':
                    output = unicodeHexToText(input);
                    break;
                // Phonetic Transliteration
                case 'tanglish':
                    output = TanglishToUnicode(input);
                    break;
                // Unicode -> Legacy Fonts
                case 'bamini':
                    output = UniBamini(input);
                    break;
                case 'tscii':
                    output = UniTscii(input);
                    break;
                case 'tab':
                    output = UniTab(input);
                    break;
                case 'tam':
                    output = UniTam(input);
                    break;
                case 'senthamizh':
                    output = UniSenthamizh(input);
                    break;
                case 'vanavil':
                    output = UniVanavil(input);
                    break;
                case 'anjal':
                    output = UniAnjal(input);
                    break;
                // Legacy Fonts -> Unicode (Reverse)
                case 'bamini_rev':
                    output = BaminiUni(input);
                    break;
                case 'tscii_rev':
                    output = TsciiUni(input);
                    break;
                case 'tab_rev':
                    output = TabUni(input);
                    break;
                case 'tam_rev':
                    output = TamUni(input);
                    break;
                case 'senthamizh_rev':
                    output = SenthamizhUni(input);
                    break;
                case 'vanavil_rev':
                    output = VanavilUni(input);
                    break;
                case 'anjal_rev':
                    output = AnjalUni(input);
                    break;
                default:
                    output = UniBamini(input);
            }
        } catch (err) {
            console.error('Conversion Error:', err);
            output = input;
        }

        targetText.value = output;
        updateStats();
        updateInspector();
    }

    // Live Conversion Event Listener
    sourceText.addEventListener('input', () => {
        updateStats();
        if (liveConvertEnabled) {
            performConversion();
        } else {
            updateInspector();
        }
    });

    if (liveToggle) {
        liveToggle.addEventListener('change', (e) => {
            liveConvertEnabled = e.target.checked;
            if (liveConvertEnabled) {
                performConversion();
            }
        });
    }

    if (convertBtn) {
        convertBtn.addEventListener('click', performConversion);
    }

    // Copy to Clipboard
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const val = targetText.value;
            if (!val) {
                showToast('Nothing to copy!');
                return;
            }
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(val);
                } else {
                    targetText.select();
                    document.execCommand('copy');
                }
                showToast('Copied to clipboard!');
            } catch (err) {
                showToast('Failed to copy text.');
            }
        });
    }

    // Clear Action
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            sourceText.value = '';
            targetText.value = '';
            updateStats();
            updateInspector();
            sourceText.focus();
            showToast('Cleared text fields');
        });
    }

    // Swap Action
    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            const srcVal = sourceText.value;
            const tgtVal = targetText.value;
            sourceText.value = tgtVal;
            targetText.value = srcVal;
            
            // Toggle direction or mode
            if (currentCategory === 'legacy') {
                currentDirection = currentDirection === 'forward' ? 'reverse' : 'forward';
                directionBtns.forEach(btn => {
                    if (btn.getAttribute('data-dir') === currentDirection) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            } else if (currentCategory === 'code_points') {
                codePointMode = codePointMode === 'unicode_hex_rev' ? 'unicode_hex' : 'unicode_hex_rev';
            }

            updateComputedMode();
            showToast('Swapped text & direction');
        });
    }

    // Update Word/Character Stats
    function updateStats() {
        const srcVal = sourceText.value;
        const tgtVal = targetText.value;

        if (sourceCount) sourceCount.textContent = `${srcVal.length} chars | ${countWords(srcVal)} words`;
        if (targetCount) targetCount.textContent = `${tgtVal.length} chars | ${countWords(tgtVal)} words`;
    }

    function countWords(str) {
        const trimmed = str.trim();
        return trimmed ? trimmed.split(/\s+/).length : 0;
    }

    // Live Character Inspector Grid Renderer
    function updateInspector() {
        if (!inspectorGrid) return;
        const textToInspect = targetText.value || sourceText.value;
        if (!textToInspect.trim()) {
            inspectorGrid.innerHTML = '<div class="empty-inspector">Type or convert text to view character code points</div>';
            return;
        }

        const items = inspectUnicodeChars(textToInspect);
        inspectorGrid.innerHTML = items.map(item => `
            <div class="inspector-card">
                <div class="char-display">${item.char === ' ' ? '␣' : item.char}</div>
                <div class="char-hex">${item.hex}</div>
                <div class="char-dec">#${item.dec}</div>
                <div class="char-cat">${item.category}</div>
            </div>
        `).join('');
    }

    // Toast Notification System
    let toastTimeout;
    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    // Initial stats and inspector computation
    updateStats();
    updateInspector();
});