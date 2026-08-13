// NOTE: This script ASSUMES that DENSITIES, SHEET_SIZES, and MATERIAL_DATA
// have been loaded into the global scope from 'material-data.js'

// ====================================================================
// === ELEMENTS (Assumes corresponding HTML IDs exist) ===
// ====================================================================

const sizeInput = document.getElementById('item-size');
const sizeInputGroupDiv = document.getElementById('item-size').parentElement;
const lenInput = document.getElementById('item-length');
const lenGroup = document.getElementById('length-group');
const list = document.getElementById('material-list');
const matInput = document.getElementById('item-material');
const qtyInput = document.getElementById('item-quantity');
const priceInput = document.getElementById('item-price');
const priceTypeInput = document.getElementById('price-type');
const wtDisplay = document.getElementById('weight-display');
const costDisplay = document.getElementById('cost-display'); // New
const shapeInput = document.getElementById('item-shape');
const shapeIconContainer = document.getElementById('shape-icon');
const addButton = document.getElementById('add-button');
const customInputGroup = document.getElementById('custom-input-group');
const customSizeInput = document.getElementById('custom-size');
const customSizeGroup = document.getElementById('custom-size-group');
const customLengthInput = document.getElementById('custom-length');
const customLengthGroup = document.getElementById('custom-length-group');
const customDescriptionInput = document.getElementById('custom-description');
const customDescLabel = document.getElementById('custom-desc-label');
const transportExtras = document.getElementById('transport-extras');
const transFrom = document.getElementById('trans-from');
const transTo = document.getElementById('trans-to');
const weightValLabel = document.getElementById('weight-val-label');
const qtyLabel = document.getElementById('qty-label');
const priceLabel = document.getElementById('price-label');
const customWeightInput = document.getElementById('custom-weight');
const customUnitInput = document.getElementById('custom-unit');

// Dashboard Elements
const totalWeightVal = document.getElementById('total-weight-val');
const totalItemsVal = document.getElementById('total-items-val');
const totalCostVal = document.getElementById('total-cost-val');

// Action Buttons
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const clearBtn = document.getElementById('clear-btn');
const whatsappBtn = document.getElementById('whatsapp-btn');

let selectedData = {};
const weightUnitGroup = customWeightInput.parentElement;
const unitGroup = customUnitInput.parentElement;

// --- K-FACTORS (Geometric Correction) ---
const K_FACTORS = {
    'Angle': 1.02,
    'Channel': 1.04,
    'IBeam': 1.03,
    'SquareRod': 1.0,
    'FlatBar': 1.0,
    'RoundRod': 1.0,
    'Tube': 1.0,
    'Pipe': 1.0
};


// ====================================================================
// === VISUALS & DROPDOWN LOGIC ===
// ====================================================================

function getShapeLabel(shape) {
    const shapeObj = shapeInput.querySelector(`option[value="${shape}"]`);
    return shapeObj ? shapeObj.textContent : shape;
}

function updateLabels() {
    const shape = shapeInput.value;
    const pType = priceTypeInput.value;

    // Default Labels
    if (qtyLabel) qtyLabel.textContent = 'Qty (Nos)';
    if (priceLabel) priceLabel.textContent = 'Price (₹)';
    if (weightValLabel) weightValLabel.textContent = 'Wt / Val';
    if (customDescLabel) customDescLabel.textContent = 'Custom Description';

    if (shape === 'parts') {
        if (customDescLabel) customDescLabel.textContent = 'Part Name';
        if (priceLabel) priceLabel.textContent = pType === 'nos' ? 'Price / Part' : 'Price / Kg';
        if (weightValLabel) weightValLabel.textContent = 'Weight / Part';
    } else if (shape === 'transport') {
        if (customDescLabel) customDescLabel.textContent = 'Transport Name';
        if (priceLabel) priceLabel.textContent = 'Transport Rate';
    } else if (shape === 'service') {
        if (customDescLabel) customDescLabel.textContent = 'Service Name';
        if (priceLabel) priceLabel.textContent = 'Service Charge';
    } else if (shape === 'custom') {
        if (priceLabel) priceLabel.textContent = pType === 'nos' ? 'Price / Unit' : 'Price / Kg';
    }
    
    // Dynamic Qty Label for Custom/Parts
    if (shape === 'custom' || shape === 'parts') {
        const cUnit = customUnitInput.value;
        if (['nos', 'set', 'roll', 'pkt', 'box', 'lot', 'trip'].includes(cUnit)) {
             if (qtyLabel) qtyLabel.textContent = `Qty (${cUnit})`;
        } else {
             if (qtyLabel) qtyLabel.textContent = 'Qty (Nos)';
        }
    }
}

