/**
 * Grocery App - PWA Logic
 * Modules: Store (Data), UI (Rendering), App (Controller)
 * v2: multi-list, favorites, history, search/sort/hide, undo, export/import, steppers
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

        const textEl = document.getElementById('selected-theme-text');
        if (textEl) {
            const labels = { 'light': '☀️ Light', 'dark': '🌙 Dark' };
            textEl.textContent = labels[theme] || 'Light';
        }

        document.querySelectorAll('#theme-grid .unit-option').forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('onclick') && el.getAttribute('onclick').includes(`'${theme}'`)) {
                el.classList.add('active');
            }
        });
    }
};

/* --- DATA STORE --- */
const Store = {
    DB_KEY: 'pantry_db_v2',
    LEGACY_KEY: 'tamil_grocery_list_v1',

    defaultList() {
        return { id: 'list_default', name: 'My List', createdAt: new Date().toISOString(), archived: false };
    },

    getDB() {
        const data = localStorage.getItem(this.DB_KEY);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                try { localStorage.setItem(this.DB_KEY + '_corrupt_backup', data); } catch (e2) {}
                localStorage.removeItem(this.DB_KEY);
                return this.migrate();
            }
        }
        return this.migrate();
    },

    migrate() {
        let lists = [this.defaultList()];
        let items = [];

        const legacy = localStorage.getItem(this.LEGACY_KEY);
        if (legacy) {
            try {
                const arr = JSON.parse(legacy);
                if (Array.isArray(arr)) {
                    items = arr.map((it, i) => ({
                        id: it.id || ('mig_' + i),
                        listId: 'list_default',
                        name: it.name,
                        quantity: it.quantity || 1,
                        unit: it.unit || 'nos',
                        category: it.category || 'General',
                        purchased: !!it.purchased,
                        createdAt: it.createdAt || new Date().toISOString()
                    }));
                }
            } catch (e) { /* ignore */ }
        }

        const db = { lists, items, activeListId: 'list_default', favorites: [] };
        this.saveDB(db);
        return db;
    },

    saveDB(db) {
        try {
            localStorage.setItem(this.DB_KEY, JSON.stringify(db));
        } catch (e) {
            if (typeof Toast !== 'undefined') {
                Toast.show('Storage full or unavailable — changes not saved.', 4000);
            }
        }
    },

    /* --- Items --- */
    getAll() {
        return this.getDB().items;
    },

    getActiveListId() {
        const db = this.getDB();
        if (!db.lists.find(l => l.id === db.activeListId)) {
            db.activeListId = db.lists[0] ? db.lists[0].id : 'list_default';
        }
        return db.activeListId;
    },

    getActiveItems() {
        const db = this.getDB();
        return db.items.filter(i => i.listId === this.getActiveListId());
    },

    persist(extra) {
        const db = this.getDB();
        if (extra) Object.assign(db, extra);
        this.saveDB(db);
        UI.render();
        UI.updateDashboard();
        UI.renderLists();
    },

    add(item) {
        const db = this.getDB();
        item.id = item.id || Date.now().toString() + Math.random().toString(36).slice(2, 6);
        item.purchased = false;
        item.category = item.category || 'General';
        item.listId = item.listId || this.getActiveListId();
        item.createdAt = new Date().toISOString();
        db.items.unshift(item);
        this.bumpFavorite(db, item, true);
        this.saveDB(db);
        UI.render();
        UI.updateDashboard();
    },

    update(id, updates) {
        let items = this.getDB().items;
        items = items.map(item => item.id === id ? { ...item, ...updates } : item);
        this.persist({ items });
    },

    delete(id) {
        let items = this.getDB().items;
        items = items.filter(item => item.id !== id);
        this.persist({ items });
    },

    togglePurchased(id) {
        const db = this.getDB();
        let changed = null;
        db.items = db.items.map(item => {
            if (item.id === id) {
                item.purchased = !item.purchased;
                changed = item;
            }
            return item;
        });
        if (changed) this.bumpFavorite(db, changed, !changed.purchased);
        this.saveDB(db);
        UI.render();
        UI.updateDashboard();
    },

    clearPurchased() {
        const db = this.getDB();
        const listId = this.getActiveListId();
        const qty = db.items.filter(i => i.listId === listId && i.purchased).length;
        if (qty === 0) return;
        db.items = db.items.filter(i => !(i.listId === listId && i.purchased));
        this.saveDB(db);
        UI.render();
        UI.updateDashboard();
    },

    clearAll() {
        Confirm.open('Delete ALL lists and data? This cannot be undone.', { title: 'Clear All Data', okText: 'Delete All' }).then((ok) => {
            if (!ok) return;
            const db = { lists: [this.defaultList()], items: [], activeListId: 'list_default', favorites: [] };
            this.saveDB(db);
            UI.render();
            UI.updateDashboard();
            UI.renderLists();
        });
    },

    /* --- Favorites --- */
    bumpFavorite(db, item, isAdd) {
        const key = (item.name || '').trim().toLowerCase();
        if (!key) return;
        if (!db.favorites) db.favorites = [];
        const fav = db.favorites.find(f => f.key === key);
        if (fav) {
            if (isAdd) {
                fav.count++;
                fav.lastUsed = new Date().toISOString();
            }
        } else if (isAdd) {
            db.favorites.push({
                key,
                name: item.name,
                unit: item.unit || 'nos',
                category: item.category || 'General',
                qty: item.quantity || 1,
                count: 1,
                lastUsed: new Date().toISOString()
            });
        }
    },

    getFavorites(limit) {
        const db = this.getDB();
        const favs = [...(db.favorites || [])].sort((a, b) => (b.count - a.count) || (b.lastUsed > a.lastUsed ? 1 : -1));
        return limit ? favs.slice(0, limit) : favs;
    },

    isFavorite(name) {
        const db = this.getDB();
        const key = (name || '').trim().toLowerCase();
        if (!key) return false;
        return !!(db.favorites || []).find(f => f.key === key);
    },

    toggleFavorite(name, unit, category, quantity) {
        const db = this.getDB();
        const key = (name || '').trim().toLowerCase();
        if (!key) return;
        if (!db.favorites) db.favorites = [];
        const idx = db.favorites.findIndex(f => f.key === key);
        if (idx >= 0) {
            db.favorites.splice(idx, 1);
        } else {
            db.favorites.push({
                key,
                name,
                unit: unit || 'nos',
                category: category || 'General',
                qty: quantity || 1,
                count: 1,
                lastUsed: new Date().toISOString()
            });
        }
        this.saveDB(db);
    },

    addFromFavorite(fav) {
        const db = this.getDB();
        const listId = this.getActiveListId();
        const existing = db.items.find(i => i.listId === listId &&
            (i.name || '').trim().toLowerCase() === (fav.name || '').trim().toLowerCase());
        if (existing) {
            const qty = (parseFloat(existing.quantity) || 1) + 1;
            this.update(existing.id, { quantity: qty });
            return;
        }
        this.add({
            name: fav.name,
            quantity: fav.qty || 1,
            unit: fav.unit || 'nos',
            category: fav.category || 'General'
        });
    },

    /* --- Lists --- */
    getLists() {
        const db = this.getDB();
        if (!db.lists || db.lists.length === 0) db.lists = [this.defaultList()];
        return db.lists;
    },

    getActiveList() {
        const lists = this.getLists();
        return lists.find(l => l.id === this.getActiveListId()) || lists[0];
    },

    setActiveList(id) {
        const db = this.getDB();
        if (db.lists.find(l => l.id === id)) db.activeListId = id;
        this.saveDB(db);
        UI.render();
        UI.updateDashboard();
        UI.renderLists();
    },

    createList(name) {
        const db = this.getDB();
        const trimmed = (name || '').trim() || 'New List';
        const list = { id: 'list_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: trimmed, createdAt: new Date().toISOString(), archived: false };
        db.lists.push(list);
        db.activeListId = list.id;
        this.saveDB(db);
        UI.render();
        UI.updateDashboard();
        UI.renderLists();
        return list;
    },

    renameList(id, name) {
        const db = this.getDB();
        const list = db.lists.find(l => l.id === id);
        if (list) {
            list.name = (name || '').trim() || list.name;
        }
        this.saveDB(db);
        UI.renderLists();
    },

    deleteList(id) {
        const db = this.getDB();
        if (db.lists.length <= 1) return alert('You must keep at least one list.');
        const list = db.lists.find(l => l.id === id);
        if (!list) return;
        if (list.archived) {
            Confirm.open(`Permanently delete history "${list.name}"?`, { title: 'Delete History', okText: 'Delete' }).then((ok) => {
                if (!ok) return;
                const d = this.getDB();
                d.lists = d.lists.filter(l => l.id !== id);
                d.items = d.items.filter(i => i.listId !== id);
                if (d.activeListId === id) d.activeListId = d.lists[0].id;
                this.saveDB(d);
                UI.render();
                UI.updateDashboard();
                UI.renderLists();
            });
        } else {
            Confirm.open(`Delete "${list.name}" and all its items?`, { title: 'Delete List', okText: 'Delete' }).then((ok) => {
                if (!ok) return;
                const d = this.getDB();
                d.lists = d.lists.filter(l => l.id !== id);
                d.items = d.items.filter(i => i.listId !== id);
                if (d.activeListId === id) d.activeListId = d.lists[0].id;
                this.saveDB(d);
                UI.render();
                UI.updateDashboard();
                UI.renderLists();
            });
        }
    },

    archiveList(id) {
        const db = this.getDB();
        const list = db.lists.find(l => l.id === id);
        if (!list || list.archived) return;
        list.archived = true;
        this.saveDB(db);
        UI.render();
        UI.updateDashboard();
        UI.renderLists();
    },

    /* --- Export / Import --- */
    exportData() {
        const db = this.getDB();
        const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'grocery-backup-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data || !Array.isArray(data.lists) || !Array.isArray(data.items)) {
                    throw new Error('Invalid format');
                }
                if (!data.favorites) data.favorites = [];
                if (!data.activeListId || !data.lists.find(l => l.id === data.activeListId)) {
                    data.activeListId = data.lists[0].id;
                }
                this.saveDB(data);
                UI.render();
                UI.updateDashboard();
                UI.renderLists();
            } catch (err) {
                alert('Import failed: invalid file.');
            }
        };
        reader.readAsText(file);
    },

    // Load initial data from legacy predefined (js/data.js) on first run
    initData(predefinedItems) {
        const db = this.getDB();
        if (db.lists.length === 1 && db.lists[0].id === 'list_default' && db.items.length === 0 && predefinedItems && predefinedItems.length) {
            const items = predefinedItems.map((item, index) => ({
                id: 'init_' + index,
                listId: 'list_default',
                name: item.name,
                quantity: item.quantity,
                unit: item.unit || 'nos',
                purchased: false,
                category: item.category || 'General',
                createdAt: new Date().toISOString()
            }));
            db.items = items;
            this.saveDB(db);
        }
    }
};

