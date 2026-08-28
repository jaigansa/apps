/*
 * High-Frequency Tamil Transliteration Lexicon Dataset (Dakshina Standard)
 */

const wordOverrides = {
        "poguven": "போவேன்",
        "pogiren": "போகிறேன்",
        "ponadhu": "போனது",
        "ponal": "போனாள்",
        "ponan": "போனான்",
        "ponar": "போனார்",
        "ponen": "போனேன்",
        "varuven": "வருவேன்",
        "varugirar": "வருகிறார்",
        "vandhadhu": "வந்தது",
        "vandhal": "வந்தாள்",
        "vandhan": "வந்தான்",
        "vandhar": "வந்தார்",
        "vandhen": "வந்தேன்",
        "padippen": "படிப்பேன்",
        "padikkiren": "படிக்கிறேன்",
        "padithen": "படித்தேன்",
        "padithar": "படித்தார்",
        "padithal": "படித்தாள்",
        "padithan": "படித்தான்",
        "paarppar": "பார்ப்பார்",
        "paarppen": "பார்ப்பேன்",
        "paarkkiradhu": "பார்க்கிறது",
        "paarkkiral": "பார்க்கிறாள்",
        "paarkkiran": "பார்க்கிறான்",
        "paarkkirar": "பார்க்கிறார்",
        "paarkkiren": "பார்க்கிறேன்",
        "paarthadhu": "பார்த்தது",
        "paarthal": "பார்த்தாள்",
        "paarthan": "பார்த்தான்",
        "paarthar": "பார்த்தார்",
        "paarthen": "பார்த்தேன்",
        "seiyum": "செய்யும்",
        "seival": "செய்வாள்",
        "seivan": "செய்வான்",
        "seivar": "செய்வார்",
        "seiven": "செய்வேன்",
        "seigiradhu": "செய்கிறது",
        "seigiral": "செய்கிறாள்",
        "seigiran": "செய்கிறான்",
        "seigirar": "செய்கிறார்",
        "seigiren": "செய்கிறேன்",
        "seidhadhu": "செய்தது",
        "seidhal": "செய்தாள்",
        "seidhan": "செய்தான்",
        "seidhar": "செய்தார்",
        "seidhen": "செய்தேன்",
        "enga": "எங்க",
        "inga": "இங்க",
        "anga": "அங்க",
        "ippadi": "இப்படி",
        "appadi": "அப்படி",
        "endha": "எந்த",
        "indha": "இந்த",
        "andha": "அந்த",
        "santhosh": "சந்தோஷ்",
        "nilesh": "நிலேஷ்",
        "yogesh": "யோகேஷ்",
        "venkatesh": "வெங்கடேஷ்",
        "sathish": "சதீஷ்",
        "sathesh": "சதேஷ்",
        "rajesh": "ராஜேஷ்",
        "lokesh": "லோகேஷ்",
        "mahesh": "மகேஷ்",
        "ramesh": "ரமேஷ்",
        "suresh": "சுரேஷ்",
        "dinesh": "தினேஷ்",
        "vignesh": "விக்னேஷ்",
        "jaigansa": "ஜெய் கணேசா",
        "jai": "ஜெய்",
        "jaiganesh": "ஜெய் கணேஷ்",
        "ganeshan": "கணேசன்",
        "ganesha": "கணேசா",
        "ganesh": "கணேஷ்",
        "nalladhaiye": "நல்லதையே",
        "vanga": "வாங்கா",
        "saappidunga": "சாப்பிடுங்க",
        "varom": "வர்றோம்",
        "porom": "போறோம்",
        "poren": "போறேன்",
        "varren": "வர்றேன்",
        "varugiren": "வருகிறேன்",
        "pesuren": "பேசுறேன்",
        "pesugiren": "பேசுகிறேன்",
        "iruken": "இருக்கேன்",
        "irukkeen": "இருக்கேன்",
        "irukku": "இருக்கு",
        "irukkangala": "இருக்காங்களா",
        "irukkingala": "இருக்கீங்களா",
        "nallairukkengala": "நல்லாயிருக்கீங்களா",
        "nallairukingala": "நல்லாயிருக்கீங்களா",
        "nallairukkangala": "நல்லாயிருக்காங்களா",
        "vanakkam": "வணக்கம்",
        "vanakam": "வணக்கம்",
        "nandri": "நன்றி",
        "nanri": "நன்றி",
        "varuga": "வருக",
        "varugai": "வருகை",
        "vanthanam": "வந்தனம்",
        "magizhchi": "மகிழ்ச்சி",
        "vaazhthukkal": "வாழ்த்துக்கள்",
        "valthukkal": "வாழ்த்துக்கள்",
        "vaazhthu": "வாழ்த்து",
        "namaste": "நமஸ்தே",
        "vazhga": "வாழ்க",
        "valga": "வாழ்க",
        "vazhthukkal": "வாழ்த்துக்கள்",
        "saranam": "சரணம்",
        "subham": "சுபம்",
        "mangalam": "மங்கலம்",
        "thamizh": "தமிழ்",
        "tamizh": "தமிழ்",
        "tamil": "தமிழ்",
        "thamizhan": "தமிழன்",
        "tamizhan": "தமிழன்",
        "thamizhar": "தமிழர்",
        "tamizhar": "தமிழர்",
        "mozhi": "மொழி",
        "sol": "சொல்",
        "sollo": "சொல்லு",
        "solli": "சொல்லி",
        "sollu": "சொல்லு",
        "ezhuthu": "எழுத்து",
        "ezhuthukkal": "எழுத்துக்கள்",
        "kavithai": "கவிதை",
        "kavithaikal": "கவிதைகள்",
        "paattu": "பாட்டு",
        "padam": "படம்",
        "kathai": "கதை",
        "puthagam": "புத்தகம்",
        "nool": "நூல்",
        "kural": "குறள்",
        "thirukkural": "திருக்குறள்",
        "naan": "நான்",
        "nan": "நான்",
        "nee": "நீ",
        "ni": "நீ",
        "avan": "அவன்",
        "aval": "அவள்",
        "adhu": "அது",
        "athu": "அது",
        "idhu": "இது",
        "ithu": "இது",
        "naangal": "நாங்கள்",
        "nangal": "நாங்கள்",
        "naam": "நாம்",
        "neengal": "நீங்கள்",
        "ningal": "நீங்கள்",
        "avargal": "அவர்கள்",
        "avargalukku": "அவர்களுக்கு",
        "ivar": "இவர்",
        "avar": "அவர்",
        "yaar": "யார்",
        "yar": "யார்",
        "yen": "ஏன்",
        "yenna": "என்ன",
        "enna": "என்ன",
        "eppadi": "எப்படி",
        "enge": "எங்கே",
        "engey": "எங்கே",
        "inge": "இங்கே",
        "ingey": "இங்கே",
        "ange": "அங்கே",
        "angey": "அங்கே",
        "eppodhu": "எப்போது",
        "eppothu": "எப்போது",
        "yevvalavu": "எவ்வளவு",
        "evvalavu": "எவ்வளவு",
        "yethanai": "எத்தனை",
        "ethanai": "எத்தனை",
        "edhu": "எது",
        "ethu": "எது",
        "amma": "அம்மா",
        "appa": "அப்பா",
        "anna": "அண்ணன்",
        "annai": "அன்னை",
        "akka": "அக்கா",
        "thambi": "தம்பி",
        "thangai": "தங்கை",
        "paatti": "பாட்டி",
        "patti": "பாட்டி",
        "thaatha": "தாத்தா",
        "thatha": "தாத்தா",
        "mama": "மாமா",
        "athtai": "அத்தை",
        "attai": "அத்தை",
        "chithappa": "சிற்றப்பா",
        "periyappa": "பெரியப்பா",
        "manaivi": "மனைவி",
        "kanavan": "கணவன்",
        "magan": "மகன்",
        "magal": "மகள்",
        "kuzhandhai": "குழந்தை",
        "kulandhai": "குழந்தை",
        "nanban": "நண்பன்",
        "nanbi": "நண்பி",
        "thozhan": "தோழன்",
        "thozhi": "தோழி",
        "thozha": "தோழா",
        "kudumbam": "குடும்பம்",
        "makkal": "மக்கள்",
        "makkale": "மக்களே",
        "guru": "குரு",
        "aasan": "ஆசான்",
        "manavan": "மாணவன்",
        "manavi": "மாணவி",
        "boomi": "பூமி",
        "vaanam": "வானம்",
        "vanam": "வானம்",
        "nilavu": "நிலவு",
        "sooriyan": "சூரியன்",
        "suriyan": "சூரியன்",
        "kaatru": "காற்று",
        "katru": "காற்று",
        "neer": "நீர்",
        "thanni": "தண்ணீர்",
        "thanneer": "தண்ணீர்",
        "neruppu": "நெருப்பு",
        "thee": "தீ",
        "maram": "மரம்",
        "poo": "பூ",
        "kaai": "காய்",
        "kai": "கை",
        "kani": "கனி",
        "pazham": "பழம்",
        "palam": "பழம்",
        "kadhal": "காதல்",
        "kadal": "கடல்",
        "malai": "மாலை",
        "nathi": "நதி",
        "aaru": "ஆறு",
        "megam": "மேகம்",
        "mazhai": "மழை",
        "kaalai": "காலை",
        "kalai": "காலை",
        "maddhyanam": "மத்தியானம்",
        "maalai": "மாலை",
        "iravu": "இரவு",
        "indru": "இன்று",
        "naalai": "நாளை",
        "netru": "நேற்று",
        "vaaram": "வாரம்",
        "maadham": "மாதம்",
        "matham": "மாதம்",
        "aandu": "ஆண்டு",
        "aarandu": "ஆண்டு",
        "nimidam": "நிமிடம்",
        "mani": "மணி",
        "dhinam": "தினம்",
        "naal": "நாள்",
        "kaalam": "காலம்",
        "nalla": "நல்ல",
        "nalladhai": "நல்லது",
        "nalladhu": "நல்லது",
        "ketta": "கெட்ட",
        "periya": "பெரிய",
        "chinna": "சின்ன",
        "anbu": "அன்பு",
        "arivu": "அறிவு",
        "alagu": "அழகு",
        "azhagu": "அழகு",
        "unmai": "உண்மை",
        "poi": "பொய்",
        "veeram": "வீரம்",
        "nambikkai": "நம்பிக்கை",
        "sandhosham": "சந்தோஷம்",
        "santhosham": "சந்தோஷம்",
        "kavalai": "கவலை",
        "kopam": "கோபம்",
        "kobam": "கோபம்",
        "pasam": "பாசம்",
        "karunai": "கருணை",
        "amaidhi": "அமைதி",
        "vettri": "வெற்றி",
        "vetri": "வெற்றி",
        "tholvi": "தோல்வி",
        "bayam": "பயம்",
        "veedu": "வீடு",
        "vidu": "வீடு",
        "naadu": "நாடு",
        "nadu": "நாடு",
        "ulagam": "உலகம்",
        "ulagu": "உலகு",
        "kadavul": "கடவுள்",
        "iraivan": "இறைவன்",
        "kovil": "கோவில்",
        "koil": "கோயில்",
        "oor": "ஊர்",
        "nagar": "நகரம்",
        "nagaram": "நகரம்",
        "chennai": "சென்னை",
        "madurai": "மதுரை",
        "kovai": "கோவை",
        "coimbatore": "கோவை",
        "trichy": "திருச்சி",
        "tanjore": "தஞ்சாவூர்",
        "thanjavur": "தஞ்சாவூர்",
        "salem": "சேலம்",
        "tirunelveli": "திருநெல்வேலி",
        "nellai": "நெல்லை",
        "puducherry": "புதுச்சேரி",
        "kanchipuram": "காஞ்சீபுரம்",
        "tamizhagam": "தமிழகம்",
        "tamilnadu": "தமிழ்நாடு",
        "india": "இந்திய",
        "vaa": "வா",
        "vaanga": "வாருங்கள்",
        "vaangal": "வாருங்கள்",
        "po": "போ",
        "ponga": "போங்கள்",
        "pongal": "பொங்கல்",
        "saapidu": "சாப்பிடு",
        "sapidu": "சாப்பிடு",
        "saappadu": "சாப்பாடு",
        "kudi": "குடி",
        "paar": "பார்",
        "paarka": "பார்க்க",
        "pesu": "பேசு",
        "pesuvaom": "பேசுவோம்",
        "padi": "படி",
        "padippu": "படிப்பு",
        "oodu": "ஓடு",
        "thoongu": "தூங்கு",
        "vaazha": "வாழ",
        "sey": "செய்",
        "seidhu": "செய்து",
        "kudu": "கொடு",
        "koduthu": "கொடுத்து",
        "vaangu": "வாங்கு",
        "neda": "நட",
        "nadanam": "நடனம்",
        "sirikka": "சிரிக்க",
        "ondru": "ஒன்று",
        "onru": "ஒன்று",
        "irandu": "இரண்டு",
        "moondru": "மூன்று",
        "monru": "மூன்று",
        "naangu": "நான்கு",
        "nangu": "நான்கு",
        "aindhu": "ஐந்து",
        "ainthu": "ஐந்து",
        "ezhu": "ஏழு",
        "ettu": "எட்டு",
        "onpadhu": "ஒன்பது",
        "onpathu": "ஒன்பது",
        "patthu": "பத்து",
        "pathu": "பத்து",
        "nooru": "நூறு",
        "aayiram": "ஆயிரம்",
        "latcham": "லட்சம்",
        "kodi": "கோடி"
};