function updateShapeIcon() {
    const shape = shapeInput.value;
    let iconName = shape;
    
    if (['parts', 'custom'].includes(shape)) iconName = 'custom';
    else if (['transport', 'service', 'others', 'consumables'].includes(shape)) iconName = 'consumables'; 
    
    shapeIconContainer.innerHTML = `<img src="icons/${iconName}.svg" style="width:100%; height:100%;" alt="${shape}" onerror="this.src='icons/custom.svg'">`;
}

function updateSizeDropdown() {
    const shape = shapeInput.value;
    const specs = MATERIAL_DATA[shape] || [];
    sizeInput.innerHTML = '';

    // Update Icon
    updateShapeIcon();
    // Update Labels
    updateLabels();

    // Reset visibility of core input groups
    sizeInputGroupDiv.style.display = 'flex';
    customInputGroup.style.display = 'none';
    lenGroup.style.display = 'flex';
    if (customSizeGroup) customSizeGroup.style.display = 'none';
    if (customLengthGroup) customLengthGroup.style.display = 'none';
    
    // Default visibility for extras
    if (transportExtras) transportExtras.style.display = 'none';
    if (weightUnitGroup) weightUnitGroup.style.display = 'flex';
    if (unitGroup) unitGroup.style.display = 'flex';
    
    // Reset inputs
    transFrom.value = ''; 
    transTo.value = '';

    if (shape === 'custom' || shape === 'parts') { 
        sizeInputGroupDiv.style.display = 'none';
        lenGroup.style.display = 'none';
        customInputGroup.style.display = 'flex';
        if (customSizeGroup) customSizeGroup.style.display = 'flex';
        if (customLengthGroup) customLengthGroup.style.display = 'flex';
        
        if (shape === 'parts') {
             customDescriptionInput.placeholder = 'e.g., Hinge, Bolt, Bearing';
        } else {
             customDescriptionInput.placeholder = 'e.g., Grinding Wheel';
        }

        customDescriptionInput.value = '';
        customWeightInput.value = '';
        customUnitInput.value = 'kg';
        if (customSizeInput) customSizeInput.value = '';
        if (customLengthInput) customLengthInput.value = '';
        
    } else if (['transport', 'service', 'others'].includes(shape)) {
        sizeInputGroupDiv.style.display = 'none';
        lenGroup.style.display = 'none';
        customInputGroup.style.display = 'flex';
        
        // Force /No price type for non-weight items to avoid 0 cost error if /Kg was selected
        if(priceTypeInput) priceTypeInput.value = 'nos';
        
        // Hide Weight/Val Inputs for Charges
        if (weightUnitGroup) weightUnitGroup.style.display = 'none'; 
        if (unitGroup) unitGroup.style.display = 'none'; 
        
        customWeightInput.value = 0;
        customUnitInput.value = 'nos';

        // Specific setups
        if (shape === 'transport') {
            customDescriptionInput.placeholder = 'e.g., Lorry Hire, Tempo';
            if (transportExtras) {
                transportExtras.style.display = 'flex';
            }
        } else if (shape === 'service') {
            customDescriptionInput.placeholder = 'e.g., Lathe Work, Bending';
        } else { // others
             customDescriptionInput.placeholder = 'e.g., Miscellaneous';
        }

    } else if (shape === 'consumables') {
        // Force /No for consumables
        if(priceTypeInput) priceTypeInput.value = 'nos';
        lenGroup.style.display = 'none';
        customInputGroup.style.display = 'flex';
        if (weightUnitGroup) weightUnitGroup.style.display = 'none'; 
        if (unitGroup) unitGroup.style.display = 'none';
        
        // Force /No for consumables
        if(priceTypeInput) priceTypeInput.value = 'nos';

        specs.forEach(spec => {
            const opt = document.createElement('option');
            opt.value = JSON.stringify(spec);
            opt.text = spec.label;
            sizeInput.appendChild(opt);
        });

        customDescriptionInput.value = '';
        customWeightInput.value = '';
        customUnitInput.value = 'nos';
        
    } else if (shape === 'sheet' || shape === 'plate') {
        lenGroup.style.display = 'none'; 
        
        specs.forEach(spec => {
            SHEET_SIZES.forEach(sz => {
                const opt = document.createElement('option');
                opt.value = JSON.stringify({ ...spec, sheetW: sz.W, sheetL: sz.L, sizeLabel: sz.label });
                opt.text = `${spec.label} - ${sz.label}`;
                sizeInput.appendChild(opt);
            });
        });

    } else { 
        lenGroup.style.display = 'flex'; 
        
        specs.forEach(spec => {
            const opt = document.createElement('option');
            opt.value = JSON.stringify(spec);
            opt.text = spec.label;
            sizeInput.appendChild(opt);
        });
    }
    
    calculateTotalWeight();
}