/* --- CONFIRM DIALOG (custom delete confirm) --- */
const Confirm = {
    _resolve: null,
    _el: null,

    init() {
        this._el = document.getElementById('confirm-modal');
        if (!this._el) return;

        const ok = document.getElementById('confirm-ok');
        const cancel = document.getElementById('confirm-cancel');
        if (ok) ok.addEventListener('click', () => this.close(true));
        if (cancel) cancel.addEventListener('click', () => this.close(false));
        this._el.addEventListener('click', (e) => {
            if (e.target === this._el) this.close(false);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._el && this._el.classList.contains('open')) this.close(false);
        });
    },

    open(message, opts = {}) {
        if (!this._el) return Promise.resolve(false);
        const { title = 'Are you sure?', okText = 'Delete' } = opts;
        const titleEl = document.getElementById('confirm-title');
        const msgEl = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok');
        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = message;
        if (okBtn) okBtn.textContent = okText;
        this._el.classList.add('open');
        return new Promise((resolve) => { this._resolve = resolve; });
    },

    close(result) {
        if (!this._el) return;
        this._el.classList.remove('open');
        if (this._resolve) {
            this._resolve(result);
            this._resolve = null;
        }
    }
};

/* --- TOAST (transient notice) --- */
const Toast = {
    _timer: null,
    _el: null,
    init() {
        this._el = document.getElementById('print-hint');
        if (!this._el) return;
        this._el.classList.add('toast');
    },
    show(message, ms = 2400) {
        if (!this._el) { alert(message); return; }
        this._el.textContent = message;
        this._el.classList.add('toast');
        this._el.classList.add('show');
        if (this._timer) clearTimeout(this._timer);
        this._timer = setTimeout(() => this._el.classList.remove('show'), ms);
    }
};

