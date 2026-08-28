/*
 * Anjal 1.0 Tanglish-to-Tamil Engine & Sandhi Agglutination Processor
 */

function applyTamilAgglutination(w) {
    if (!w || w.length < 4) return null;
    const lower = w.toLowerCase();

    // 1. Direct Sandhi Patterns for -tt- (veedu -> veett-, naadu -> naatt-, kaadu -> kaatt-, etc.)
    const sandhiTT = [
        { prefix: 'veett', base: 'வீட்டு', baseRoot: 'வீட்' },
        { prefix: 'vitt', base: 'வீட்டு', baseRoot: 'வீட்' },
        { prefix: 'naatt', base: 'நாட்டு', baseRoot: 'நாட்' },
        { prefix: 'natt', base: 'நாட்டு', baseRoot: 'நாட்' },
        { prefix: 'kaatt', base: 'காட்டு', baseRoot: 'காட்' },
        { prefix: 'katt', base: 'காட்டு', baseRoot: 'காட்' },
        { prefix: 'thoott', base: 'தோட்ட', baseRoot: 'தோட்ட்' },
        { prefix: 'paatt', base: 'பாட்டு', baseRoot: 'பாட்' },
        { prefix: 'patt', base: 'பாட்டு', baseRoot: 'பாட்' }
    ];

    for (const item of sandhiTT) {
        if (lower.startsWith(item.prefix)) {
            const suf = lower.substring(item.prefix.length);
            if (suf === 'ukku' || suf === 'ku') return item.base + 'க்கு';
            if (suf === 'il') return item.baseRoot + 'டில்';
            if (suf === 'ai') return item.baseRoot + 'டை';
            if (suf === 'ilirundhu' || suf === 'ilirunthu') return item.baseRoot + 'டிலிருந்து';
            if (suf === 'aal' || suf === 'al') return item.baseRoot + 'டால்';
            if (suf === 'oda') return item.baseRoot + 'டோட';
            if (suf === 'udan') return item.baseRoot + 'டுடன்';
        }
    }

    // 2. Lexicon Root Suffix Decomposer (Sandhi for Vowels & Consonants)
    const suffixRules = [
        { keys: ['ilirundhu', 'ilirunthu'], mark: 'ிலிருந்து', ymark: 'யிலிருந்து', vmark: 'விலிருந்து' },
        { keys: ['udaiya', 'udaiy'], mark: 'ுடைய', ymark: 'யுடைய', vmark: 'வுடைய' },
        { keys: ['ukku', 'ku', 'kku'], mark: 'ுக்கு', ymark: 'க்கு', vmark: 'வுக்கு' },
        { keys: ['yil', 'thil', 'il'], mark: 'ில்', ymark: 'யில்', vmark: 'வில்' },
        { keys: ['yaal', 'yal', 'aal', 'al'], mark: 'ால்', ymark: 'யால்', vmark: 'வால்' },
        { keys: ['vudan', 'wudan', 'udan'], mark: 'ுடன்', ymark: 'யுடன்', vmark: 'வுடன்' },
        { keys: ['voda', 'woda', 'oda'], mark: 'ோடா', ymark: 'யோட', vmark: 'வோட' },
        { keys: ['yai', 'ai'], mark: 'ை', ymark: 'யை', vmark: 'வை' }
    ];

    if (typeof wordOverrides === 'undefined') return null;

    for (const rule of suffixRules) {
        for (const key of rule.keys) {
            if (lower.endsWith(key)) {
                let root = lower.substring(0, lower.length - key.length);
                let matchedRootKey = null;

                if (wordOverrides[root]) {
                    matchedRootKey = root;
                } else if (wordOverrides[root + 'i']) {
                    matchedRootKey = root + 'i';
                } else if (wordOverrides[root + 'a']) {
                    matchedRootKey = root + 'a';
                }

                if (matchedRootKey && wordOverrides[matchedRootKey]) {
                    const cleanRoot = wordOverrides[matchedRootKey];
                    // If root ends in vowel -ai, -i, -e (e.g. chennai, kavithai)
                    if (matchedRootKey.endsWith('ai') || matchedRootKey.endsWith('i') || matchedRootKey.endsWith('e')) {
                        return cleanRoot + rule.ymark;
                    }
                    // If root ends in vowel -a, -u, -o (e.g. amma, appa)
                    if (matchedRootKey.endsWith('a') || matchedRootKey.endsWith('u') || matchedRootKey.endsWith('o')) {
                        return cleanRoot + rule.vmark;
                    }
                    // Consonant root
                    let stem = cleanRoot;
                    if (stem.endsWith('்')) stem = stem.substring(0, stem.length - 1);
                    return stem + rule.mark;
                }
            }
        }
    }

    return null;
}