// ====================================================================
// === WEIGHT CALCULATION ===
// ====================================================================

function calculateTotalWeight() {
    const shape = shapeInput.value;
    const qty = parseFloat(qtyInput.value) || 0;
    let totalWt = 0;
    let unit = 'kg';

    if (shape === 'consumables' || ['transport', 'service', 'others'].includes(shape)) { 
        totalWt = 0;
        unit = 'N/A';
    } else if (shape === 'custom' || shape === 'parts') {
        const customWeight = parseFloat(customWeightInput.value) || 0;
        unit = customUnitInput.value;
        
        if(['kg', 'ton', 'gm'].includes(unit)) {
             let multiplier = 1;
             if(unit === 'ton') multiplier = 1000;
             if(unit === 'gm') multiplier = 0.001;
             totalWt = customWeight * multiplier * qty;
        } else {
             totalWt = 0;
        }
    } else {
        if (!sizeInput.value) {
            wtDisplay.textContent = 'Approx. 0.00 kg';
            return { weight: 0, unit: 'kg' };
        }
        const data = JSON.parse(sizeInput.value);
        selectedData = data;
        const density = DENSITIES[matInput.value];
        const msDensity = DENSITIES['Mild_Steel']; 

        if (data.weight && shape !== 'sheet' && shape !== 'plate') {
            const len_m = parseFloat(lenInput.value) || 0;
            const baseWeight = data.weight * len_m; 
            totalWt = baseWeight * (density / msDensity) * qty;
        } else {
            let vol_m3 = 0;

            if (shape === 'sheet' || shape === 'plate') {
                vol_m3 = (data.T / 1000) * (data.sheetW / 1000) * (data.sheetL / 1000);
            } else {
                const len_m = parseFloat(lenInput.value) || 0;
                const T = (data.T || 0) / 1000, H = (data.H || 0) / 1000, W = (data.W || 0) / 1000, OD = (data.OD || 0) / 1000;
                let area = 0;

                if (data.type === 'RoundRod') area = Math.PI * Math.pow(OD / 2, 2); 
                else if (data.type === 'Angle') area = (H * T) + ((W - T) * T); 
                else if (data.type === 'FlatBar' || data.type === 'SquareRod' || data.type === 'Flat') area = H * T; 
                else if (data.type === 'Tube') area = (H * W) - ((H - 2 * T) * (W - 2 * T)); 
                else if (data.type === 'Pipe') area = Math.PI * (Math.pow(OD / 2, 2) - Math.pow((OD - 2 * T) / 2, 2)); 
                else if (data.type === 'Channel') area = (H * T) + 2 * (W - T) * T;
                else if (data.type === 'IBeam') area = (H - 2 * T) * T + 2 * W * T; 

                const kFactor = K_FACTORS[data.type] || 1.0;
                area = area * kFactor;

                vol_m3 = area * len_m;
            }
            totalWt = vol_m3 * density * qty;
        }
    }

    // Display Logic
    let displayWtText = 'N/A';
    if(shape === 'parts' || shape === 'custom') {
         const val = customWeightInput.value;
         const u = customUnitInput.value;
         displayWtText = (val && u) ? `${val} ${u}` : '0.00 kg';
    } else if (['transport', 'service', 'others', 'consumables'].includes(shape)) {
        displayWtText = 'N/A';
    } else {
        displayWtText = `${totalWt.toFixed(2)} kg`;
    }
    
    wtDisplay.textContent = `Approx. ${displayWtText}`;
    
    // --- Cost Display Logic ---
    const price = parseFloat(priceInput.value) || 0;
    const priceType = priceTypeInput.value;
    let currentCost = 0;

    if (price > 0) {
        if (priceType === 'nos') {
            currentCost = price * qty;
        } else if (priceType === 'kg') {
            const numericWt = parseFloat(totalWt) || 0;
            currentCost = price * numericWt;
        }
    }

    if (currentCost > 0) {
        costDisplay.textContent = `₹${currentCost.toFixed(2)}`;
        costDisplay.style.display = 'flex';
    } else {
        costDisplay.style.display = 'none';
    }
    // --------------------------
    
    return { weight: totalWt.toFixed(2), unit: unit, rawVal: customWeightInput.value, rawUnit: customUnitInput.value };
}


// ====================================================================
// === AUTOSAVE & RESTORE ===
// ====================================================================
const AUTOSAVE_KEY = 'matList_autosave';

function saveCurrentState() {
    if (list.innerHTML.trim() === "") {
        localStorage.removeItem(AUTOSAVE_KEY);
    } else {
        localStorage.setItem(AUTOSAVE_KEY, list.innerHTML);
    }
}