/* --- UI RENDERER --- */
const UI = {
    editingItemId: null,
    editingListId: null,
    menuListId: null,
    categoryIcons: {},
    searchQuery: '',
    hideBought: false, // kept for render filtering compatibility

    init() {
        // Settings entry (header top-right gear)
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.openSettings());

        // Share active list (SMS on mobile, copy on desktop)
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) shareBtn.addEventListener('click', () => this.shareActiveList());

        // FAB: click = add item, long press = print
        const fab = document.getElementById('fab-add');
        let fabPressTimer = null;
        let fabLongPressed = false;
        const FAB_LONG_PRESS_MS = 600;
        const startFabPress = () => {
            fabLongPressed = false;
            fabPressTimer = setTimeout(() => {
                fabLongPressed = true;
                if (navigator.vibrate) navigator.vibrate(50);
                this.showPrintHint();
                this.renderPrintQr();
                window.print();
                this.hidePrintHint();
                this.clearPrintQr();
            }, FAB_LONG_PRESS_MS);
        };
        const cancelFabPress = () => {
            if (fabPressTimer) { clearTimeout(fabPressTimer); fabPressTimer = null; }
        };
        fab.addEventListener('pointerdown', startFabPress);
        fab.addEventListener('pointerup', cancelFabPress);
        fab.addEventListener('pointerleave', cancelFabPress);
        fab.addEventListener('pointercancel', cancelFabPress);
        fab.addEventListener('contextmenu', (e) => e.preventDefault());
        fab.addEventListener('click', () => {
            if (fabLongPressed) { fabLongPressed = false; return; }
            this.openModal();
        });

        // Keep the print hint in sync for any print trigger
        window.addEventListener('beforeprint', () => { this.showPrintHint(); this.renderPrintQr(); });
        window.addEventListener('afterprint', () => { this.hidePrintHint(); this.clearPrintQr(); });

        // Modal Close (backdrop)
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.closeModal();
                    this.closeUnitModal();
                    this.closeCategoryModal();
                    this.closeThemeModal();
                    this.closeListModal();
                    this.closeNewListModal();
                    this.closeSettings();
                    this.closeQrModal();
                    this.closeQrImportModal();
                    this.closeDocsModal();
                }
            });
        });

        // Escape closes modals
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            if (document.getElementById('qr-modal').classList.contains('open')) this.closeQrModal();
            if (document.getElementById('qr-import-modal').classList.contains('open')) this.closeQrImportModal();
            if (document.getElementById('docs-modal').classList.contains('open')) this.closeDocsModal();
            this.closeListMenus();
        });

        // Close list actions menu on outside click
        document.addEventListener('click', (e) => {
            if (e.target.closest && !e.target.closest('.list-menu-btn') && !e.target.closest('#list-action-menu')) {
                this.closeListMenus();
            }
        });

        // Theme Selector
        const themeBtn = document.getElementById('theme-selector-btn');
        if (themeBtn) themeBtn.addEventListener('click', () => this.openThemeModal());

        // Category Selector
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

        // Unit Selector
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
                document.querySelectorAll('#unit-grid .unit-option').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                this.closeUnitModal();
            };
            unitGrid.appendChild(btn);
        });
        unitBtn.addEventListener('click', () => this.openUnitModal());

        // Add/Edit Item Form
        document.getElementById('add-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('input-name').value.trim();
            const qty = document.getElementById('input-qty').value;
            const unit = document.getElementById('input-unit').value;
            const category = document.getElementById('input-category').value;

            if (name) {
                if (this.editingItemId) {
                    Store.update(this.editingItemId, { name, quantity: qty, unit, category });
                } else {
                    Store.add({ name, quantity: qty, unit, category });
                }
                this.closeModal();
                e.target.reset();
                unitInput.value = 'nos';
                unitText.textContent = 'nos';
                catInput.value = 'General';
                catText.textContent = 'General';
                this.render();
            }
        });

        // List Toolbar
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        const updateSearchClear = () => {
            if (!searchClear) return;
            searchClear.classList.toggle('show', !!(searchInput && searchInput.value.length > 0));
        };
        if (searchInput) searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim().toLowerCase();
            updateSearchClear();
            this.render();
        });
        if (searchClear) searchClear.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            this.searchQuery = '';
            updateSearchClear();
            this.render();
            if (searchInput) searchInput.focus();
        });

        // Active list selector (Home)
        const activeListBtn = document.getElementById('active-list-btn');
        if (activeListBtn) activeListBtn.addEventListener('click', () => this.openListModal());

        const newListBtn = document.getElementById('new-list-btn');
        if (newListBtn) newListBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openNewListModal();
        });

        // Import file
        const importFile = document.getElementById('import-file');
        if (importFile) importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) Store.importData(file);
            e.target.value = '';
        });

        this.render();
        this.updateDashboard();
        this.renderLists();
    },

    /* --- Delete item --- */
    deleteItem(id) {
        const item = Store.getAll().find(i => i.id === id);
        if (!item) return;
        Confirm.open(`Delete "${item.name}"?`, { title: 'Delete Item', okText: 'Delete' }).then((ok) => {
            if (!ok) return;
            Store.delete(id);
        });
    },

    showPrintHint() {
        const el = document.getElementById('print-hint');
        if (!el) return;
        el.textContent = 'Select your 80mm / thermal printer (or Custom paper 80×297mm) in the print dialog for correct sizing.';
        el.classList.add('show');
    },
    hidePrintHint() {
        const el = document.getElementById('print-hint');
        if (!el) return;
        el.classList.remove('show');
    },

    renderPrintQr() {
        const stage = document.getElementById('print-qr');
        if (!stage) return;
        stage.innerHTML = '';
        if (typeof qrcode !== 'function') return;
        const listId = Store.getActiveListId();
        const payload = this.buildCompactPayload(listId);
        if (!payload) return;
        try {
            const qr = this.makeQr(payload);
            if (!qr) return;
            stage.innerHTML = qr.createSvgTag(4, 2);
        } catch (e) { stage.innerHTML = ''; }
    },

    clearPrintQr() {
        const stage = document.getElementById('print-qr');
        if (stage) stage.innerHTML = '';
    },

    /* --- QR Share / Import --- */
    escField(s) {
        return String(s == null ? '' : s)
            .split('%').join('%25')
            .split('~').join('%7E')
            .split('|').join('%7C');
    },
    unescField(s) {
        return String(s == null ? '' : s)
            .split('%7C').join('|')
            .split('%7E').join('~')
            .split('%25').join('%');
    },

    // Compact byte-mode payload: P1|<listName>~name|qty|unit|cat~name|qty|unit|cat...
    buildCompactPayload(listId) {
        const list = Store.getLists().find(l => l.id === listId);
        if (!list) return null;
        const part = (v) => this.escField(String(v == null ? '' : v));
        const head = 'P1|' + part(list.name);
        const items = Store.getAll()
            .filter(i => i.listId === listId)
            .map(i => `${part(i.name)}|${part(i.quantity != null ? i.quantity : 1)}|${part(i.unit || 'nos')}|${part(i.category || 'General')}`);
        return head + (items.length ? '~' + items.join('~') : '');
    },

    /* --- Share active list (SMS on mobile / copy on desktop) --- */
    shareActiveList() {
        const listId = Store.getActiveListId();
        const payload = this.buildCompactPayload(listId);
        const list = Store.getLists().find(l => l.id === listId);
        if (!payload || !list) return;
        const isMobile = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent)
            || ('ontouchstart' in window && window.innerWidth < 768);
        if (isMobile) {
            const body = `Grocery list ${list.name}:\n${payload}\n\nImport: Pantry > Data > Import via QR (paste)`;
            location.href = 'sms:?&body=' + encodeURIComponent(body);
        } else {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(payload)
                    .then(() => Toast.show('List copied — paste into the other device\'s Pantry.'))
                    .catch(() => this.fallbackCopy(payload));
            } else {
                this.fallbackCopy(payload);
            }
        }
    },

    fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); Toast.show('List copied to clipboard.'); }
        catch (e) { Toast.show('Copy failed — select and copy the text manually.'); }
        document.body.removeChild(ta);
    },

    parseCompactPayload(text) {
        let data = String(text || '').trim();
        if (!data || data.indexOf('P1|') !== 0) return null;
        const groups = data.split('~');
        const head = groups.shift() || '';
        const meta = head.split('|');
        const listName = this.unescField(meta[1] || '');
        const items = groups.map((g, idx) => {
            const p = g.split('|');
            return {
                name: this.unescField(p[0] || ''),
                qty: isFinite(Number(p[1])) && Number(p[1]) > 0 ? Number(p[1]) : 1,
                unit: this.unescField(p[2] || 'nos'),
                category: this.unescField(p[3] || 'General'),
                _idx: idx
            };
        });
        return { app: 'pantry', v: 1, list: { name: listName }, items };
    },

    buildListPayload(listId) {
        const list = Store.getLists().find(l => l.id === listId);
        if (!list) return null;
        const items = Store.getAll()
            .filter(i => i.listId === listId)
            .map(i => ({ name: i.name, qty: i.quantity, unit: i.unit || 'nos', category: i.category || 'General' }));
        return JSON.stringify({ app: 'pantry', v: 1, list: { name: list.name }, items });
    },

    encodePayload(payload) {
        const bytes = new TextEncoder().encode(payload);
        let bin = '';
        bytes.forEach(b => { bin += String.fromCharCode(b); });
        return btoa(bin);
    },

    decodePayload(base64) {
        const bin = atob(base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    },

    makeQr(text) {
        // Try error-correction M first, fall back to L (more capacity) on overflow.
        const attempts = ['M', 'L'];
        for (let i = 0; i < attempts.length; i++) {
            const qr = qrcode(0, attempts[i]);
            qr.addData(text, 'Byte');
            try {
                qr.make();
                return qr;
            } catch (e) {
                if (i === attempts.length - 1) throw e;
            }
        }
        return null;
    },

    openQrModal(listId) {
        const payload = this.buildCompactPayload(listId);
        const list = Store.getLists().find(l => l.id === listId);
        if (!payload || !list) return;
        this.currentQrPayload = payload;

        const nameEl = document.getElementById('qr-list-name');
        if (nameEl) nameEl.textContent = list.name;
        const countEl = document.getElementById('qr-list-count');
        if (countEl) countEl.textContent = String(Store.getAll().filter(i => i.listId === listId).length);

        const stage = document.getElementById('qr-stage');
        const notice = document.getElementById('qr-overflow');
        const desc = document.getElementById('qr-modal-desc');
        if (stage) stage.innerHTML = '';
        if (notice) notice.style.display = 'none';
        if (desc) desc.style.display = 'block';

        if (stage && typeof qrcode === 'function') {
            let rendered = false;
            try {
                const qr = this.makeQr(payload);
                if (qr) {
                    const svg = qr.createSvgTag(6, 4);
                    stage.innerHTML = svg;
                    rendered = true;
                }
            } catch (e) {
                rendered = false;
            }
            if (!rendered) {
                stage.innerHTML = '<span style="color:var(--text-secondary);font-size:0.85rem;">QR too large</span>';
                if (notice) notice.style.display = 'block';
                if (desc) desc.style.display = 'none';
            }
        } else if (stage) {
            stage.innerHTML = '<span style="color:var(--text-secondary);font-size:0.85rem;">QR library not loaded</span>';
        }

        document.getElementById('qr-modal').classList.add('open');
        this.refreshIcons();
    },
    closeQrModal() {
        document.getElementById('qr-modal').classList.remove('open');
    },

    copyQrPayload() {
        if (!this.currentQrPayload) return;
        const doCopy = (text) => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text)
                    .then(() => Toast.show('Payload copied to clipboard.'))
                    .catch(() => Toast.show('Copy failed. Enable clipboard permission.'));
            } else {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); Toast.show('Payload copied to clipboard.'); }
                catch (e) { Toast.show('Copy failed.'); }
                document.body.removeChild(ta);
            }
        };
        doCopy(this.currentQrPayload);
    },

    openQrImportModal() {
        const status = document.getElementById('qr-import-status');
        if (status) { status.className = 'qr-import-status'; status.textContent = ''; }
        const input = document.getElementById('qr-import-input');
        if (input) input.value = this.currentQrPayload || '';
        document.getElementById('qr-import-modal').classList.add('open');
        this.refreshIcons();
    },
    closeQrImportModal() {
        this.stopQrScan();
        document.getElementById('qr-import-modal').classList.remove('open');
    },

    parsePayloadText(text) {
        let data = String(text || '').trim();
        if (!data) return null;
        // New compact format first: P1|list~item...
        if (data.indexOf('P1|') === 0) {
            return this.parseCompactPayload(data);
        }
        // Legacy format: base64 JSON or raw JSON
        try {
            if (this.isBase64ish(data)) data = this.decodePayload(data);
            const obj = JSON.parse(data);
            if (obj && obj.list && Array.isArray(obj.items)) return obj;
            return null;
        } catch (e) {
            return null;
        }
    },
    isBase64ish(str) {
        return /^[A-Za-z0-9+/=]+$/.test(str) && str.length > 8;
    },

    importQrInput() {
        const input = document.getElementById('qr-import-input');
        const status = document.getElementById('qr-import-status');
        const payload = this.parsePayloadText(input ? input.value : '');
        if (!payload) {
            if (status) { status.className = 'qr-import-status err'; status.textContent = 'Invalid QR payload.'; }
            return;
        }
        if (this.importPayload(payload)) {
            this.stopQrScan();
            this.closeQrImportModal();
            this.closeQrModal();
            Toast.show('List imported successfully.');
        } else if (status) {
            status.className = 'qr-import-status err';
            status.textContent = 'This payload is not a valid Pantry list.';
        }
    },

    importPayload(payload) {
        if (!payload || payload.app !== 'pantry' || !payload.list || !Array.isArray(payload.items)) return false;
        const db = Store.getDB();
        const listId = 'shared_' + Date.now();
        const listName = String(payload.list.name || 'Shared List').slice(0, 60);
        db.lists.push({ id: listId, name: listName, createdAt: new Date().toISOString(), archived: false });
        const now = new Date().toISOString();
        payload.items.forEach((it, idx) => {
            if (!it || it.name == null) return;
            db.items.push({
                id: listId + '_' + idx,
                listId,
                name: String(it.name).slice(0, 200),
                quantity: isFinite(Number(it.qty)) && Number(it.qty) > 0 ? Number(it.qty) : 1,
                unit: String(it.unit != null ? it.unit : 'nos').slice(0, 20),
                category: String(it.category != null ? it.category : 'General').slice(0, 50),
                purchased: false,
                createdAt: now
            });
        });
        Store.saveDB(db);
        Store.setActiveList(listId);
        UI.render();
        UI.updateDashboard();
        UI.renderLists();
        return true;
    },

    /* --- Camera QR scan --- */
    startQrScan() {
        const video = document.getElementById('qr-video');
        const scanBtn = document.getElementById('qr-scan-btn');
        const status = document.getElementById('qr-import-status');
        if (!video) return;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (status) { status.className = 'qr-import-status err'; status.textContent = 'Camera not supported on this device/browser. Use Paste instead.'; }
            return;
        }
        scanBtn.disabled = true;
        if (scanBtn) scanBtn.innerHTML = '<span class="flex-center gap-8"><i data-lucide="scan-line" width="18" height="18"></i> Scanning…</span>';

        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then((stream) => {
                this.qrStream = stream;
                video.srcObject = stream;
                video.style.display = 'block';
                video.setAttribute('playsinline', 'true');
                video.play();
                if (status) { status.className = 'qr-import-status'; status.textContent = 'Point the camera at a QR code…'; }
                this.refreshIcons();
                this.scanFrame();
            })
            .catch((err) => {
                if (scanBtn) { scanBtn.disabled = false; scanBtn.innerHTML = '<span class="flex-center gap-8"><i data-lucide="camera" width="18" height="18"></i> Start Camera</span>'; }
                if (status) { status.className = 'qr-import-status err'; status.textContent = 'Camera permission denied. Use Paste instead.'; }
                this.refreshIcons();
            });
    },

    scanFrame() {
        const video = document.getElementById('qr-video');
        const canvas = document.getElementById('qr-canvas-hidden');
        const status = document.getElementById('qr-import-status');
        if (!video || !canvas || !this.qrStream) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            try {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = (typeof jsQR === 'function') ? jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' }) : null;
                if (code && code.data) {
                    const payload = this.parsePayloadText(code.data);
                    if (payload) {
                        if (status) { status.className = 'qr-import-status ok'; status.textContent = 'QR detected — importing…'; }
                        if (this.importPayload(payload)) {
                            this.closeQrImportModal();
                            this.closeQrModal();
                        }
                        return;
                    }
                }
            } catch (e) { /* frame error; keep scanning */ }
        }
        if (this.qrStream) {
            this._scanTimer = setTimeout(() => this.scanFrame(), 200);
        }
    },

    stopQrScan() {
        if (this._scanTimer) { clearTimeout(this._scanTimer); this._scanTimer = null; }
        if (this.qrStream) {
            this.qrStream.getTracks().forEach(t => t.stop());
            this.qrStream = null;
        }
        const video = document.getElementById('qr-video');
        const scanBtn = document.getElementById('qr-scan-btn');
        if (video) { video.style.display = 'none'; video.srcObject = null; }
        if (scanBtn) { scanBtn.disabled = false; scanBtn.innerHTML = '<span class="flex-center gap-8"><i data-lucide="camera" width="18" height="18"></i> Start Camera</span>'; }
    },

    /* --- Modals --- */
    openCategoryModal() { document.getElementById('category-modal').classList.add('open'); },
    closeCategoryModal() { document.getElementById('category-modal').classList.remove('open'); },

    openThemeModal() { document.getElementById('theme-modal').classList.add('open'); },
    closeThemeModal() { document.getElementById('theme-modal').classList.remove('open'); },

    openDocsModal() { document.getElementById('docs-modal').classList.add('open'); },
    closeDocsModal() { document.getElementById('docs-modal').classList.remove('open'); },

    openUnitModal() { document.getElementById('unit-modal').classList.add('open'); },
    closeUnitModal() { document.getElementById('unit-modal').classList.remove('open'); },

    openListModal() {
        this.renderListModal();
        document.getElementById('list-modal').classList.add('open');
    },
    closeListModal() { document.getElementById('list-modal').classList.remove('open'); },

    openNewListModal(editId) {
        this.editingListId = editId || null;
        const input = document.getElementById('input-list-name');
        const title = document.getElementById('new-list-modal-title');
        if (editId) {
            const list = Store.getLists().find(l => l.id === editId);
            title.textContent = 'Rename List';
            if (list) input.value = list.name;
        } else {
            title.textContent = 'New List';
            input.value = '';
        }
        document.getElementById('new-list-modal').classList.add('open');
        setTimeout(() => input.focus(), 100);
    },
    closeNewListModal() { document.getElementById('new-list-modal').classList.remove('open'); },

    saveListFromModal() {
        const name = document.getElementById('input-list-name').value.trim();
        if (this.editingListId) {
            Store.renameList(this.editingListId, name);
            this.editingListId = null;
        } else {
            Store.createList(name);
        }
        this.closeNewListModal();
    },

    createNewList() { this.openNewListModal(); },

    renderListModal() {
        const container = document.getElementById('list-modal-container');
        if (!container) return;
        container.innerHTML = '';
        const lists = Store.getLists().filter(l => !l.archived);
        const activeId = Store.getActiveListId();
        lists.forEach(list => {
            const row = document.createElement('div');
            row.className = 'list-select-row' + (list.id === activeId ? ' active' : '');
            row.innerHTML = `<span style="font-weight:700; flex:1;">${escapeHtml(list.name)}</span>`;
            if (list.id === activeId) {
                row.innerHTML += `<span class="active-badge">Current</span>`;
            }
            row.onclick = () => {
                Store.setActiveList(list.id);
                this.closeListModal();
            };
            container.appendChild(row);
        });
    },

    /* --- Settings --- */
    openSettings() {
        this.renderLists();
        this.refreshIcons();
        document.getElementById('settings-modal').classList.add('open');
    },
    closeSettings() {
        document.getElementById('settings-modal').classList.remove('open');
    },

    /* --- Swipe actions --- */
    deleteItemSwipe(id) {
        const item = Store.getAll().find(i => i.id === id);
        if (!item) return;
        Confirm.open(`Delete "${item.name}"?`, { title: 'Delete Item', okText: 'Delete' }).then((ok) => {
            if (!ok) return;
            Store.delete(id);
        });
    },

    attachGestures(swipeWrap, item) {
        const content = swipeWrap.querySelector('.swipe-content');
        const that = this;
        if (!content) return;

        const SWIPE_THRESHOLD = 80;
        const MAX_DRAG = 60;

        const resetVisual = () => {
            content.style.transition = '';
            content.style.transform = '';
            content.style.background = '';
        };

        const applyFeedback = (dx) => {
            const drag = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dx));
            content.style.transition = 'none';
            content.style.transform = `translateX(${drag}px)`;
            content.style.background = dx < 0 ? 'rgba(217, 119, 6, 0.12)' : 'rgba(220, 38, 38, 0.12)';
        };

        const doFavorite = () => {
            if (navigator.vibrate) navigator.vibrate(15);
            Store.toggleFavorite(item.name, item.unit, item.category, item.quantity);
            that.render();
        };

        const doDelete = () => {
            if (navigator.vibrate) navigator.vibrate(20);
            that.deleteItemSwipe(item.id);
        };

        // Desktop: right-click / long-press edit
        content.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            that.openEditModal(item.id);
        });

        /* --- Hammer.js gesture handling --- */
        if (window.Hammer) {
            const mc = new Hammer.Manager(swipeWrap, {
                touchAction: 'pan-y',
                recognizers: [
                    [Hammer.Pan, { direction: Hammer.DIRECTION_HORIZONTAL, threshold: 10 }],
                    [Hammer.Tap, { time: 250 }],
                    [Hammer.Press, { time: 500 }]
                ]
            });

            mc.on('panmove', (e) => applyFeedback(e.deltaX));

            mc.on('panend', (e) => {
                resetVisual();
                if (e.deltaX <= -SWIPE_THRESHOLD || e.velocityX < -0.6) doFavorite();
                else if (e.deltaX >= SWIPE_THRESHOLD || e.velocityX > 0.6) doDelete();
            });

            mc.on('pancancel', resetVisual);

            mc.on('tap', (e) => {
                if (e.srcEvent.target.closest('button, select, input, a')) return;
                Store.togglePurchased(item.id);
            });

            mc.on('press', (e) => {
                if (e.srcEvent.target.closest('button, select, input, a')) return;
                if (navigator.vibrate) navigator.vibrate(20);
                that.openEditModal(item.id);
            });

            return;
        }

        /* --- Fallback (no Hammer): compact touch handling --- */
        let startX = 0, startY = 0, startTarget = null;
        let moved = false, vertical = false;
        let longPressTimer = null;

        content.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
            startTarget = e.target;
            moved = false;
            vertical = false;

            clearTimeout(longPressTimer);
            if (!startTarget.closest('button, select, input, a')) {
                longPressTimer = setTimeout(() => {
                    if (!moved && !vertical) {
                        if (navigator.vibrate) navigator.vibrate(20);
                        that.openEditModal(item.id);
                    }
                }, 500);
            }
        }, { passive: true });

        content.addEventListener('touchmove', (e) => {
            const t = e.touches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            if (Math.abs(dy) > 15 && Math.abs(dy) > Math.abs(dx)) vertical = true;
            if (vertical) return;
            if (Math.abs(dx) > 8) { moved = true; clearTimeout(longPressTimer); }
            applyFeedback(dx);
        }, { passive: true });

        content.addEventListener('touchend', (e) => {
            clearTimeout(longPressTimer);
            const t = e.changedTouches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            resetVisual();

            if (vertical) return;

            if (!moved) {
                if (startTarget && startTarget.closest('button, select, input, a')) return;
                // Tap: buy / unbuy
                Store.togglePurchased(item.id);
                return;
            }

            if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) return;
            if (dx < 0) doFavorite();
            else doDelete();
        }, { passive: true });

        if (!('ontouchstart' in window)) {
            // Desktop mouse-only: tap = buy/unbuy
            content.addEventListener('click', (e) => {
                if (e.target.closest('button, select, input, a')) return;
                Store.togglePurchased(item.id);
            });
        }
    },

    /* --- Add/Edit modal --- */
    openModal() {
        this.editingItemId = null;
        document.getElementById('modal-title').textContent = 'Add Item';
        document.getElementById('submit-btn-text').textContent = 'Save to List';
        document.getElementById('add-modal').classList.add('open');
        setTimeout(() => document.getElementById('input-name').focus(), 100);
    },

    openEditModal(id) {
        const item = Store.getAll().find(i => i.id === id);
        if (!item) return;

        this.editingItemId = id;
        document.getElementById('modal-title').textContent = 'Edit Item';
        document.getElementById('submit-btn-text').textContent = 'Update Item';

        document.getElementById('input-name').value = item.name;
        document.getElementById('input-qty').value = item.quantity;
        document.getElementById('input-unit').value = item.unit;
        document.getElementById('input-category').value = item.category;

        document.getElementById('selected-unit-text').textContent = item.unit;
        const catIcon = this.categoryIcons[item.category] || '📦';
        document.getElementById('selected-category-text').textContent = `${catIcon} ${item.category}`;

        document.getElementById('add-modal').classList.add('open');
    },

    closeModal() {
        document.getElementById('add-modal').classList.remove('open');
    },

    /* --- Render list --- */
    render() {
        const listContainer = document.getElementById('grocery-items-container');
        if (!listContainer) return;

        let items = Store.getActiveItems();

        if (this.searchQuery) {
            items = items.filter(i => i.name.toLowerCase().includes(this.searchQuery));
        }
        if (this.hideBought) {
            items = items.filter(i => !i.purchased);
        }

        listContainer.innerHTML = '';

        if (items.length === 0) {
            const isEmpty = !this.searchQuery && !this.hideBought;
            const msg = this.searchQuery ? `No results for "${this.searchQuery}".` :
                (this.hideBought ? 'Nothing left to buy in this list! 🎉' : 'Your list is empty.');
            const hint = this.searchQuery || this.hideBought ? '' : 'Add your first grocery item to get started.';
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="shopping-cart" width="64" height="64" style="opacity:0.3; margin-bottom:16px;"></i>
                    <p style="font-size: 1.2rem; font-weight:600; margin:0;">${escapeHtml(msg)}</p>
                    <p style="font-size: 0.9rem; margin:4px 0 0 0;">${escapeHtml(hint)}</p>
                    ${isEmpty ? `<button class="btn-block empty-cta" onclick="UI.openModal()">+ Add Your First Item</button>` : ''}
                </div>`;
            return;
        }

        const groups = items.reduce((acc, item) => {
            const cat = item.category || 'General';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});

        const sortedCats = Object.keys(groups).sort((a, b) => {
            if (a === 'General') return 1;
            if (b === 'General') return -1;
            // Categories with all items purchased sink to the bottom
            const aDone = groups[a].every(i => i.purchased) ? 1 : 0;
            const bDone = groups[b].every(i => i.purchased) ? 1 : 0;
            if (aDone !== bDone) return aDone - bDone;
            return a.localeCompare(b);
        });

        const printMeta = document.getElementById('print-meta');
        if (printMeta) {
            const activeCount = items.filter(i => !i.purchased).length;
            const activeList = (typeof Store !== 'undefined' && typeof Store.getActiveList === 'function')
                ? Store.getActiveList() : null;
            const listName = activeList ? activeList.name : '';
            printMeta.innerHTML = `${escapeHtml(listName)}<br>${new Date().toLocaleDateString()} — ${activeCount} item${activeCount === 1 ? '' : 's'}`;
        }

        sortedCats.forEach(cat => {
            const header = document.createElement('div');
            header.className = 'category-header';
            const icon = this.categoryIcons[cat] || '📦';
            const done = groups[cat].filter(i => i.purchased).length;
            header.innerHTML = `
                <div class="category-icon">${icon}</div>
                <span>${escapeHtml(cat)}</span>
                <span class="category-count">${done}/${groups[cat].length}</span>
            `;
            listContainer.appendChild(header);

            // Purchased items sink to the bottom of their category
            const sorted = [...groups[cat]].sort((a, b) => (a.purchased ? 1 : 0) - (b.purchased ? 1 : 0));
            sorted.forEach((item, index) => {
                const card = this.buildItemCard(item, index);
                listContainer.appendChild(card);
            });
        });

        this.refreshIcons();
    },

    refreshIcons() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    },

    buildItemCard(item, index) {
        const wrap = document.createElement('div');
        wrap.className = 'swipe-wrap';
        wrap.style.animation = `fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
        wrap.style.animationDelay = `${index * 0.03}s`;
        wrap.style.opacity = '0';

        const isFav = Store.isFavorite(item.name);

        wrap.innerHTML = `
            <div class="swipe-content card ${item.purchased ? 'purchased' : ''}${isFav ? ' fav' : ''}">
                <div class="item-info">
                    <span class="item-name">${escapeHtml(item.name)}</span>
                    <span class="item-details">${escapeHtml(String(item.quantity))} ${escapeHtml(item.unit)}</span>
                    <span class="item-flags">
                        ${isFav ? '<i data-lucide="heart" width="16" height="16" class="icon-heart"></i>' : ''}
                        ${item.purchased ? '<i data-lucide="zap" width="16" height="16" class="icon-bolt"></i>' : ''}
                    </span>
                </div>
            </div>
        `;

        this.attachGestures(wrap, item);
        return wrap;
    },

    /* --- Dashboard --- */
    updateDashboard() {
        const items = Store.getActiveItems();
        const total = items.length;
        const bought = items.filter(i => i.purchased).length;
        const pending = total - bought;

        const pendingEl = document.getElementById('stat-pending');
        if (pendingEl) pendingEl.textContent = pending;

        const ringFill = document.getElementById('ring-fill');
        if (ringFill) {
            const C = 2 * Math.PI * 60; // circumference of r=60 ring (~377)
            const pct = total > 0 ? bought / total : 0;
            ringFill.style.strokeDashoffset = String(C * (1 - pct));
        }

        const listNameEl = document.getElementById('active-list-text');
        const activeList = Store.getActiveList();
        if (listNameEl) listNameEl.textContent = activeList ? activeList.name : 'My List';
    },

    /* --- Lists rendering (Settings) --- */
    renderLists() {
        const container = document.getElementById('settings-lists-container');
        if (!container) return;
        container.innerHTML = '';
        const lists = Store.getLists();
        const activeId = Store.getActiveListId();
        const archived = lists.filter(l => l.archived);
        const active = lists.filter(l => !l.archived);

        active.forEach(list => {
            const count = Store.getAll().filter(i => i.listId === list.id).length;
            const pend = Store.getAll().filter(i => i.listId === list.id && !i.purchased).length;
            const isActive = list.id === activeId;
            const row = document.createElement('div');
            row.className = 'list-row' + (isActive ? ' active' : '');
            row.innerHTML = `
                <div style="flex:1; min-width:0;">
                    <div style="font-weight:700;">${escapeHtml(list.name)} ${isActive ? '<span class="active-badge">Active</span>' : ''}</div>
                    <div style="font-size:0.8rem; color:var(--text-secondary);">${count} items · ${pend} pending</div>
                </div>
                <button class="btn-icon list-menu-btn" title="List actions" data-list-id="${list.id}" data-archived="0" aria-haspopup="true" aria-label="List actions for ${escapeHtml(list.name)}">
                    <i data-lucide="ellipsis-vertical" width="18" height="18"></i>
                </button>
            `;
            container.appendChild(row);
        });

        if (archived.length) {
            const hist = document.createElement('div');
            hist.style.marginTop = '16px';
            hist.innerHTML = `<div class="category-header"><div class="category-icon">🕘</div><span>History (Archived)</span></div>`;
            container.appendChild(hist);
            archived.forEach(list => {
                const count = Store.getAll().filter(i => i.listId === list.id).length;
                const row = document.createElement('div');
                row.className = 'list-row archived';
                row.innerHTML = `
                    <div style="flex:1; min-width:0;">
                        <div style="font-weight:700; color:var(--text-secondary);">${escapeHtml(list.name)}</div>
                        <div style="font-size:0.8rem; color:var(--text-secondary);">${count} items</div>
                    </div>
                    <button class="btn-icon list-menu-btn" title="History actions" data-list-id="${list.id}" data-archived="1" aria-haspopup="true" aria-label="History actions for ${escapeHtml(list.name)}">
                        <i data-lucide="ellipsis-vertical" width="18" height="18"></i>
                    </button>
                `;
                container.appendChild(row);
            });
        }

        this.refreshIcons();
        container.querySelectorAll('.list-menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleListMenu(btn.getAttribute('data-list-id'), btn, btn.getAttribute('data-archived') === '1');
            });
        });
    },

    toggleListMenu(id, anchorBtn, isArchived) {
        this.closeListMenus();
        const menu = document.getElementById('list-action-menu');
        if (!menu) return;
        this.menuListId = id;

        const isActive = id === Store.getActiveListId();

        // Show/hide context-sensitive items
        const setVisible = (action, visible) => {
            const item = menu.querySelector(`.list-action-item[data-action="${action}"]`);
            if (item) item.style.display = visible ? '' : 'none';
        };
        setVisible('qr', !isArchived);
        setVisible('active', !isArchived);
        setVisible('rename', !isArchived);
        setVisible('archive', !isArchived);
        setVisible('delete', true);

        const r = anchorBtn.getBoundingClientRect();
        const menuW = 210;
        let left = r.right - menuW;
        if (left < 8) left = 8;
        if (left + menuW > window.innerWidth - 8) left = window.innerWidth - menuW - 8;
        menu.style.left = Math.max(8, left) + 'px';
        menu.style.top = (r.bottom + 6) + 'px';
        menu.classList.add('open');
        this.refreshIcons();
    },

    closeListMenus() {
        const menu = document.getElementById('list-action-menu');
        if (menu) {
            menu.classList.remove('open');
            menu.style.left = '-9999px';
        }
        this.menuListId = null;
    },

    /* --- Export / Import --- */
    exportData() { Store.exportData(); }
};

/* --- Helpers --- */
function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* --- APP CONTROLLER --- */
window.addEventListener('DOMContentLoaded', () => {
    Theme.init();
    if (typeof predefinedItems !== 'undefined') {
        Store.initData(predefinedItems);
    }

    UI.init();
    Confirm.init();
    Toast.init();

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

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .catch(() => {});
    });
}