function TanglishToUnicode(text) {
    if (!text) return '';

    // Dakshina-Inspired High-Frequency Transliteration Lexicon
    
    let words = text.split(/(\s+|[.,!?'"()\-_:])/);
    let result = '';
    let prevTamilWord = '';

    for (let i = 0; i < words.length; i++) {
        let w = words[i];
        if (!w) continue;
        const lowerW = w.toLowerCase();

        // Check if Sandhi doubling needed based on previous word
        let sandhiPrefix = '';
        if (prevTamilWord) {
            const needsSandhi = ['அந்த', 'இந்த', 'எந்த', 'அப்படி', 'இப்படி', 'எப்படி', 'மிக'].includes(prevTamilWord) ||
                                prevTamilWord.endsWith('க்கு') || prevTamilWord.endsWith('க்க');
            if (needsSandhi) {
                if (lowerW.startsWith('k') || lowerW.startsWith('g')) sandhiPrefix = 'க்';
                else if (lowerW.startsWith('c') || lowerW.startsWith('s') || lowerW.startsWith('ch')) sandhiPrefix = 'ச்';
                else if (lowerW.startsWith('th') || lowerW.startsWith('dh')) sandhiPrefix = 'த்';
                else if (lowerW.startsWith('p') || lowerW.startsWith('b')) sandhiPrefix = 'ப்';
            }
        }

        let currTamil = '';

        // 1. Check Lexicon
        if (typeof wordOverrides !== 'undefined' && wordOverrides[lowerW]) {
            currTamil = wordOverrides[lowerW];
        } else if (/[\u0B80-\u0BFF]/.test(w) || /^[^a-zA-Z]+$/.test(w)) {
            currTamil = w;
        } else {
            // 2. Check Agglutination
            const agglunated = (typeof applyTamilAgglutination !== 'undefined') ? applyTamilAgglutination(w) : null;
            if (agglunated) {
                currTamil = agglunated;
            } else {
                // 3. Fallback to Anjal Syllable Engine
                currTamil = parseAnjalWord(w);
            }
        }

        if (sandhiPrefix && prevTamilWord && result.endsWith(' ')) {
            // Attach Sandhi consonant to previous word or before current word
            result = result.substring(0, result.length - 1) + sandhiPrefix + ' ';
        }

        result += currTamil;
        if (/[\u0B80-\u0BFF]/.test(currTamil.trim())) {
            prevTamilWord = currTamil.trim();
        }
    }

    return result;
}


function parseAnjalWord(s) {
    // Vowel Definitions (Standalone & Signs)
    const vowels = [
        { keys: ['aai', 'aay'], uni: 'ஆய்', mark: 'ாய்' },
        { keys: ['ai'], uni: 'ஐ', mark: 'ை' },
        { keys: ['au', 'ou'], uni: 'ஔ', mark: 'ௌ' },
        { keys: ['aa', 'a=', 'A'], uni: 'ஆ', mark: 'ா' },
        { keys: ['ii', 'ee', 'i=', 'I'], uni: 'ஈ', mark: 'ீ' },
        { keys: ['uu', 'oo', 'u=', 'U'], uni: 'ஊ', mark: 'ூ' },
        { keys: ['ee', 'ae', 'e=', 'E'], uni: 'ஏ', mark: 'ே' },
        { keys: ['oo', 'oa', 'o=', 'O'], uni: 'ஓ', mark: 'ோ' },
        { keys: ['a'], uni: 'அ', mark: '' },
        { keys: ['i'], uni: 'இ', mark: 'ி' },
        { keys: ['u'], uni: 'உ', mark: 'ு' },
        { keys: ['e'], uni: 'எ', mark: 'ெ' },
        { keys: ['o'], uni: 'ஒ', mark: 'ொ' },
        { keys: ['q', 'k:'], uni: 'ஃ', mark: '' }
    ];

    // Multi-consonant clusters
    const clusters = [
        { keys: ['ksha', 'K'], uni: 'க்ஷ' },
        { keys: ['sri', 'SRI'], uni: 'ஸ்ரீ' },
        { keys: ['tth'], uni: 'த்த' },
        { keys: ['ndh', 'nth'], uni: 'ந்த' },
        { keys: ['nch', 'nnj'], uni: 'ஞ்ச' },
        { keys: ['ngk', 'nkk', 'nga', 'nka'], uni: 'ங்க' },
        { keys: ['kk'], uni: 'க்க' },
        { keys: ['pp'], uni: 'ப்ப' },
        { keys: ['tt'], uni: 'ட்ட' },
        { keys: ['cc', 'chh'], uni: 'ச்ச' },
        { keys: ['rr'], uni: 'ற்ற' },
        { keys: ['nn'], uni: 'ன்ன' },
        { keys: ['mm'], uni: 'ம்ம' },
        { keys: ['ll'], uni: 'ல்ல' },
        { keys: ['LL'], uni: 'ள்ள' },
        { keys: ['yy'], uni: 'ய்ய' },
        { keys: ['vv'], uni: 'வ்வ' }
    ];

    // Single Consonants
    const singleCons = [
        { keys: ['th', 'dh'], uni: 'த' },
        { keys: ['ng'], uni: 'ங' },
        { keys: ['nj', 'gn'], uni: 'ஞ' },
        { keys: ['zh'], uni: 'ழ' },
        { keys: ['ch'], uni: 'ச' },
        { keys: ['sh'], uni: 'ஷ' },
        { keys: ['k', 'g', 'gh'], uni: 'க' },
        { keys: ['c', 's'], uni: 'ச' },
        { keys: ['t', 'd', 'T'], uni: 'ட' },
        { keys: ['N'], uni: 'ண' },
        { keys: ['n'], uni: 'ந', alt: 'ன' },
        { keys: ['p', 'b', 'bh', 'f'], uni: 'ப' },
        { keys: ['m'], uni: 'ம' },
        { keys: ['y'], uni: 'ய' },
        { keys: ['r'], uni: 'ர' },
        { keys: ['R'], uni: 'ற' },
        { keys: ['l'], uni: 'ல' },
        { keys: ['L'], uni: 'ள' },
        { keys: ['z'], uni: 'ழ' },
        { keys: ['v', 'w'], uni: 'வ' },
        { keys: ['j'], uni: 'ஜ' },
        { keys: ['h'], uni: 'ஹ' }
    ];

    let out = '';
    let i = 0;
    const len = s.length;

    while (i < len) {
        // 1. Try Cluster
        let foundCluster = null;
        for (let cl of clusters) {
            for (let k of cl.keys) {
                if (s.startsWith(k, i)) {
                    foundCluster = { key: k, uni: cl.uni };
                    break;
                }
            }
            if (foundCluster) break;
        }

        if (foundCluster) {
            out += foundCluster.uni;
            i += foundCluster.key.length;
            continue;
        }

        // 2. Try Single Consonant
        let foundCons = null;
        for (let sc of singleCons) {
            for (let k of sc.keys) {
                if (s.startsWith(k, i)) {
                    foundCons = { key: k, uni: sc.uni, alt: sc.alt };
                    break;
                }
            }
            if (foundCons) break;
        }

        if (foundCons) {
            i += foundCons.key.length;

            // Handle 'n' (Word initial vs internal)
            let baseUni = foundCons.uni;
            if (foundCons.key === 'n') {
                if (i > foundCons.key.length) {
                    baseUni = 'ன';
                }
            }

            // Check following Vowel
            let foundVow = null;
            for (let v of vowels) {
                for (let k of v.keys) {
                    if (s.startsWith(k, i)) {
                        foundVow = { key: k, mark: v.mark };
                        break;
                    }
                }
                if (foundVow) break;
            }

            if (foundVow) {
                out += baseUni + foundVow.mark;
                i += foundVow.key.length;
            } else {
                out += baseUni + '்';
            }
            continue;
        }

        // 3. Try Standalone Vowel
        let foundVow = null;
        for (let v of vowels) {
            for (let k of v.keys) {
                if (s.startsWith(k, i)) {
                    foundVow = { key: k, uni: v.uni };
                    break;
                }
            }
            if (foundVow) break;
        }

        if (foundVow) {
            out += foundVow.uni;
            i += foundVow.key.length;
        } else {
            out += s[i];
            i++;
        }
    }

    return out;
}