function migrateListStructure() {
    list.querySelectorAll('li .weight-col').forEach(col => {
        if (!col.querySelector('.weight-val')) {
             const oldSpan = col.querySelector('span'); 
             let textPart = '';
             Array.from(col.childNodes).forEach(node => {
                if (node.nodeType === 3) textPart += node.textContent; 
             });
             
             const wSpan = document.createElement('span');
             wSpan.className = 'weight-val';
             wSpan.textContent = textPart.trim();
             
             if (oldSpan) {
                 oldSpan.classList.add('price-val');
                 oldSpan.style.display = 'block';
             }
             
             col.innerHTML = '';
             col.appendChild(wSpan);
             if (oldSpan) col.appendChild(oldSpan);
        }
    });
}

function restoreState() {
    const savedHtml = localStorage.getItem(AUTOSAVE_KEY);
    if (savedHtml) {
        list.innerHTML = savedHtml;
        migrateListStructure();
        // Re-attach listeners to restored items
        list.querySelectorAll('li .delete-button').forEach(btn => {
            btn.addEventListener('click', function() {
                this.parentElement.remove();
                updateDashboard();
            });
        });
        updateDashboard();
    }
}

// ====================================================================
// === DASHBOARD & LIST MANAGEMENT ===
// ====================================================================

function updateDashboard() {
    let totalW = 0;
    let totalC = 0;
    let count = 0;
    const items = list.querySelectorAll('li');
    
    items.forEach(item => {
        count++;
        // Extract stored numeric data attributes if available, else parse text
        const w = parseFloat(item.dataset.weight || 0);
        const c = parseFloat(item.dataset.cost || 0);
        totalW += w;
        totalC += c;
    });

    totalWeightVal.textContent = totalW.toFixed(2) + ' kg';
    totalItemsVal.textContent = count;
    totalCostVal.textContent = totalC.toFixed(2);

    // Update Print Summary (Sync with dashboard)
    const printTotalWeight = document.getElementById('print-total-weight-val');
    const printTotalCost = document.getElementById('print-total-cost-val');
    if (printTotalWeight) printTotalWeight.textContent = totalW.toFixed(2) + ' kg';
    if (printTotalCost) printTotalCost.textContent = '₹' + totalC.toFixed(2);
    
    saveCurrentState(); // Auto-save on every update
}

