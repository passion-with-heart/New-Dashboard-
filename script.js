
/* -----------------------------
  Simple client-side data model
  using localStorage so your edits persist
   ------------------------------*/

// Helpers
const $ = id => document.getElementById(id);
const saveLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const loadLS = (k, fallback) => {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
}

/* ---------- EXAM progress ---------- */
const iasData = loadLS('iasRecent', [
    { topic: 'Constitution — Fundamental Rights', status: 'Ongoing' },
    { topic: 'Modern India — 1857 Revolt', status: 'Ongoing' },
]);
function renderIas() {
    const wrap = $('iasRecent');
    wrap.innerHTML = '';
    iasData.forEach(it => {
        const r = document.createElement('div');
        r.className = 'table-row';
        r.innerHTML = `<div style="flex:1"><strong>${it.topic}</strong><div class="small muted">${it.status}</div></div>`;
        wrap.appendChild(r);
    });
    // fake percent based on items mastered:
    const mastered = iasData.filter(x => x.status === 'Mastered').length;
    const percent = Math.min(100, Math.round((mastered / Math.max(1, iasData.length)) * 100));
    $('iasPercent').innerText = percent + '%';
    $('iasProgress').style.width = percent + '%';
}
renderIas();

/* ---------- Roadmap ---------- */
const roadmap = loadLS('roadmap', [
    { step: 'HTML', status: 'Mastered' },
    { step: 'CSS', status: 'Mastered' },
    { step: 'JavaScript', status: 'In progress' },
    { step: 'Node.js', status: 'Not started' },
    { step: 'React', status: 'Not started' }
]);
function renderRoadmap() {
    const wrap = $('roadmapList'); wrap.innerHTML = '';
    roadmap.forEach(r => {
        const row = document.createElement('div'); row.className = 'table-row';
        row.innerHTML = `<div style="flex:1"><strong>${r.step}</strong><div class="small muted">${r.status}</div></div>
      <div class="tag">${r.status}</div>`;
        wrap.appendChild(row);
    });
}
renderRoadmap();

/* ---------- Kanban projects ---------- */
const kanban = loadLS('kanban', {
    ideas: [{ id: 1, title: 'Portfolio website', desc: 'Showcase 2 projects' }],
    inprogress: [{ id: 2, title: 'Stopwatch app', desc: 'Finish features' }],
    completed: [{ id: 3, title: 'JS basics notes', desc: 'Upload to Notion' }],
    portfolio: []
});
function renderKanban() {
    ['ideas', 'inprogress', 'completed', 'portfolio'].forEach(col => {
        const container = $('col-' + col); container.innerHTML = '';
        kanban[col].forEach(item => {
            const el = document.createElement('div'); el.className = 'card-item';
            el.draggable = true;
            el.dataset.col = col; el.dataset.id = item.id;
            el.innerHTML = `<h4>${item.title}</h4><p>${item.desc || ''}</p>`;
            // drag events
            el.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ id: item.id, from: col }));
            });
            container.appendChild(el);
        });
    });
}
renderKanban();

// drop support
document.querySelectorAll('.kanban-col').forEach(colEl => {
    colEl.addEventListener('dragover', e => e.preventDefault());
    colEl.addEventListener('drop', e => {
        try {
            const d = JSON.parse(e.dataTransfer.getData('text/plain'));
            const from = d.from; const id = d.id;
            const to = colEl.dataset.col;
            // move item
            const idx = kanban[from].findIndex(x => x.id === id);
            if (idx > -1) {
                const [item] = kanban[from].splice(idx, 1);
                kanban[to].push(item);
                saveLS('kanban', kanban); renderKanban();
            }
        } catch (err) { }
    });
});

// add project
$('addProjectBtn').addEventListener('click', () => {
    const title = $('newProjectTitle').value.trim(); if (!title) return;
    const newId = Date.now();
    kanban.ideas.push({ id: newId, title, desc: '' });
    saveLS('kanban', kanban); $('newProjectTitle').value = ''; renderKanban();
});

/* ---------- Habit tracker ---------- */
const habits = loadLS('habits', [
    { date: '2025-10-06', study: 3, code: 1, exercise: 30, read: 30, sleep: 7, mood: 'Okay' }
]);
function renderHabits() {
    const wr = $('habitTable'); wr.innerHTML = '';
    habits.slice(-12).reverse().forEach(h => {
        const r = document.createElement('div'); r.className = 'table-row';
        r.innerHTML = `<div style="flex:1"><strong>${h.date}</strong><div class="small muted">Study ${h.study}h • Code ${h.code}h • Sleep ${h.sleep}h</div></div>
    <div class="tag">${h.mood || '—'}</div>`;
        wr.appendChild(r);
    });
}
renderHabits();

