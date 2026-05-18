/* ============================================================================
   SONAR · AI MUSIC INTELLIGENCE — FRONTEND
   Talks to existing Flask backend (/api/search, /api/recommend, /api/battle,
   /api/moods, /api/analytics, /api/insights). No backend changes.
   ============================================================================ */

const state = {
    songs: [],
    allMoods: {},
    selectedSong: null,
    selectedMood: null,
    analytics: null,
};

const MOOD_EMOJI = {
    'Gym Energy': '💪', 'Party Vibes': '🎉', 'Energetic': '⚡',
    'Feel-Good': '😊', 'Study Session': '📚', 'Chilled': '❄️',
    'Summer Vibes': '☀️', 'Late Night': '🌙', 'Melancholy': '🌧️',
    'Focus Mode': '🎯',
};

/* ============================================================================
   BOOTSTRAP
   ============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    bindListeners();
    loadInitial();
});

/* ============================================================================
   LIGHTWEIGHT PARTICLE CANVAS (no three.js needed)
   ============================================================================ */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h, particles = [];
    const COUNT = window.innerWidth < 768 ? 30 : 60;

    function resize() {
        w = canvas.width = window.innerWidth * window.devicePixelRatio;
        h = canvas.height = window.innerHeight * window.devicePixelRatio;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < COUNT; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 1.6 + 0.4,
            hue: Math.random() > 0.5 ? 190 : 270, // cyan-ish or purple
        });
    }

    function tick() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * window.devicePixelRatio, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, 0.55)`;
            ctx.shadowBlur = 12;
            ctx.shadowColor = `hsla(${p.hue}, 100%, 65%, 0.6)`;
            ctx.fill();
        });
        requestAnimationFrame(tick);
    }
    tick();
}

/* ============================================================================
   EVENT LISTENERS
   ============================================================================ */
function bindListeners() {
    const form = document.getElementById('searchForm');
    if (form) form.addEventListener('submit', e => { e.preventDefault(); handleSearch(); });

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) searchBtn.addEventListener('click', e => { e.preventDefault(); handleSearch(); });

    const input = document.getElementById('searchInput');
    if (input) input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); handleSearch(); }
    });

    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const q = chip.dataset.query;
            document.getElementById('searchInput').value = q;
            handleSearch();
        });
    });

    const battleBtn = document.getElementById('battleBtn');
    if (battleBtn) battleBtn.addEventListener('click', handleBattle);

    const clearMood = document.getElementById('clearMoodFilterBtn');
    if (clearMood) clearMood.addEventListener('click', clearMoodFilter);
}

/* ============================================================================
   INITIAL LOAD
   ============================================================================ */
async function loadInitial() {
    await loadMoods();
    await loadAnalytics();
    populateBattleSelects();
}

/* ============================================================================
   API
   ============================================================================ */
async function api(endpoint, method = 'GET', data = null) {
    showLoading(true);
    try {
        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        if (data) opts.body = JSON.stringify(data);
        const res = await fetch(endpoint, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('API error', endpoint, err);
        return null;
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    const el = document.getElementById('loadingIndicator');
    if (el) el.classList.toggle('hidden', !show);
}

/* ============================================================================
   TOAST (inline message)
   ============================================================================ */
let toastTimer;
function toast(msg) {
    const el = document.getElementById('toast');
    const m = document.getElementById('toastMsg');
    if (!el || !m) return;
    m.textContent = msg;
    el.classList.remove('hidden');
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.classList.add('hidden'), 320);
    }, 2600);
}

/* ============================================================================
   SEARCH
   ============================================================================ */
async function handleSearch() {
    const input = document.getElementById('searchInput');
    const query = (input?.value || '').trim();
    if (query.length < 2) { toast('Type at least 2 characters'); return; }

    const result = await api('/api/search', 'POST', { query });
    if (!result || !result.results) { toast('Search failed — please try again'); return; }

    renderSearchResults(result.results);
}

function renderSearchResults(results) {
    const list = document.getElementById('resultsList');
    const section = document.getElementById('searchResults');
    const count = document.getElementById('resultsCount');
    if (!list || !section) return;

    list.innerHTML = '';
    count.textContent = `${results.length} track${results.length === 1 ? '' : 's'}`;

    if (results.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-icon">🔍</div>
                <p>No tracks matched that search. Try another title or artist.</p>
            </div>`;
        section.classList.remove('hidden');
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    results.forEach((song, i) => list.appendChild(buildResultCard(song, i)));
    section.classList.remove('hidden');
    setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function buildResultCard(song, i = 0) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.animationDelay = `${i * 50}ms`;
    card.innerHTML = `
        <h4>${escapeHtml(song.title)}</h4>
        <p>${escapeHtml(song.artist)}</p>
        <div class="metrics-row">
            <div class="metric"><div class="metric-label">Energy</div><div class="metric-value">${song.energy.toFixed(2)}</div></div>
            <div class="metric"><div class="metric-label">Dance</div><div class="metric-value">${song.danceability.toFixed(2)}</div></div>
            <div class="metric"><div class="metric-label">Tempo</div><div class="metric-value">${song.tempo}</div></div>
            <div class="metric"><div class="metric-label">Pop</div><div class="metric-value">${song.popularity}</div></div>
        </div>`;
    card.addEventListener('click', () => selectSong(song));
    return card;
}