function addItemFromInput() {
    const shape = shapeInput.value;
    const shapeLabel = getShapeLabel(shape);
    const mat = matInput.value;
    const qty = parseFloat(qtyInput.value) || 0;
    const len = parseFloat(lenInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    const priceType = priceTypeInput.value; 
    
    // --- Validation ---
    if (qty <= 0) {
        showAlert("Quantity must be at least 1.");
        return;
    }
    
    // For shapes that require length
    const requiresLength = !['sheet', 'plate', 'consumables', 'custom', 'parts', 'transport', 'service', 'others'].includes(shape);
    if (requiresLength && len <= 0) {
        showAlert("Please enter a valid Length.");
        return;
    }
    // ------------------

    const calc = calculateTotalWeight();
    
    let name, spec, numericWeight = 0;
    let itemTitle = '', itemSize = '', itemLength = '';

    // 1. Determine Name and Spec
    let qtyUnit = 'nos';

    if (shape === 'custom' || shape === 'parts') {
        name = customDescriptionInput.value || (shape === 'parts' ? 'Part' : 'Custom Item');
        itemTitle = name;
        itemSize = customSizeInput.value || '';
        const unit = customUnitInput.value;
        const val = customWeightInput.value;
        
        // Determine Qty Unit
        if (['nos', 'set', 'roll', 'pkt', 'box', 'lot', 'trip'].includes(unit)) {
             qtyUnit = unit;
        }
        
        if(['kg', 'ton', 'gm'].includes(unit)) {
             numericWeight = parseFloat(calc.weight);
        } else {
             numericWeight = 0;
        }
        
        let specParts = [];
        if (val && unit) specParts.push(`Val: ${val} ${unit}`);
        
        const len = parseFloat(customLengthInput.value) || 0;
        if (len > 0) specParts.push(`Length: ${len} m`);
        if (len > 0) itemLength = len;
        
        spec = specParts.join(' | ') || '-';
        
    } else if (shape === 'transport') {
        name = customDescriptionInput.value || 'Transport Charge';
        itemTitle = name;
        const fromP = transFrom.value;
        const toP = transTo.value;
        spec = (fromP || toP) ? `From: ${fromP || '?'} To: ${toP || '?'}` : '-';
        numericWeight = 0;

    } else if (shape === 'service') {
        name = customDescriptionInput.value || 'Service Charge';
        itemTitle = name;
        spec = '-';
        numericWeight = 0;
        
    } else if (shape === 'others') {
        name = customDescriptionInput.value || 'Other Charge';
        itemTitle = name;
        spec = '-';
        numericWeight = 0;

    } else if (shape === 'consumables') {
        name = customDescriptionInput.value || 'Consumable Item';
        itemTitle = name;
        if (sizeInput.selectedIndex >= 0) {
            spec = `Type: ${sizeInput.options[sizeInput.selectedIndex].text}`;
        } else {
            spec = 'Type: N/A';
        }
        numericWeight = 0;
    } else {
        if (!sizeInput.value) return;
        const data = JSON.parse(sizeInput.value);
        itemTitle = `${mat} ${data.type}`;
        itemSize = data.label;
        if (shape === 'sheet' || shape === 'plate') {
            name = `${itemTitle} ${itemSize}`;
            spec = `${data.sizeLabel}`;
        } else {
            name = `${itemTitle} ${itemSize}`;
            spec = `Length: ${lenInput.value} m`;
            itemLength = lenInput.value;
        }
        numericWeight = parseFloat(calc.weight);
    }
    
    // 2. Determine Display Weight String 
    let weightDisplayStr = '';
    if (['transport', 'service', 'others', 'consumables'].includes(shape)) {
        weightDisplayStr = '-';
    } else {
        if (shape === 'custom' || shape === 'parts') {
             const val = customWeightInput.value;
             const unit = customUnitInput.value;
             weightDisplayStr = (val && unit) ? `${val} ${unit}` : '-';
        } else {
             weightDisplayStr = `${calc.weight} kg`;
        }
    }
    
    // 3. Cost Calculation
    let cost = 0;
    let priceBasis = '';

    if (price > 0) {
        if (priceType === 'nos') {
            cost = price * qty;
            priceBasis = `@ ₹${price}/${qtyUnit === 'nos' ? 'no' : qtyUnit}`;
        } else if (priceType === 'kg') {
            if (numericWeight > 0) {
                cost = price * numericWeight;
                priceBasis = `@ ₹${price}/kg`;
            } else {
                cost = 0;
                priceBasis = `(Wt Req)`;
            }
        }
    }
    
    const li = document.createElement('li');
    li.dataset.weight = numericWeight || 0; // Store raw number for summation
    li.dataset.cost = cost;
    if (itemTitle) li.dataset.itemTitle = itemTitle;
    if (itemSize) li.dataset.itemSize = itemSize;
    if (itemLength) li.dataset.itemLength = itemLength;

    li.innerHTML = `
        <div class="shape-col"><span class="shape-tag">${shapeLabel}</span></div>
        <div class="item-name">${name}<span class="item-spec">${spec}</span></div>
        <div class="weight-col">
            <span class="weight-val">${weightDisplayStr}</span>
            <span class="price-val" style="display:block; font-size:0.8em; color:#2e7d32;">
                ${cost > 0 ? '₹'+cost.toFixed(2) : '₹0.00'} 
                ${priceBasis ? '<br><span style="font-size:0.85em; color:#555;">' + priceBasis + '</span>' : ''}
            </span>
        </div>
        <div class="qty-col">${qty} ${qtyUnit}</div>
        <div class="delete-button no-print" title="Remove Item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </div>
    `;
    list.appendChild(li);

    li.querySelector('.delete-button').addEventListener('click', function() {
        this.parentElement.remove();
        updateDashboard();
    });
    
    updateDashboard();
}

// ====================================================================
// === STORAGE & SHARING ===
// ====================================================================

// Modal Elements
const loadModal = document.getElementById('load-modal');
const alertModal = document.getElementById('alert-modal');
const alertMessage = document.getElementById('alert-message');
const alertOkBtn = document.getElementById('alert-ok-btn');
const savedProjectsList = document.getElementById('saved-projects-list');
const closeModalBtn = document.getElementById('close-modal-btn');
const closeModalX = document.querySelector('.close-modal');
const exportJsonBtn = document.getElementById('export-json-btn'); 
const importJsonBtn = document.getElementById('import-json-btn'); 
const importFileInput = document.getElementById('import-file-input'); 

// Print Settings Modal Elements
const printSettingsModal = document.getElementById('print-settings-modal');
const printSettingsBtn = document.getElementById('print-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const closeSettingsX = document.getElementById('close-settings-x');
const printPageSize = document.getElementById('print-page-size'); // New
const printNowBtn = document.getElementById('print-now-btn'); // New

// Confirm Modal Elements
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmOkBtn = document.getElementById('confirm-ok-btn');
const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
let confirmCallback = null;

// --- Print Settings Logic ---
function updatePageSize() {
    const size = printPageSize.value || 'A4';
    let styleTag = document.getElementById('dynamic-page-size');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-page-size';
        styleTag.media = 'print';
        document.head.appendChild(styleTag);
    }
    styleTag.textContent = `@page { size: ${size}; margin: 10mm; }`;
}

if (printPageSize) {
    printPageSize.addEventListener('change', updatePageSize);
}

if (printSettingsBtn) {
    printSettingsBtn.addEventListener('click', () => {
        printSettingsModal.style.display = 'flex';
    });
}

function closeSettings() {
    printSettingsModal.style.display = 'none';
}

if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
if (closeSettingsX) closeSettingsX.addEventListener('click', closeSettings);
if (printNowBtn) {
    printNowBtn.addEventListener('click', () => {
        closeSettings(); // Close first so modal background doesn't potentially glitch
        window.print();
    });
}

// Initialize Page Size
updatePageSize();

// --- Alert Modal Logic ---
function showAlert(msg) {
    alertMessage.textContent = msg;
    alertModal.style.display = 'flex';
}

function closeAlert() {
    alertModal.style.display = 'none';
}

alertOkBtn.addEventListener('click', closeAlert);

// --- Confirm Modal Logic ---
function showConfirm(msg, callback) {
    confirmMessage.textContent = msg;
    confirmModal.style.display = 'flex';
    confirmCallback = callback;
}

confirmOkBtn.onclick = () => {
    if (confirmCallback) confirmCallback();
    confirmModal.style.display = 'none';
};

confirmCancelBtn.onclick = () => {
    confirmModal.style.display = 'none';
};

// --- Load/Save Modal Logic ---
function openModal() {
    loadModal.style.display = 'flex';
    renderSavedProjects();
}

function closeModal() {
    loadModal.style.display = 'none';
}

// Close modal event listeners
closeModalBtn.addEventListener('click', closeModal);
closeModalX.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target == loadModal) closeModal();
    if (event.target == alertModal) closeAlert();
    if (event.target == confirmModal) confirmModal.style.display = 'none';
    if (event.target == printSettingsModal) closeSettings();
});