$('addHabitBtn').addEventListener('click', () => {
    const d = $('habitDate').value || new Date().toISOString().slice(0, 10);
    const s = parseFloat($('studyHrs').value || 0);
    const c = parseFloat($('codeHrs').value || 0);
    habits.push({ date: d, study: s, code: c, exercise: 0, read: 0, sleep: 7, mood: 'Good' });
    saveLS('habits', habits); $('habitDate').value = ''; $('studyHrs').value = ''; $('codeHrs').value = ''; renderHabits();
});

/* ---------- Reading list ---------- */
const reading = loadLS('reading', [
    { id: 1, title: 'Laxmikanth — Indian Polity', type: 'Book', status: 'To Read' },
    { id: 2, title: 'MDN — JavaScript Guide', type: 'Article', status: 'Reading' }
]);
function renderReading() {
    const wr = $('readingList'); wr.innerHTML = '';
    reading.forEach(r => {
        const d = document.createElement('div'); d.className = 'table-row';
        d.innerHTML = `<div style="flex:1"><strong>${r.title}</strong><div class="small muted">${r.type} • ${r.status}</div></div><div class="tag">${r.status}</div>`;
        wr.appendChild(d);
    });
}
renderReading();

$('addReadingBtn').addEventListener('click', () => {
    const val = $('newReading').value.trim(); if (!val) return;
    const id = Date.now(); reading.push({ id, title: val, type: 'Book', status: 'To Read' }); saveLS('reading', reading); $('newReading').value = ''; renderReading();
});

/* ---------- Notes ---------- */
const notes = loadLS('notes', []);
$('saveNoteBtn').addEventListener('click', () => {
    const txt = $('dailyNote').value.trim(); if (!txt) return;
    notes.push({ date: new Date().toISOString().slice(0, 10), text: txt });
    saveLS('notes', notes); $('dailyNote').value = ''; $('noteSavedMsg').innerText = 'Saved ✓';
    setTimeout(() => $('noteSavedMsg').innerText = '', 1500);
});

/* ---------- Finance ---------- */
const finance = loadLS('finance', []);
function renderFinance() {
    const el = $('financeList'); el.innerHTML = '';
    let balance = 0;
    finance.slice(-8).reverse().forEach(f => {
        const row = document.createElement('div'); row.className = 'table-row';
        row.innerHTML = `<div style="flex:1"><strong>${f.type === 'income' ? '+' : '-'}${f.amount}</strong><div class="small muted">${f.category || ''} • ${f.date}</div></div>`;
        el.appendChild(row);
        balance += (f.type === 'income') ? Number(f.amount) : -Number(f.amount);
    });
    // show quick balance
    const b = document.createElement('div'); b.style.marginTop = '8px'; b.innerHTML = `<strong>Balance: ${balance}</strong>`;
    el.appendChild(b);
}
renderFinance();

$('addFinanceBtn').addEventListener('click', () => {
    const amt = parseFloat($('finAmt').value || 0); const t = $('finType').value;
    if (!amt) return; finance.push({ amount: amt, type: t, category: 'Misc', date: new Date().toISOString().slice(0, 10) }); saveLS('finance', finance);
    $('finAmt').value = ''; renderFinance();
});

/* ---------- Quotes ---------- */
const quotes = [
    "Consistency beats intensity.",
    "Small steps every day build great stories.",
    "Focus on direction, not speed.",
    "Discipline is the bridge between goals and accomplishment."
];
$('newQuoteBtn').addEventListener('click', () => {
    const q = quotes[Math.floor(Math.random() * quotes.length)]; $('quoteText').innerText = q;
});

/* ---------- Today focus button ---------- */
$('todayFocusBtn').addEventListener('click', () => {
    const txt = prompt('Set Today Focus (short):', $('todayFocusText').innerText);
    if (txt !== null) { $('todayFocusText').innerText = txt; saveLS('todayFocus', txt); }
});
const savedFocus = loadLS('todayFocus', 'Finish JS timer'); $('todayFocusText').innerText = savedFocus;

/* ---------- Persist some basics on load ---------- */
saveLS('iasRecent', iasData);
saveLS('roadmap', roadmap);
saveLS('kanban', kanban);
saveLS('habits', habits);
saveLS('reading', reading);
saveLS('notes', notes);
saveLS('finance', finance);
