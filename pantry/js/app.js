/**
 * Grocery App - PWA Logic
 * Modules: Store (Data), UI (Rendering), App (Controller)
 */

/* --- THEME MANAGER --- */
const Theme = {
    init() {
        const saved = localStorage.getItem('theme') || 'light';
        this.apply(saved);
    },
    apply(theme) {
        localStorage.setItem('theme', theme);
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        
        // Update the UI text if on settings page
        const textEl = document.getElementById('selected-theme-text');
        if (textEl) {
            const labels = { 'light': '☀️ Light', 'dark': '🌙 Dark' };
            textEl.textContent = labels[theme] || 'Light';
        }

        // Highlight active option in modal
        document.querySelectorAll('#theme-grid .unit-option').forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('onclick').includes(`'${theme}'`)) {
                el.classList.add('active');
            }
        });
    }
};

/* --- DATA STORE --- */
const Store = {
    DB_KEY: 'tamil_grocery_list_v1',
    
    getAll() {
        const data = localStorage.getItem(this.DB_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveAll(items) {
        localStorage.setItem(this.DB_KEY, JSON.stringify(items));
        UI.render(); // Re-render on save
        UI.updateDashboard();
    },

    add(item) {
        const items = this.getAll();
        item.id = Date.now().toString();
        item.purchased = false;
        item.category = item.category || 'General';
        item.createdAt = new Date().toISOString();
        items.unshift(item); // Add to top
        this.saveAll(items);
    },

    update(id, updates) {
        let items = this.getAll();
        items = items.map(item => item.id === id ? { ...item, ...updates } : item);
        this.saveAll(items);
    },

    delete(id) {
        let items = this.getAll();
        items = items.filter(item => item.id !== id);
        this.saveAll(items);
    },

    togglePurchased(id) {
        let items = this.getAll();
        const item = items.find(i => i.id === id);
        if (item) {
            item.purchased = !item.purchased;
            this.saveAll(items);
            UI.updateDashboard(); // Force update dashboard stats
        }
    },
    
    clearAll() {
        if(confirm('Are you sure you want to delete all items?')) {
            this.saveAll([]);
        }
    },

    // Load initial data from the old list_data.js if DB is empty
    initData(predefinedItems) {
        if (this.getAll().length === 0 && predefinedItems) {
            const formatted = predefinedItems.map((item, index) => ({
                id: 'init_' + index,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit || 'nos',
                purchased: false,
                category: item.category || 'General',
                createdAt: new Date().toISOString()
            }));
            this.saveAll(formatted);
        }
    }
};

/* --- UI RENDERER --- */
const UI = {
    editingItemId: null,
    categoryIcons: {},

    init() {
        // Tab Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = btn.getAttribute('data-target');
                this.switchTab(targetId);
            });
        });

        // FAB
        document.getElementById('fab-add').addEventListener('click', () => {
            this.openModal();
        });

        // Modal Close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if(e.target === e.currentTarget) {
                    this.closeModal();
                    this.closeUnitModal();
                    this.closeCategoryModal();
                    this.closeThemeModal();
                }
            });
        });

        // Theme Selector Logic
        const themeBtn = document.getElementById('theme-selector-btn');
        if (themeBtn) themeBtn.addEventListener('click', () => this.openThemeModal());

        // Category Selector Logic
        const categoriesData = [
            { name: 'General', icon: '📦' },
            { name: 'Vegetables', icon: '🥦' },
            { name: 'Fruits', icon: '🍎' },
            { name: 'Grains', icon: '🌾' },
            { name: 'Dairy', icon: '🥛' },
            { name: 'Meat & Fish', icon: '🍗' },
            { name: 'Bakery', icon: '🍞' },
            { name: 'Frozen', icon: '❄️' },
            { name: 'Oils & Spices', icon: '🧂' },
            { name: 'Snacks', icon: '🍪' },
            { name: 'Cleaning', icon: '🧼' },
            { name: 'Personal Care', icon: '🪥' }
        ];

        const catGrid = document.getElementById('category-grid');
        const catBtn = document.getElementById('category-selector-btn');
        const catInput = document.getElementById('input-category');
        const catText = document.getElementById('selected-category-text');

        // Store icons for easy access during render
        this.categoryIcons = categoriesData.reduce((acc, curr) => {
            acc[curr.name] = curr.icon;
            return acc;
        }, {});

        categoriesData.forEach(c => {
            const btn = document.createElement('div');
            btn.className = 'unit-option';
            btn.innerHTML = `<span class="emoji">${c.icon}</span><span style="font-size:0.8rem">${c.name}</span>`;
            btn.onclick = () => {
                catInput.value = c.name;
                catText.textContent = `${c.icon} ${c.name}`;
                document.querySelectorAll('#category-grid .unit-option').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                this.closeCategoryModal();
            };
            catGrid.appendChild(btn);
        });

        catBtn.addEventListener('click', () => this.openCategoryModal());

        // Unit Selector Logic
        const units = ['nos', 'kg', 'g', 'L', 'ml', 'pack', 'jar', 'roll', 'bottle'];
        const unitGrid = document.getElementById('unit-grid');
        const unitBtn = document.getElementById('unit-selector-btn');
        const unitInput = document.getElementById('input-unit');
        const unitText = document.getElementById('selected-unit-text');

        units.forEach(u => {
            const btn = document.createElement('div');
            btn.className = 'unit-option';
            btn.textContent = u;
            btn.onclick = () => {
                unitInput.value = u;
                unitText.textContent = u;
                document.querySelectorAll('.unit-option').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                this.closeUnitModal();
            };
            unitGrid.appendChild(btn);
        });

        unitBtn.addEventListener('click', () => this.openUnitModal());

        // Add Item Form
        document.getElementById('add-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('input-name').value;
            const qty = document.getElementById('input-qty').value;
            const unit = document.getElementById('input-unit').value;
            const category = document.getElementById('input-category').value;
            
            if(name) {
                if (this.editingItemId) {
                    Store.update(this.editingItemId, { name, quantity: qty, unit, category });
                } else {
                    Store.add({ name, quantity: qty, unit, category });
                }
                
                this.closeModal();
                e.target.reset();
                // Reset displays
                unitInput.value = 'nos';
                unitText.textContent = 'nos';
                catInput.value = 'General';
                catText.textContent = 'General';
                this.switchTab('list');
            }
        });

        this.render();
        this.updateDashboard();
    },

    openCategoryModal() {
        document.getElementById('category-modal').classList.add('open');
    },

    closeCategoryModal() {
        document.getElementById('category-modal').classList.remove('open');
    },

    openThemeModal() {
        const modal = document.getElementById('theme-modal');
        if (modal) modal.classList.add('open');
    },

    closeThemeModal() {
        const modal = document.getElementById('theme-modal');
        if (modal) modal.classList.remove('open');
    },

    openUnitModal() {
        document.getElementById('unit-modal').classList.add('open');
    },

    closeUnitModal() {
        document.getElementById('unit-modal').classList.remove('open');
    },

    switchTab(tabId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
        // Show target
        document.getElementById(tabId).classList.add('active');
        
        // Update Nav State
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        document.querySelector(`.nav-item[data-target="${tabId}"]`).classList.add('active');
    },

    openModal() {
        this.editingItemId = null;
        document.getElementById('modal-title').textContent = 'Add Item';
        document.getElementById('submit-btn-text').textContent = 'Save to List';
        document.getElementById('add-modal').classList.add('open');
        document.getElementById('input-name').focus();
    },

    openEditModal(id) {
        const item = Store.getAll().find(i => i.id === id);
        if (!item) return;

        this.editingItemId = id;
        document.getElementById('modal-title').textContent = 'Edit Item';
        document.getElementById('submit-btn-text').textContent = 'Update Item';
        
        // Fill form
        document.getElementById('input-name').value = item.name;
        document.getElementById('input-qty').value = item.quantity;
        document.getElementById('input-unit').value = item.unit;
        document.getElementById('input-category').value = item.category;
        
        // Update UI displays for custom selectors
        document.getElementById('selected-unit-text').textContent = item.unit;
        const catIcon = this.categoryIcons[item.category] || '📦';
        document.getElementById('selected-category-text').textContent = `${catIcon} ${item.category}`;

        document.getElementById('add-modal').classList.add('open');
    },

    closeModal() {
        document.getElementById('add-modal').classList.remove('open');
    },

    render() {
        const items = Store.getAll();
        const listContainer = document.getElementById('grocery-items-container');
        listContainer.innerHTML = '';

        if (items.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align:center; padding: 60px 20px; color: var(--text-secondary);">
                    <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" stroke-width="1" fill="none" style="opacity:0.3; margin-bottom:16px;">
                        <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <p style="font-size: 1.2rem; font-weight:600;">Your list is empty</p>
                    <p style="font-size: 0.9rem;">Tap the + button to add groceries.</p>
                </div>`;
            return;
        }

        // Group items by category
        const groups = items.reduce((acc, item) => {
            const cat = item.category || 'General';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});

        // Sort categories (General last)
        const sortedCats = Object.keys(groups).sort((a, b) => {
            if (a === 'General') return 1;
            if (b === 'General') return -1;
            return a.localeCompare(b);
        });

        sortedCats.forEach(cat => {
            // Category Header
            const header = document.createElement('div');
            header.className = 'category-header';
            const icon = this.categoryIcons[cat] || '📦';
            header.innerHTML = `
                <div class="category-icon">${icon}</div>
                <span>${cat}</span>
            `;
            listContainer.appendChild(header);

            // Category Items
            groups[cat].forEach((item, index) => {
                const card = document.createElement('div');
                card.className = `card ${item.purchased ? 'purchased' : ''}`;
                // Staggered Animation
                card.style.animation = `fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
                card.style.animationDelay = `${index * 0.05}s`;
                card.style.opacity = '0'; // Start hidden
                
                card.innerHTML = `
                    <div class="item-checkbox" onclick="Store.togglePurchased('${item.id}')"></div>
                    <div class="item-info" onclick="Store.togglePurchased('${item.id}')">
                        <span class="item-name">${item.name}</span>
                        <span class="item-details">${item.quantity} ${item.unit}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-icon" onclick="event.stopPropagation(); UI.openEditModal('${item.id}')">
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-icon delete" onclick="event.stopPropagation(); Store.delete('${item.id}')">
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `;
                listContainer.appendChild(card);
            });
        });
    },

    updateDashboard() {
        const items = Store.getAll();
        const total = items.length;
        const bought = items.filter(i => i.purchased).length;
        const pending = total - bought;

        const totalEl = document.getElementById('stat-total');
        const pendingEl = document.getElementById('stat-pending');
        const purchasedEl = document.getElementById('stat-purchased');
        
        // Update numbers
        if (totalEl) totalEl.textContent = total;
        if (pendingEl) pendingEl.textContent = pending;
        if (purchasedEl) purchasedEl.textContent = bought;
        
        // Populate "Items to Buy" (Quick Mark)
        const dashboardContainer = document.getElementById('dashboard-list-items');
        if (!dashboardContainer) return;
        
        dashboardContainer.innerHTML = '';
        const pendingItems = items.filter(i => !i.purchased);
        
        if (pendingItems.length === 0) {
            dashboardContainer.innerHTML = `
                <div class="card" style="justify-content:center; padding: 30px; border-style: dashed;">
                    <p style="color:var(--text-secondary); font-size:1rem; font-weight:600; margin:0;">All items purchased! 🎉</p>
                </div>`;
        } else {
            pendingItems.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card';
                card.style.marginBottom = '8px';
                card.style.padding = '14px 18px';
                const catIcon = this.categoryIcons[item.category] || '📦';
                card.innerHTML = `
                    <div class="item-checkbox" onclick="Store.togglePurchased('${item.id}')"></div>
                    <div class="item-info" onclick="Store.togglePurchased('${item.id}')">
                        <span class="item-name" style="font-size:1.1rem">${item.name}</span>
                        <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
                            <span class="item-details">${item.quantity} ${item.unit}</span>
                            <span class="home-cat-badge">${catIcon} ${item.category}</span>
                        </div>
                    </div>
                `;
                dashboardContainer.appendChild(card);
            });
        }
    }
};

/* --- APP CONTROLLER --- */
window.addEventListener('DOMContentLoaded', () => {
    Theme.init();
    // Load external data if available
    if (typeof predefinedItems !== 'undefined') {
        Store.initData(predefinedItems);
    }

    UI.init();

    // Offline Status
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
});

function updateOnlineStatus() {
    if (navigator.onLine) {
        document.body.classList.remove('offline');
    } else {
        document.body.classList.add('offline');
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Fail', err));
    });
}