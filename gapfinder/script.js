/**
 * SRI JAIGANESH INDUSTRY - BUG FIXED VERSION
 */

let scene, camera, renderer, modelGroup, controls, isSpinning = false;
let lastUnit = "in"; 

// FIX: Changed keys to match the HTML IDs exactly
const CONVERSION = { mm: 1, cm: 10, in: 25.4 };
const DEFAULTS = { 
    totalWidth: "48", 
    totalHeight: "36", 
    fFace: "1 1/2", 
    fDepth: "1 1/2", 
    barCount: 7, 
    barFace: "3/4", 
    barDepth: "3/4", 
    zOffset: 0 
};

window.onload = () => {
    init3D();
    setupEventListeners();
    calculate();
};

// --- FRACTIONAL ENGINE ---
function parseFraction(input) {
    const str = input.toString().trim();
    if (!str.includes('/') && !str.includes(' ')) return parseFloat(str) || 0;
    let parts = str.split(' ');
    let whole = 0, fracStr = "";
    if (parts.length > 1) { 
        whole = parseFloat(parts[0]) || 0; 
        fracStr = parts[1]; 
    } else { 
        fracStr = parts[0]; 
    }
    if (fracStr.includes('/')) {
        let f = fracStr.split('/');
        return whole + (parseFloat(f[0]) / (parseFloat(f[1]) || 1));
    }
    return parseFloat(str) || 0;
}

function toFraction(val) {
    const whole = Math.floor(val);
    const rem = val - whole;
    const sixteenths = Math.round(rem * 16);
    if (sixteenths === 0) return whole === 0 ? "0" : `${whole}"`;
    if (sixteenths === 16) return `${whole + 1}"`;
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const common = gcd(sixteenths, 16);
    const f = `${sixteenths/common}/${16/common}`;
    return whole === 0 ? `${f}"` : `${whole} ${f}"`;
}

function format(val, unit) {
    if (unit === 'in') return toFraction(val / 25.4);
    if (unit === 'cm') return (val / 10).toFixed(2) + " cm";
    return (val).toFixed(1) + " mm";
}

// --- CORE CALCULATION ---
function calculate() {
    const unitEl = document.getElementById('unitSelect');
    if(!unitEl) return;
    const unit = unitEl.value;
    
    const getMM = (id) => {
        let el = document.getElementById(id);
        if(!el) return 0;
        let val = el.value;
        if (unit === 'in') return parseFraction(val) * CONVERSION.in;
        return (parseFloat(val) || 0) * CONVERSION[unit];
    };

    const L = getMM('totalWidth'), H = getMM('totalHeight');
    const fF = getMM('fFace'), fD = getMM('fDepth');
    const n = Math.floor(parseFloat(document.getElementById('barCount').value)) || 0;
    const bF = getMM('barFace'), bD = getMM('barDepth');
    const zOff = parseFloat(document.getElementById('zOffset').value) || 0;

    const offsetDisp = document.getElementById('offsetDisp');
    if(offsetDisp) offsetDisp.innerText = zOff + " mm";

    const gap = n > 0 ? (L - (n * bF)) / (n + 1) : L;
    const outerW = L + (fF * 2), outerH = H + (fF * 2);
    const totalMat = (n * H) + (outerW * 2) + (outerH * 2);
    const diag = Math.sqrt(outerW**2 + outerH**2);

    document.getElementById('gapRes').innerText = format(gap, unit);
    document.getElementById('spacerRes').innerText = format(gap, unit);
    document.getElementById('diagRes').innerText = format(diag, unit);
    document.getElementById('totalLenRes').innerText = format(totalMat, unit);

    let rows = "";
    let cur = gap;
   for(let i = 1; i <= n; i++) {
    rows += `
    <tr class="hover:bg-slate-800/50 transition-colors">
        <td class="p-4 font-bold text-slate-500">ROD ${i}</td>
        <td class="p-4 text-emerald-400 tabular-nums">${format(cur, unit)}</td>
        <td class="p-4 text-blue-400 font-black bg-blue-400/5 tabular-nums">${format(cur + bF/2, unit)}</td>
        <td class="p-4 text-rose-400 tabular-nums">${format(cur + bF, unit)}</td>
    </tr>`;
    cur += (gap + bF);
}
    document.getElementById('markTable').innerHTML = rows;
    updateModel(L, H, fF, fD, bF, bD, n, gap, zOff);
}

