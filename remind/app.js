const DEFAULT_FEEDS = [{ name: 'Jai Garage', url: 'https://jaigansa.github.io/jaigarage/index.xml' }];
let currentFilter = 'all';
let db = JSON.parse(localStorage.getItem('mh_v10_db')) || {
    bills: [], tasks: [], feeds: DEFAULT_FEEDS, 
    settings: { theme: 'dark', notifs: false, timer: '2' }
};

const sync = () => {
    localStorage.setItem('mh_v10_db', JSON.stringify(db));
    document.body.setAttribute('data-theme', db.settings.theme);
    updateFeedUI();
    render();
};

// DATA EXPORT/RESTORE
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `memory_hub_backup_${new Date().toLocaleDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedDb = JSON.parse(e.target.result);
            if (importedDb.bills && importedDb.tasks) {
                db = importedDb;
                sync();
                alert("Data Restored Successfully!");
            }
        } catch (err) { alert("Invalid Backup File"); }
    };
    reader.readAsText(file);
}

// UI LOGIC
function toggleSettings(show) { document.getElementById('settingsOverlay').style.display = show ? 'flex' : 'none'; }
function uiChange() {
    const t = document.getElementById('type-sel').value;
    document.getElementById('standard-fields').style.display = t === 'rss' ? 'none' : 'block';
    document.getElementById('rss-field').style.display = t === 'rss' ? 'block' : 'none';
    document.getElementById('in-amt').style.display = t === 'task' ? 'none' : 'block';
}

function setFilter(f, el) {
    currentFilter = f;
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    render();
}

function updateSystem() {
    db.settings.theme = document.getElementById('theme-toggle').checked ? 'light' : 'dark';
    db.settings.notifs = document.getElementById('notif-toggle').checked;
    db.settings.timer = document.getElementById('notif-timer').value;
    if(db.settings.notifs) Notification.requestPermission();
    sync();
}

function testNotification() {
    if (!("Notification" in window)) {
        alert("This browser does not support notifications.");
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            // This is the specific way to make it work on Android
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification("Memory Hub", {
                    body: "Alerts are now active!",
                    vibrate: [200, 100, 200],
                    tag: 'test-notification' // Prevents duplicate popups
                });
            });
        } else {
            alert("Please allow notifications in site settings.");
        }
    });
}

function saveEntry() {
    const type = document.getElementById('type-sel').value;
    if(type === 'rss') {
        const name = document.getElementById('rss-name-input').value;
        const url = document.getElementById('rss-url-input').value;
        if(name && url) db.feeds.push({ name, url });
    } else {
        const name = document.getElementById('in-name').value;
        const date = document.getElementById('in-date').value;
        if(!name || !date) return alert("Fill Name/Date");
        const entry = { id: Date.now(), name, date, paid: false, lastNotified: 0 };
        if(type === 'bill') {
            entry.amt = parseFloat(document.getElementById('in-amt').value) || 0;
            db.bills.push(entry);
        } else { db.tasks.push(entry); }
    }
    sync(); toggleSettings(false);
}

function checkAlarms() {
    if (!db.settings.notifs || Notification.permission !== "granted") return;
    const now = Date.now();
    const intervalMs = parseFloat(db.settings.timer) * 60 * 60 * 1000;

    [...db.bills, ...db.tasks].forEach(item => {
        const dueTime = new Date(item.date).getTime();
        if (!item.paid && dueTime <= now) {
            if (!item.lastNotified || (now - item.lastNotified) >= intervalMs) {
                
                // Android compatible notification
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification("Memory Hub Alert", {
                        body: `${item.name} is due!`,
                        vibrate: [200, 100, 200],
                        data: { url: window.location.href } 
                    });
                });

                item.lastNotified = now;
                localStorage.setItem('mh_v10_db', JSON.stringify(db));
            }
        }
    });
}
setInterval(checkAlarms, 60000);

function updateFeedUI() {
    document.getElementById('feed-selector').innerHTML = db.feeds.map(f => `<option value="${f.url}">${f.name}</option>`).join('');
    document.getElementById('news-tab-manage-list').innerHTML = db.feeds.map((f, i) => `
        <div class="feed-manage-item"><span>${f.name}</span>
        <span class="material-symbols-rounded" style="color:var(--red); cursor:pointer;" onclick="delFeed(${i})">delete</span></div>`).join('');
}

function delFeed(index) { if(confirm("Delete feed?")) { db.feeds.splice(index, 1); sync(); } }

function render() {
    document.getElementById('header-date').innerText = new Date().toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'short'});
    const unpaid = db.bills.filter(b => !b.paid).reduce((s, b) => s + b.amt, 0);
    document.getElementById('bill-big-stat').innerText = `₹${unpaid.toLocaleString()}`;
    document.getElementById('task-big-stat').innerText = db.tasks.filter(t => !t.paid).length;

    const applyFilter = (arr) => {
        if(currentFilter === 'pending') return arr.filter(i => !i.paid);
        if(currentFilter === 'completed') return arr.filter(i => i.paid);
        return arr;
    };

    const renderItem = (i, cat) => `
        <div class="card ${i.paid ? 'done' : ''}" style="border-left: 6px solid ${i.paid ? 'var(--green)' : (cat === 'bills' ? 'var(--red)' : 'var(--p)')}">
            <div style="flex:1" onclick="toggleStatus('${cat}', ${i.id})">
                <div style="font-weight:700;">${i.name}</div>
                <div style="font-size:0.75rem; opacity:0.6;">${new Date(i.date).toLocaleDateString()}</div>
            </div>
            ${i.amt ? `<div class="amt-pill">₹${i.amt}</div>` : ''}
            <span class="material-symbols-rounded" style="opacity:0.1" onclick="del('${cat}', ${i.id})">delete</span>
        </div>`;

    document.getElementById('bill-list').innerHTML = applyFilter(db.bills).map(i => renderItem(i, 'bills')).join('');
    document.getElementById('task-list').innerHTML = applyFilter(db.tasks).map(i => renderItem(i, 'tasks')).join('');
}

async function fetchNews() {
    const url = document.getElementById('feed-selector').value;
    const list = document.getElementById('news-list');
    if(!url) return list.innerHTML = '<div class="card">No feeds.</div>';
    list.innerHTML = '<div class="card">Syncing...</div>';
    try {
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
        const data = await res.json();
        list.innerHTML = data.items.map(i => `
            <div class="card" onclick="window.open('${i.link}')">
                <div style="flex:1"><b>${i.title}</b><div style="font-size:0.7rem; opacity:0.5; margin-top:5px;">${new Date(i.pubDate).toLocaleDateString()}</div></div>
            </div>`).join('');
    } catch(e) { list.innerHTML = '<div class="card">Offline</div>'; }
}

function switchTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById('tab-'+id).style.display = 'block';
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('filter-bar').style.display = id === 'news' ? 'none' : 'flex';
}

function toggleStatus(cat, id) { const item = db[cat].find(x => x.id === id); item.paid = !item.paid; sync(); }
function del(cat, id) { if(confirm("Remove?")) { db[cat] = db[cat].filter(x => x.id !== id); sync(); } }

window.onload = () => {
    document.getElementById('theme-toggle').checked = db.settings.theme === 'light';
    document.getElementById('notif-toggle').checked = db.settings.notifs;
    document.getElementById('notif-timer').value = db.settings.timer;
    sync();
};
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
