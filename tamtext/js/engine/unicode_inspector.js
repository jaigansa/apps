/*
 * TamText Unicode Code Points & Character Inspector Engine
 */

function textToUnicodeHex(text) {
    if (!text) return '';
    const chars = Array.from(text);
    return chars.map(c => {
        if (c === '\n') return '\n';
        if (c === ' ') return '  ';
        const code = c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
        return `U+${code}`;
    }).join(' ');
}

function textToHtmlEntities(text) {
    if (!text) return '';
    const chars = Array.from(text);
    return chars.map(c => {
        if (c === '\n') return '\n';
        if (c === ' ') return ' ';
        const code = c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
        return `&#x${code};`;
    }).join('');
}

function unicodeHexToText(text) {
    if (!text) return '';
    // Handle U+XXXX, \uXXXX, 0xXXXX, &#xXXXX;, &#XXXX;
    let s = text;
    s = s.replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
    s = s.replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
    s = s.replace(/\\u([0-9a-fA-F]{4})/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
    s = s.replace(/U\+([0-9a-fA-F]{4,6})/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
    s = s.replace(/0x([0-9a-fA-F]{4,6})/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
    return s;
}

function getTamilCharCategory(codePoint) {
    if (codePoint >= 0x0B85 && codePoint <= 0x0B94) return 'Uyir Vowels (உயிர்)';
    if (codePoint === 0x0B83) return 'Aayutha Ezhuthu (ஆய்தம்)';
    if (codePoint >= 0x0B95 && codePoint <= 0x0BB9) return 'Mei Consonants (மெய்)';
    if (codePoint >= 0x0BBE && codePoint <= 0x0BD7) return 'Uyirmei Sign (உயிர்மெய்)';
    if (codePoint >= 0x0BE6 && codePoint <= 0x0BEF) return 'Tamil Digits (எண்)';
    if (codePoint >= 0x0000 && codePoint <= 0x007F) return 'ASCII / English';
    return 'Unicode Character';
}

function inspectUnicodeChars(text) {
    if (!text) return [];
    const chars = Array.from(text).slice(0, 50); // Cap at 50 chars for UI performance
    return chars.map(c => {
        const cp = c.codePointAt(0);
        const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
        const dec = cp;
        const category = getTamilCharCategory(cp);
        return { char: c, hex, dec, category };
    });
}