// --- 3D ENGINE ---
function init3D() {
    const container = document.getElementById('three-container');
    if(!container) return;
    scene = new THREE.Scene(); 
    scene.background = new THREE.Color(0xffffff);
    camera = new THREE.PerspectiveCamera(35, container.offsetWidth/450, 1, 1000000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, 450);
    container.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
    script.onload = () => { 
        controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;      // Enable inertia
controls.dampingFactor = 0.05;     // Lower = smoother/heavier
controls.screenSpacePanning = true;
controls.rotateSpeed = 0.8;        // Slightly slower for better control
        animate(); 
    };
    document.head.appendChild(script);
}

// --- UPDATED 3D ENGINE LOGIC ---

function updateModel(L, H, fF, fD, bF, bD, n, gap, zOff) {
    if (modelGroup) scene.remove(modelGroup);
    modelGroup = new THREE.Group();
    
    const fMat = new THREE.MeshStandardMaterial({ color: 0x922b21 }); // Frame color
    const rMat = new THREE.MeshStandardMaterial({ color: 0x111111 }); // Rod color

    // 1. Create Rods
    let startX = -(L/2) + gap + (bF/2);
    for(let i = 0; i < n; i++) {
        const rod = new THREE.Mesh(new THREE.BoxGeometry(bF, H, bD), rMat);
        rod.position.set(startX, 0, zOff); 
        modelGroup.add(rod);
        startX += (gap + bF);
    }

    // 2. Create Frame
    const hG = new THREE.BoxGeometry(L + fF*2, fF, fD);
    const vG = new THREE.BoxGeometry(fF, H + fF*2, fD);
    
    const top = new THREE.Mesh(hG, fMat); top.position.y = H/2 + fF/2;
    const bot = top.clone(); bot.position.y = -(H/2 + fF/2);
    const left = new THREE.Mesh(vG, fMat); left.position.x = -(L/2 + fF/2);
    const right = left.clone(); right.position.x = (L/2 + fF/2);
    
    modelGroup.add(top, bot, left, right);
    scene.add(modelGroup);

    // 3. AUTO-FIT THE MODEL
    fitCameraToModel();
}