/* ============================================================================
   SELECT SONG → RECS + INSIGHTS
   ============================================================================ */
async function selectSong(song) {
    state.selectedSong = song;
    state.selectedMood = null;
    document.querySelectorAll('.mood-card.active').forEach(el => el.classList.remove('active'));
    document.getElementById('moodFilterResults')?.classList.add('hidden');

    const card = document.getElementById('selectedSongCard');
    if (card) {
        card.innerHTML = `
            <h3 class="song-title">${escapeHtml(song.title)}</h3>
            <p class="song-artist">${escapeHtml(song.artist)}</p>
            <div class="info-grid">
                <div class="info-item"><div class="info-item-label">Energy</div><div class="info-item-value">${song.energy.toFixed(2)}</div></div>
                <div class="info-item"><div class="info-item-label">Danceability</div><div class="info-item-value">${song.danceability.toFixed(2)}</div></div>
                <div class="info-item"><div class="info-item-label">Tempo</div><div class="info-item-value">${song.tempo} <span style="font-size:0.7em;color:var(--text-muted)">BPM</span></div></div>
                <div class="info-item"><div class="info-item-label">Popularity</div><div class="info-item-value">${song.popularity}</div></div>
            </div>`;
    }
    document.getElementById('selectedSongSection')?.classList.remove('hidden');

    await Promise.all([
        getRecommendations(song.id),
        getInsights(song.id),
    ]);

    setTimeout(() => {
        document.getElementById('selectedSongSection')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
}

async function getRecommendations(songId) {
    const result = await api('/api/recommend', 'POST', { song_id: songId, count: 6 });
    if (!result || !result.recommendations) return;
    renderRecommendations(result.recommendations);
}

function renderRecommendations(recs) {
    const grid = document.getElementById('recommendationsGrid');
    const section = document.getElementById('recommendationsSection');
    if (!grid || !section) return;
    grid.innerHTML = '';

    recs.forEach((rec, i) => {
        const confidence = Math.round((rec.similarity_score || 0) * 100);
        const reason = reasonFor(confidence);
        const card = document.createElement('div');
        card.className = 'rec-card';
        card.style.animationDelay = `${i * 60}ms`;
        card.innerHTML = `
            <div class="rec-head">
                <div>
                    <div class="rec-title">${escapeHtml(rec.title)}</div>
                    <div class="rec-artist">${escapeHtml(rec.artist)}</div>
                </div>
                <div class="rec-score">${confidence}%</div>
            </div>
            <div class="rec-reason">${reason}</div>
            <div class="rec-features">
                <div class="rec-feature"><div class="feature-label">Energy</div><div class="feature-value">${rec.energy.toFixed(2)}</div></div>
                <div class="rec-feature"><div class="feature-label">Dance</div><div class="feature-value">${rec.danceability.toFixed(2)}</div></div>
                <div class="rec-feature"><div class="feature-label">Tempo</div><div class="feature-value">${rec.tempo}</div></div>
                <div class="rec-feature"><div class="feature-label">Pop</div><div class="feature-value">${rec.popularity}</div></div>
            </div>
            ${rec.mood ? `<span class="rec-mood">${escapeHtml(rec.mood)}</span>` : ''}`;
        grid.appendChild(card);
    });

    section.classList.remove('hidden');
}

function reasonFor(c) {
    if (c >= 95) return 'Near-perfect match — almost identical sonic signature.';
    if (c >= 85) return 'Tight match on energy and danceability.';
    if (c >= 75) return 'Strong overlap across multiple audio features.';
    if (c >= 65) return 'Similar overall vibe and mood.';
    return 'Recommended on broad audio similarity.';
}

async function getInsights(songId) {
    const result = await api('/api/insights', 'POST', { song_id: songId });
    if (!result || !result.insights) return;
    const list = document.getElementById('insightsList');
    const section = document.getElementById('insightsSection');
    if (!list || !section) return;
    list.innerHTML = '';
    result.insights.forEach((text, i) => {
        const item = document.createElement('div');
        item.className = 'insight-item';
        item.style.animationDelay = `${i * 80}ms`;
        item.textContent = text;
        list.appendChild(item);
    });
    section.classList.remove('hidden');
}

/* ============================================================================
   MOODS
   ============================================================================ */
async function loadMoods() {
    const result = await api('/api/moods', 'GET');
    if (!result || !result.moods) return;

    state.allMoods = result.moods;
    state.songs = [];
    Object.values(result.moods).forEach(arr => state.songs.push(...arr));

    const grid = document.getElementById('moodGrid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.entries(result.moods).forEach(([mood, songs], i) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'mood-card';
        card.style.animationDelay = `${i * 40}ms`;
        card.innerHTML = `
            <div class="mood-emoji">${MOOD_EMOJI[mood] || '🎵'}</div>
            <div class="mood-name">${escapeHtml(mood)}</div>
            <div class="mood-count">${songs.length} track${songs.length === 1 ? '' : 's'}</div>`;
        card.addEventListener('click', () => filterByMood(mood, card));
        grid.appendChild(card);
    });
}

function filterByMood(mood, cardEl) {
    document.querySelectorAll('.mood-card').forEach(c => c.classList.remove('active'));
    cardEl.classList.add('active');
    state.selectedMood = mood;

    const songs = state.allMoods[mood] || [];
    const wrap = document.getElementById('moodFilterResults');
    const title = document.getElementById('moodFilterTitle');
    const meta = document.getElementById('moodFilterMeta');
    const grid = document.getElementById('moodFilterGrid');
    const empty = document.getElementById('moodEmptyState');
    if (!wrap || !grid) return;

    title.textContent = `${MOOD_EMOJI[mood] || '🎵'} ${mood}`;
    meta.textContent = `${songs.length} track${songs.length === 1 ? '' : 's'} in this category`;
    grid.innerHTML = '';

    if (songs.length === 0) {
        empty.classList.remove('hidden');
        grid.classList.add('hidden');
    } else {
        empty.classList.add('hidden');
        grid.classList.remove('hidden');
        songs.forEach((s, i) => {
            // mood payload may lack tempo/popularity — fall back to full songs list
            const full = state.songs.find(x => x.id === s.id) || s;
            grid.appendChild(buildResultCard({
                id: full.id,
                title: full.title,
                artist: full.artist,
                energy: full.energy ?? 0,
                danceability: full.danceability ?? 0,
                tempo: full.tempo ?? 0,
                popularity: full.popularity ?? 0,
            }, i));
        });
    }

    wrap.classList.remove('hidden');
    setTimeout(() => wrap.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function clearMoodFilter() {
    state.selectedMood = null;
    document.querySelectorAll('.mood-card').forEach(c => c.classList.remove('active'));
    document.getElementById('moodFilterResults')?.classList.add('hidden');
}

/* ============================================================================
   ANALYTICS
   ============================================================================ */
async function loadAnalytics() {
    const result = await api('/api/analytics', 'GET');
    if (!result || !result.summary) return;
    state.analytics = result;

    const s = result.summary;
    animateNumber('totalSongs', s.total_songs, 0);
    animateNumber('avgEnergy', s.avg_energy, 2);
    animateNumber('avgDance', s.avg_danceability, 2);
    animateNumber('avgTempo', s.avg_tempo, 0);
    animateNumber('avgPopularity', s.avg_popularity, 0);

    // mini bars
    fillBar(document.querySelector('#avgEnergy + .bar-mini .bar-mini-fill'), s.avg_energy * 100);
    fillBar(document.querySelector('#avgDance + .bar-mini .bar-mini-fill'), s.avg_danceability * 100);
    fillBar(document.querySelector('#avgPopularity + .bar-mini .bar-mini-fill'), s.avg_popularity);

    // dominant tempo
    const td = result.distributions?.tempo || {};
    const tempoLabels = { slow: 'Slow', moderate: 'Moderate', fast: 'Fast' };
    const domTempo = Object.entries(td).sort((a, b) => b[1] - a[1])[0];
    if (domTempo) setText('dominantTempo', tempoLabels[domTempo[0]] || domTempo[0]);

    // top mood (computed from state.allMoods if available)
    const topMood = Object.entries(state.allMoods).sort((a, b) => b[1].length - a[1].length)[0];
    if (topMood) setText('commonMood', topMood[0]);

    // avg match — approximate (we don't have per-pair data); show a sensible derived value
    setText('avgMatch', Math.round(s.avg_energy * 50 + s.avg_danceability * 50) + '%');

    // charts
    renderBarChart('tempoChart', td, { slow: 'Slow (<90)', moderate: 'Moderate', fast: 'Fast (≥130)' });
    renderBarChart('energyChart', result.distributions?.energy || {}, { low: 'Low (<.4)', medium: 'Medium', high: 'High (≥.7)' });
}

function animateNumber(id, target, decimals) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = 0;
    const duration = 900;
    const t0 = performance.now();
    function step(now) {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const v = start + (target - start) * eased;
        el.textContent = decimals === 0 ? Math.round(v).toLocaleString() : v.toFixed(decimals);
        if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function fillBar(el, pct) {
    if (!el) return;
    requestAnimationFrame(() => { el.style.width = Math.max(0, Math.min(100, pct)) + '%'; });
}

function renderBarChart(id, data, labels) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '';
    const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
    Object.entries(data).forEach(([key, value], i) => {
        const pct = (value / total) * 100;
        const row = document.createElement('div');
        row.className = 'bar-row';
        row.innerHTML = `
            <div class="bar-row-label">${labels[key] || key}</div>
            <div class="bar-track"><div class="bar-fill" data-fill="${pct}"></div></div>
            <div class="bar-row-value">${value}</div>`;
        el.appendChild(row);
        setTimeout(() => {
            row.querySelector('.bar-fill').style.width = pct + '%';
        }, 100 + i * 80);
    });
}

/* ============================================================================
   BATTLE
   ============================================================================ */
function populateBattleSelects() {
    const a = document.getElementById('song1');
    const b = document.getElementById('song2');
    if (!a || !b) return;
    // deduplicate by id
    const seen = new Set();
    const uniq = state.songs.filter(s => seen.has(s.id) ? false : seen.add(s.id));
    uniq.sort((x, y) => x.title.localeCompare(y.title));

    const opts = uniq.map(s => `<option value="${s.id}">${escapeHtml(s.title)} — ${escapeHtml(s.artist)}</option>`).join('');
    a.innerHTML = `<option value="">Select song…</option>${opts}`;
    b.innerHTML = `<option value="">Select song…</option>${opts}`;
}

async function handleBattle() {
    const id1 = parseInt(document.getElementById('song1').value, 10);
    const id2 = parseInt(document.getElementById('song2').value, 10);
    if (!id1 || !id2) { toast('Pick two tracks to battle'); return; }
    if (id1 === id2) { toast('Pick two different tracks'); return; }

    const result = await api('/api/battle', 'POST', { song1_id: id1, song2_id: id2 });
    if (!result) { toast('Battle failed — try again'); return; }
    renderBattle(result);
}

function renderBattle(r) {
    const wrap = document.getElementById('battleResults');
    if (!wrap) return;
    const s1 = r.song1 || {};
    const s2 = r.song2 || {};
    const winner = r.winner || {};
    const winnerIs1 = winner.id === s1.id;

    wrap.innerHTML = `
        <div class="battle-winner">
            <div class="battle-winner-label">Winner</div>
            <div class="battle-winner-name">${escapeHtml(winner.title || '—')} ${winner.artist ? '· ' + escapeHtml(winner.artist) : ''}</div>
        </div>
        <div class="battle-comparison">
            ${battleSide(s1, winnerIs1)}
            ${battleSide(s2, !winnerIs1)}
        </div>`;
    wrap.classList.remove('hidden');
    setTimeout(() => wrap.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function battleSide(s, isWinner) {
    return `
        <div class="battle-side ${isWinner ? 'winner' : ''}">
            <div class="battle-side-title">${escapeHtml(s.title || '—')}<br><span style="color:var(--text-muted);font-weight:400;font-size:0.85rem;">${escapeHtml(s.artist || '')}</span></div>
            <div class="battle-side-features">
                <div class="battle-feature-row"><span>Energy</span><span>${(s.energy ?? 0).toFixed(2)}</span></div>
                <div class="battle-feature-row"><span>Dance</span><span>${(s.danceability ?? 0).toFixed(2)}</span></div>
                <div class="battle-feature-row"><span>Tempo</span><span>${s.tempo ?? 0} BPM</span></div>
                <div class="battle-feature-row"><span>Popularity</span><span>${s.popularity ?? 0}</span></div>
            </div>
        </div>`;
}

/* ============================================================================
   UTIL
   ============================================================================ */
function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
}

// ============================================================================
// MOOD FILTERING - Display filtered songs when mood is clicked
// ============================================================================

function displayMoodSongs(mood, songs) {
    console.log(`🎭 Displaying ${songs.length} songs for ${mood}`);
    
    const resultsSection = document.getElementById('moodFilterResults');
    const resultsGrid = document.getElementById('moodFilterGrid');
    const resultsTitle = document.getElementById('moodResultsTitle');
    const clearBtn = document.getElementById('clearMoodFilterBtn');
    
    if (!resultsSection || !resultsGrid) return;
    
    resultsTitle.textContent = `${mood} (${songs.length} songs)`;
    resultsGrid.innerHTML = '';
    
    songs.forEach((song, i) => {
        const card = document.createElement('div');
        card.className = 'mood-song-card';
        card.style.animationDelay = `${i * 30}ms`;
        
        card.innerHTML = `
            <h4>${escapeHtml(song.title)}</h4>
            <p>${escapeHtml(song.artist)}</p>
            <div class="mood-song-metrics">
                <div class="mood-metric">
                    <div class="mood-metric-label">Energy</div>
                    <div class="mood-metric-value">${song.energy.toFixed(2)}</div>
                </div>
                <div class="mood-metric">
                    <div class="mood-metric-label">Dance</div>
                    <div class="mood-metric-value">${song.danceability.toFixed(2)}</div>
                </div>
                <div class="mood-metric">
                    <div class="mood-metric-label">Tempo</div>
                    <div class="mood-metric-value">${song.tempo}</div>
                </div>
                <div class="mood-metric">
                    <div class="mood-metric-label">Pop</div>
                    <div class="mood-metric-value">${song.popularity}</div>
                </div>
            </div>
        `;
        resultsGrid.appendChild(card);
    });
    
    resultsSection.classList.remove('hidden');
    clearBtn.addEventListener('click', clearMoodFilter);
    
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

function clearMoodFilter() {
    const resultsSection = document.getElementById('moodFilterResults');
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }
    document.querySelectorAll('.mood-card').forEach(card => {
        card.classList.remove('active');
    });
}

// ============================================================================
// NAV HIGHLIGHTING - Show active section as user scrolls
// ============================================================================

function updateNavActive() {
    const scrollY = window.scrollY;
    const sections = [
        { id: 'search', nav: 'search', offset: 0 },
        { id: 'moods', nav: 'moods', offset: 800 },
        { id: 'dashboard', nav: 'dashboard', offset: 1600 },
        { id: 'battle', nav: 'battle', offset: 2400 }
    ];
    
    const active = sections.find(s => scrollY >= s.offset) || sections[0];
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-nav') === active.nav) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateNavActive, { passive: true });

// ============================================================================
// HELPER
// ============================================================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('✓ Polish & mood filtering initialized');