// --- Export / Import Logic ---

function exportJSON() {
    const projects = localStorage.getItem('matList_projects');
    if (!projects || projects === '{}') {
        showAlert("No saved projects to export.");
        return;
    }
    
    const blob = new Blob([projects], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `material-list-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function triggerImport() {
    importFileInput.click();
}

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (typeof importedData !== 'object' || importedData === null) {
                throw new Error("Invalid JSON structure");
            }

            const currentData = JSON.parse(localStorage.getItem('matList_projects') || '{}');
            let addedCount = 0;
            let overwrittenCount = 0;

            for (const [name, items] of Object.entries(importedData)) {
                if (currentData[name]) {
                    // Unique name generation
                    let newName = name;
                    let counter = 1;
                    while (currentData[newName]) {
                        newName = `${name} (${counter})`;
                        counter++;
                    }
                    currentData[newName] = items;
                    if(newName !== name) overwrittenCount++; 
                    addedCount++;
                } else {
                    currentData[name] = items;
                    addedCount++;
                }
            }

            localStorage.setItem('matList_projects', JSON.stringify(currentData));
            showAlert(`Import Successful!\nAdded: ${addedCount} project(s).`);
            renderSavedProjects(); 
            
        } catch (error) {
            console.error(error);
            showAlert("Failed to import. Invalid JSON file.");
        }
        importFileInput.value = '';
    };
    reader.readAsText(file);
}

exportJsonBtn.addEventListener('click', exportJSON);
importJsonBtn.addEventListener('click', triggerImport);
importFileInput.addEventListener('change', importJSON);


function saveList() {
    const items = [];
    if (list.children.length === 0) {
        showAlert("The material list is empty! Add items before saving.");
        return;
    }

    list.querySelectorAll('li').forEach(li => {
        items.push({
            html: li.innerHTML,
            w: parseFloat(li.dataset.weight) || 0,
            c: parseFloat(li.dataset.cost) || 0,
            t: li.dataset.itemTitle || '',
            s: li.dataset.itemSize || '',
            l: li.dataset.itemLength || ''
        });
    });

    let projectName = prompt("Enter a name for this project:", "My Project");
    if (projectName) {
        // Get existing projects
        const projects = JSON.parse(localStorage.getItem('matList_projects') || '{}');
        
        // Define save action
        const doSave = () => {
            projects[projectName] = items;
            localStorage.setItem('matList_projects', JSON.stringify(projects));
            showAlert(`Project "${projectName}" saved successfully!`);
        };

        // Check for overwrite
        if (projects[projectName]) {
            showConfirm(`Project "${projectName}" already exists. Overwrite?`, doSave);
        } else {
            doSave();
        }
    }
}

function renderSavedProjects() {
    const projects = JSON.parse(localStorage.getItem('matList_projects') || '{}');
    savedProjectsList.innerHTML = '';
    const names = Object.keys(projects);

    if (names.length === 0) {
        savedProjectsList.innerHTML = '<li style="justify-content:center; color:#888;">No saved projects found.</li>';
        return;
    }

    names.forEach(name => {
        const li = document.createElement('li');
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'project-name';
        nameSpan.textContent = name;
        nameSpan.onclick = () => loadProject(name); // Load on click

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-project-btn';
        delBtn.textContent = 'Delete';
        delBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent loading when deleting
            deleteProject(name);
        };

        li.appendChild(nameSpan);
        li.appendChild(delBtn);
        savedProjectsList.appendChild(li);
    });
}

function loadProject(name) {
    showConfirm(`Load project "${name}"? Current unsaved list will be replaced.`, () => {
        const projects = JSON.parse(localStorage.getItem('matList_projects') || '{}');
        const data = projects[name];

        if (data) {
            list.innerHTML = '';
            
            data.forEach(item => {
                const li = document.createElement('li');
                let htmlContent = '';
                let weight = 0;
                let cost = 0;

                // Handle New Format (Object) vs Legacy Format (String)
                if (typeof item === 'object' && item.html) {
                    htmlContent = item.html;
                    weight = item.w || 0;
                    cost = item.c || 0;
                    const itemTitle = item.t || '';
                    const itemSize = item.s || '';
                    const itemLength = item.l || '';
                    
                    li.innerHTML = htmlContent;
                    li.dataset.weight = weight;
                    li.dataset.cost = cost;
                    if (itemTitle) li.dataset.itemTitle = itemTitle;
                    if (itemSize) li.dataset.itemSize = itemSize;
                    
                    if (itemLength) {
                        li.dataset.itemLength = itemLength;
                    } else {
                        // Fallback: Recover from HTML if dataset missing (for legacy saves)
                        const lenMatch = htmlContent.match(/Length:\s*([\d\.]+)\s*m/);
                        if (lenMatch) li.dataset.itemLength = lenMatch[1];
                    }
                } else if (typeof item === 'string') {
                    // Legacy Fallback: Try to parse from HTML string
                    htmlContent = item;
                    // Regex to find "1.23 kg" or "₹123.00"
                    // This is "best effort" for old data
                    const wMatch = htmlContent.match(/class="weight-val">([\d\.]+)\s*kg/);
                    const cMatch = htmlContent.match(/₹([\d\.]+)/);
                    if (wMatch) weight = parseFloat(wMatch[1]);
                    if (cMatch) cost = parseFloat(cMatch[1]);
                    
                    li.innerHTML = htmlContent;
                    li.dataset.weight = weight;
                    li.dataset.cost = cost;
                }
                
                // Re-attach listeners
                li.querySelector('.delete-button').addEventListener('click', function() {
                    this.parentElement.remove();
                    updateDashboard();
                });
                list.appendChild(li);
            });
            
            migrateListStructure();
            updateDashboard();
            closeModal();
        }
    });
}

function deleteProject(name) {
    showConfirm(`Permanently delete project "${name}"?`, () => {
        const projects = JSON.parse(localStorage.getItem('matList_projects') || '{}');
        delete projects[name];
        localStorage.setItem('matList_projects', JSON.stringify(projects));
        renderSavedProjects(); // Refresh list
    });
}


function loadList() {
    const projects = JSON.parse(localStorage.getItem('matList_projects') || '{}');
    if (Object.keys(projects).length === 0) {
        showAlert("No saved projects found.");
        return;
    }
    openModal();
}

function clearList() {
    if (list.children.length === 0) return;
    
    showConfirm('Clear current list?', () => {
        list.innerHTML = '';
        updateDashboard();
    });
}

function shareWhatsApp() {
    let text = "*MATERIAL LIST REQUEST*\n";
    text += "------------------------------------------\n";
    
    const items = list.querySelectorAll('li');
    if (items.length === 0) {
        showAlert("List is empty. Nothing to share.");
        return;
    }

    items.forEach((li, index) => {
        const itemTitle = li.dataset.itemTitle || (li.querySelector('.item-name') ? li.querySelector('.item-name').childNodes[0].textContent.trim() : 'Item');
        const itemSize = (li.dataset.itemSize || '').replace(/ x /g, ' × ');
        const itemLength = li.dataset.itemLength;
        
        let spec = li.querySelector('.item-spec') ? li.querySelector('.item-spec').innerText.trim() : '';
        const weight = li.querySelector('.weight-val') ? li.querySelector('.weight-val').innerText.trim() : '-';
        const qty = li.querySelector('.qty-col') ? li.querySelector('.qty-col').innerText.replace(' nos', '').trim() : '0';

        text += `${index + 1}) ${itemTitle}\n`;
        
        if (itemSize) {
            text += `Size   : ${itemSize}\n`;
        }
        
        // Handle Length
        let printedLength = false;
        if (itemLength) {
             text += `Length : ${itemLength} m\n`;
             printedLength = true;
             // Remove Length from spec
             const lenStr = `Length: ${itemLength} m`;
             if (spec.includes(lenStr)) {
                 spec = spec.replace(lenStr, '').trim();
             }
             spec = spec.replace(' | ', ' ').trim();
        } 
        
        if (!printedLength && spec.startsWith('Length: ')) {
             text += `Length : ${spec.replace('Length: ', '')}\n`;
             spec = '';
        }

        // Handle remaining Spec
        if (spec && spec !== '-' && spec !== '|') {
            // Clean up potentially leftover pipe/spaces
            spec = spec.replace(/^\|\s*/, '').replace(/\s*\|$/, '').trim();
            
            if (spec) {
                if (spec.startsWith('Type: ')) {
                    text += `Type   : ${spec.replace('Type: ', '')}\n`;
                } else {
                    text += `Spec   : ${spec}\n`;
                }
            }
        }
        
        text += `Qty    : ${qty}\n`;
        if (weight && weight !== '-') {
            text += `Weight : ${weight}\n`;
        }
        text += "\n";
    });
    
    text += "------------------------------------------\n";
    text += `\n*Total Items:* ${totalItemsVal.textContent}`;
    text += `\n*Total Weight:* ${totalWeightVal.textContent}`;
    text += `\n*Est. Cost:* ₹${totalCostVal.textContent}`;
    text += `\n\n_Generated by Sri Jaiganesh Industry_`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}


// ====================================================================
// === INITIALIZATION AND EVENT LISTENERS ===
// ====================================================================

// Standard listeners
shapeInput.addEventListener('change', updateSizeDropdown);
matInput.addEventListener('change', calculateTotalWeight);
sizeInput.addEventListener('change', calculateTotalWeight);
lenInput.addEventListener('input', calculateTotalWeight);
qtyInput.addEventListener('input', calculateTotalWeight);
priceInput.addEventListener('input', calculateTotalWeight); // New
priceTypeInput.addEventListener('change', calculateTotalWeight); // New
customDescriptionInput.addEventListener('input', calculateTotalWeight);
customWeightInput.addEventListener('input', calculateTotalWeight);
customUnitInput.addEventListener('change', calculateTotalWeight);
customUnitInput.addEventListener('change', updateLabels);
addButton.addEventListener('click', addItemFromInput);

saveBtn.addEventListener('click', saveList);
loadBtn.addEventListener('click', loadList);
clearBtn.addEventListener('click', clearList);
whatsappBtn.addEventListener('click', shareWhatsApp);

// Listener for consumables change (updates description and clears weight)
sizeInput.addEventListener('change', function() {
    if (shapeInput.value === 'consumables' && sizeInput.value) {
        const data = JSON.parse(sizeInput.value);
        customDescriptionInput.value = data.customDescription || data.label;
        customWeightInput.value = ''; 
        customUnitInput.value = 'nos'; 
        calculateTotalWeight();
    }
});


// Initial call to set up the dropdowns and calculation display on page load
updateSizeDropdown();

// ====================================================================
// === PRINT SETTINGS LOGIC ===
// ====================================================================
const printShowShape = document.getElementById('print-show-shape');
const printShowWeight = document.getElementById('print-show-weight');
const printShowPrice = document.getElementById('print-show-price');
const printShowSno = document.getElementById('print-show-sno');

function updatePrintStyles() {
    // Shape
    if (!printShowShape.checked) {
        document.body.classList.add('hide-print-shape');
    } else {
        document.body.classList.remove('hide-print-shape');
    }

    // Weight
    if (!printShowWeight.checked) {
        document.body.classList.add('hide-print-weight');
    } else {
        document.body.classList.remove('hide-print-weight');
    }

    // Price
    if (!printShowPrice.checked) {
        document.body.classList.add('hide-print-price');
    } else {
        document.body.classList.remove('hide-print-price');
    }

    // Serial Number
    if (printShowSno.checked) {
        document.body.classList.add('show-print-sno');
    } else {
        document.body.classList.remove('show-print-sno');
    }
}

printShowShape.addEventListener('change', updatePrintStyles);
printShowWeight.addEventListener('change', updatePrintStyles);
printShowPrice.addEventListener('change', updatePrintStyles);
printShowSno.addEventListener('change', updatePrintStyles);

// Initialize
updatePrintStyles();
restoreState();