function fitCameraToModel() {
    if (!modelGroup) return;

    // Calculate the bounding box of the entire grill
    const box = new THREE.Box3().setFromObject(modelGroup);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Find the largest dimension to ensure it fits
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    
    // Calculate required distance with a 20% margin
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.2; 

    camera.position.set(center.x, center.y, cameraZ);
    
    // Update controls to rotate around the grill center
    if (controls) {
        controls.target.copy(center);
        controls.update();
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    if (controls.enableDamping) controls.update(); 
    
    if (isSpinning) {
        modelGroup.rotation.y += 0.005;
    }
    
    renderer.render(scene, camera);
}

// --- 3D INTERACTION FEATURES ---

// 1. SPIN LOGIC
function toggleSpin() {
    isSpinning = !isSpinning;
    const btn = document.getElementById('spinBtn');
    btn.style.background = isSpinning ? 'var(--emerald)' : 'rgba(0,0,0,0.7)';
}

// 2. FIT TO SCREEN LOGIC
function fitCameraToModel() {
    if (!modelGroup) return;

    const box = new THREE.Box3().setFromObject(modelGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Get the max dimension (Width or Height)
    const maxDim = Math.max(size.x, size.y);
    const fov = camera.fov * (Math.PI / 180);
    
    // Calculate distance so the grill fits perfectly with a small margin
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.3; // 30% padding

    camera.position.set(center.x, center.y, cameraZ);
    camera.lookAt(center);
    
    if (controls) {
        controls.target.copy(center);
        controls.update();
    }
}

// 3. FULL SCREEN LOGIC
function toggleFullScreen() {
    const container = document.getElementById('three-container');
    
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// 4. WINDOW RESIZE HANDLER (Enhanced for Full Screen & Retina Displays)
function onWindowResize() {
    const container = document.getElementById('three-container');
    if (!container || !renderer || !camera) return;

    // Get current container dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Update camera aspect ratio to prevent distortion
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Resize renderer and account for high-resolution (Retina) screens
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Optional: Re-center the model if needed after a major resize
    // fitCameraToModel(); 
}

window.addEventListener('resize', onWindowResize);

// Trigger immediately after a slight delay to ensure Full Screen transition is complete
document.addEventListener('fullscreenchange', () => {
    setTimeout(onWindowResize, 100);
});

function setupEventListeners() {
    const unitSelect = document.getElementById('unitSelect');
    if (!unitSelect) return;

    // 1. UNIT CONVERSION LOGIC
    unitSelect.addEventListener('change', (e) => {
        const newUnit = e.target.value;
        const inputIds = ['totalWidth', 'totalHeight', 'fFace', 'fDepth', 'barFace', 'barDepth'];

        inputIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            
            // Convert current value to MM base using the last known unit
            let valMM = (lastUnit === 'in') ? 
                parseFraction(el.value) * 25.4 : 
                parseFloat(el.value) * (lastUnit === 'cm' ? 10 : 1);

            if (isNaN(valMM)) return;

            // Update input box text to the new unit format
            if (newUnit === 'in') {
                el.value = toFraction(valMM / 25.4).replace('"', '');
            } else if (newUnit === 'cm') {
                el.value = (valMM / 10).toFixed(2);
            } else {
                el.value = (valMM).toFixed(1);
            }
        });

        lastUnit = newUnit;
        calculate();
        if (typeof fitCameraToModel === "function") fitCameraToModel();
    });

    // 2. REAL-TIME INPUT LISTENERS
    const inputs = ['totalWidth', 'totalHeight', 'fFace', 'fDepth', 'barCount', 'barFace', 'barDepth', 'zOffset'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                calculate();
                // Auto-fit camera for dimension changes, but not for depth/offset tweaks
                if (!['zOffset', 'fDepth', 'barDepth'].includes(id)) {
                    if (typeof fitCameraToModel === "function") fitCameraToModel();
                }
            });
        }
    });

    // 3. BUTTON LISTENERS (3D Controls & Actions)
    const buttons = {
        'spinBtn': toggleSpin,
        'centerBtn': fitCameraToModel,
        'fullBtn': toggleFullScreen,
        'resetBtn': () => {
            Object.keys(DEFAULTS).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = DEFAULTS[id];
            });
            lastUnit = "in";
            unitSelect.value = "in";
            calculate();
            if (typeof fitCameraToModel === "function") fitCameraToModel();
        },
        'printBtn': () => window.print(),
        'copyBtn': (typeof copyMeasurements === "function") ? copyMeasurements : null
    };

    // Safely attach click events
    Object.keys(buttons).forEach(id => {
        const el = document.getElementById(id);
        if (el && buttons[id]) {
            el.onclick = buttons[id];
        }
    });
}

function copyMeasurements() {
    const unit = document.getElementById('unitSelect').value;
    const L = document.getElementById('totalWidth').value;
    const H = document.getElementById('totalHeight').value;
    const gap = document.getElementById('gapRes').innerText;
    const barCount = document.getElementById('barCount').value;
    const totalLength = document.getElementById('totalLenRes').innerText;
    
    let text = `SRI JAIGANESH INDUSTRY - JOB SHEET\n`;
    text += `Dimensions: ${L} x ${H} (${unit})\n`;
    text += `Total Rods: ${barCount}\n`;
    text += `Clearance Gap: ${gap}\n`;
    text += `Total Length: ${totalLength}\n`;
    text += `----------------------------------\n`;

    const rows = document.querySelectorAll('#markTable tr');
    rows.forEach((row, i) => {
        const cells = row.querySelectorAll('td');
        if(cells.length > 0) {
            text += `Rod ${i+1}: Start ${cells[1].innerText} | Center ${cells[2].innerText}\n`;
        }
    });

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = "✅ COPIED!";
        setTimeout(() => btn.innerHTML = originalText, 2000);
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

function printReport() {
    window.print();
}
