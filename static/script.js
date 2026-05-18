/* ============================================================================
   SONAR · AI MUSIC INTELLIGENCE — FRONTEND
   ============================================================================ */

const state = {
    songs: [],
    allMoods: {},
    selectedSong: null,
    selectedMood: null,
    analytics: null,
};

const MOOD_EMOJI = {
    'Gym Energy': '💪',
    'Party Vibes': '🎉',
    'Energetic': '⚡',
    'Feel-Good': '😊',
    'Study Session': '📚',
    'Chilled': '❄️',
    'Summer Vibes': '☀️',
    'Late Night': '🌙',
    'Melancholy': '🌧️',
    'Focus Mode': '🎯',
    'Balanced': '🎵',
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sonar loaded');
    initParticles();
    bindListeners();
    loadInitial();
});

function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let w, h;
    let particles = [];
    const count = window.innerWidth < 768 ? 30 : 60;

    function resize() {
        w = canvas.width = window.innerWidth * window.devicePixelRatio;
        h = canvas.height = window.innerHeight * window.devicePixelRatio;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
    }

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 1.6 + 0.4,
            hue: Math.random() > 0.5 ? 190 : 270,
        });
    }

    function tick() {
        ctx.clearRect(0, 0, w, h);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

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

function bindListeners() {
    const form = document.getElementById('searchForm');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            handleSearch();
        });
    }

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', e => {
            e.preventDefault();
            handleSearch();
        });
    }

    const input = document.getElementById('searchInput');
    if (input) {
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }

    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.dataset.query;
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = query;
                handleSearch();
            }
        });
    });

    const battleBtn = document.getElementById('battleBtn');
    if (battleBtn) battleBtn.addEventListener('click', handleBattle);

    const clearMood = document.getElementById('clearMoodFilterBtn');
    if (clearMood) clearMood.addEventListener('click', clearMoodFilter);
}

async function loadInitial() {
    await loadMoods();
    await loadAnalytics();
    populateBattleSelects();
}

async function api(endpoint, method = 'GET', data = null) {
    showLoading(true);

    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };

        if (data) options.body = JSON.stringify(data);

        const response = await fetch(endpoint, options);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API error:', endpoint, error);
        toast('Something went wrong. Try again.');
        return null;
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) loader.classList.toggle('hidden', !show);
}

let toastTimer;

function toast(message) {
    const toastEl = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    if (!toastEl || !toastMsg) {
        console.log(message);
        return;
    }

    toastMsg.textContent = message;
    toastEl.classList.remove('hidden');

    requestAnimationFrame(() => toastEl.classList.add('show'));

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastEl.classList.remove('show');
        setTimeout(() => toastEl.classList.add('hidden'), 300);
    }, 2600);
}

/* ============================================================================
   SEARCH
   ============================================================================ */

async function handleSearch() {
    const input = document.getElementById('searchInput');
    const query = (input?.value || '').trim();

    if (query.length < 2) {
        toast('Type at least 2 characters');
        return;
    }

    console.log('Searching:', query);

    const result = await api('/api/search', 'POST', { query });

    if (!result || !result.results) {
        toast('Search failed. Try again.');
        return;
    }

    renderSearchResults(result.results);
}

function renderSearchResults(results) {
    const list = document.getElementById('resultsList');

    const section =
        document.getElementById('searchResults') ||
        document.getElementById('results');

    const count = document.getElementById('resultsCount');

    if (!list || !section) return;

    list.innerHTML = '';

    if (count) {
        count.textContent = `${results.length} track${results.length === 1 ? '' : 's'}`;
    }

    if (results.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-icon">🔍</div>
                <p>No tracks matched that search. Try another title or artist.</p>
            </div>
        `;
        section.classList.remove('hidden');
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    results.forEach((song, index) => {
        list.appendChild(buildResultCard(song, index));
    });

    section.classList.remove('hidden');

    setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function buildResultCard(song, index = 0) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.animationDelay = `${index * 50}ms`;

    card.innerHTML = `
        <h4>${escapeHtml(song.title)}</h4>
        <p>${escapeHtml(song.artist)}</p>

        <div class="metrics-row">
            <div class="metric">
                <div class="metric-label">Energy</div>
                <div class="metric-value">${Number(song.energy || 0).toFixed(2)}</div>
            </div>

            <div class="metric">
                <div class="metric-label">Dance</div>
                <div class="metric-value">${Number(song.danceability || 0).toFixed(2)}</div>
            </div>

            <div class="metric">
                <div class="metric-label">Tempo</div>
                <div class="metric-value">${song.tempo || 0}</div>
            </div>

            <div class="metric">
                <div class="metric-label">Pop</div>
                <div class="metric-value">${song.popularity || 0}</div>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        console.log('Song clicked:', song);
        selectSong(song);
    });

    return card;
}

/* ============================================================================
   SELECT SONG + SPOTIFY PLAYER
   ============================================================================ */

async function selectSong(song) {
    state.selectedSong = song;
    state.selectedMood = null;

    document.querySelectorAll('.mood-card.active')
        .forEach(el => el.classList.remove('active'));

    document.getElementById('moodFilterResults')?.classList.add('hidden');

    const selectedCard =
        document.getElementById('selectedSongCard') ||
        document.getElementById('selectedSongDetail');

    if (selectedCard) {
        selectedCard.innerHTML = `
            <h3 class="song-title">${escapeHtml(song.title)}</h3>
            <p class="song-artist">${escapeHtml(song.artist)}</p>

            <div class="info-grid">
                <div class="info-item">
                    <div class="info-item-label">Energy</div>
                    <div class="info-item-value">${Number(song.energy || 0).toFixed(2)}</div>
                </div>

                <div class="info-item">
                    <div class="info-item-label">Danceability</div>
                    <div class="info-item-value">${Number(song.danceability || 0).toFixed(2)}</div>
                </div>

                <div class="info-item">
                    <div class="info-item-label">Tempo</div>
                    <div class="info-item-value">
                        ${song.tempo || 0}
                        <span style="font-size:0.7em;color:var(--text-muted)">BPM</span>
                    </div>
                </div>

                <div class="info-item">
                    <div class="info-item-label">Popularity</div>
                    <div class="info-item-value">${song.popularity || 0}</div>
                </div>
            </div>
        `;
    }

    const selectedSection =
        document.getElementById('selectedSongSection') ||
        document.getElementById('song-detail');

    selectedSection?.classList.remove('hidden');

    renderSpotifyPlayer(song);

    await Promise.all([
        getRecommendations(song.id),
        getInsights(song.id),
    ]);

    setTimeout(() => {
        selectedSection?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, 150);
}

function renderSpotifyPlayer(song) {
    const player = document.getElementById('spotify-player');

    if (!player) {
        console.log('Spotify player container missing');
        return;
    }

    const trackId = song.spotify_track_id || getSpotifyTrackId(song.spotify_url);

    if (!trackId) {
        player.classList.remove('hidden');
        player.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎧</div>
                <p>No Spotify preview available for this track yet.</p>
            </div>
        `;
        return;
    }

    player.classList.remove('hidden');
    player.innerHTML = `
        <iframe
            style="border-radius:12px"
            src="https://open.spotify.com/embed/track/${trackId}"
            width="100%"
            height="152"
            frameborder="0"
            allowfullscreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy">
        </iframe>
    `;
}

function getSpotifyTrackId(url) {
    if (!url) return null;

    const match = String(url).match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}

/* ============================================================================
   RECOMMENDATIONS
   ============================================================================ */

async function getRecommendations(songId) {
    const result = await api('/api/recommend', 'POST', {
        song_id: songId,
        count: 6,
    });

    if (!result || !result.recommendations) return;

    renderRecommendations(result.recommendations);
}

function renderRecommendations(recommendations) {
    const grid =
        document.getElementById('recommendationsGrid') ||
        document.getElementById('recommendationsList');

    const section = document.getElementById('recommendationsSection');

    if (!grid || !section) return;

    grid.innerHTML = '';

    recommendations.forEach((rec, index) => {
        const score = rec.similarity_score ?? rec.similarity ?? 0;
        const confidence = Math.round(score * 100);

        const card = document.createElement('div');
        card.className = 'rec-card';
        card.style.animationDelay = `${index * 60}ms`;

        card.innerHTML = `
            <div class="rec-head">
                <div>
                    <div class="rec-title">${escapeHtml(rec.title)}</div>
                    <div class="rec-artist">${escapeHtml(rec.artist)}</div>
                </div>
                <div class="rec-score">${confidence}%</div>
            </div>

            <div class="rec-reason">${reasonFor(confidence)}</div>

            <div class="rec-features">
                <div class="rec-feature">
                    <div class="feature-label">Energy</div>
                    <div class="feature-value">${Number(rec.energy || 0).toFixed(2)}</div>
                </div>

                <div class="rec-feature">
                    <div class="feature-label">Dance</div>
                    <div class="feature-value">${Number(rec.danceability || 0).toFixed(2)}</div>
                </div>

                <div class="rec-feature">
                    <div class="feature-label">Tempo</div>
                    <div class="feature-value">${rec.tempo || 0}</div>
                </div>

                <div class="rec-feature">
                    <div class="feature-label">Pop</div>
                    <div class="feature-value">${rec.popularity || 0}</div>
                </div>
            </div>

            ${rec.mood ? `<span class="rec-mood">${escapeHtml(rec.mood)}</span>` : ''}
        `;

        card.addEventListener('click', () => selectSong(rec));

        grid.appendChild(card);
    });

    section.classList.remove('hidden');
}

function reasonFor(confidence) {
    if (confidence >= 95) return 'Near-perfect match with a very similar sonic signature.';
    if (confidence >= 85) return 'Strong match based on energy and danceability.';
    if (confidence >= 75) return 'Good overlap across multiple audio features.';
    if (confidence >= 65) return 'Similar overall mood and audio profile.';
    return 'Recommended based on broad audio similarity.';
}

/* ============================================================================
   INSIGHTS
   ============================================================================ */

async function getInsights(songId) {
    const result = await api('/api/insights', 'POST', { song_id: songId });

    if (!result || !result.insights) return;

    const list = document.getElementById('insightsList');
    const section = document.getElementById('insightsSection');

    if (!list || !section) return;

    list.innerHTML = '';

    result.insights.forEach((text, index) => {
        const item = document.createElement('div');
        item.className = 'insight-item';
        item.style.animationDelay = `${index * 80}ms`;
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

    Object.values(result.moods).forEach(arr => {
        state.songs.push(...arr);
    });

    const grid = document.getElementById('moodGrid');
    if (!grid) return;

    grid.innerHTML = '';

    Object.entries(result.moods).forEach(([mood, songs], index) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'mood-card';
        card.style.animationDelay = `${index * 40}ms`;

        card.innerHTML = `
            <div class="mood-emoji">${MOOD_EMOJI[mood] || '🎵'}</div>
            <div class="mood-name">${escapeHtml(mood)}</div>
            <div class="mood-count">${songs.length} track${songs.length === 1 ? '' : 's'}</div>
        `;

        card.addEventListener('click', () => filterByMood(mood, card));

        grid.appendChild(card);
    });
}

function filterByMood(mood, cardEl) {
    document.querySelectorAll('.mood-card')
        .forEach(card => card.classList.remove('active'));

    cardEl.classList.add('active');
    state.selectedMood = mood;

    const songs = state.allMoods[mood] || [];

    const wrapper = document.getElementById('moodFilterResults');
    const title =
        document.getElementById('moodFilterTitle') ||
        document.getElementById('moodResultsTitle');

    const meta = document.getElementById('moodFilterMeta');
    const grid = document.getElementById('moodFilterGrid');
    const empty = document.getElementById('moodEmptyState');

    if (!wrapper || !grid) return;

    if (title) title.textContent = `${MOOD_EMOJI[mood] || '🎵'} ${mood}`;
    if (meta) meta.textContent = `${songs.length} track${songs.length === 1 ? '' : 's'} in this category`;

    grid.innerHTML = '';

    if (songs.length === 0) {
        if (empty) empty.classList.remove('hidden');
        grid.classList.add('hidden');
    } else {
        if (empty) empty.classList.add('hidden');
        grid.classList.remove('hidden');

        songs.forEach((song, index) => {
            grid.appendChild(buildResultCard(song, index));
        });
    }

    wrapper.classList.remove('hidden');

    setTimeout(() => {
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function clearMoodFilter() {
    state.selectedMood = null;

    document.querySelectorAll('.mood-card')
        .forEach(card => card.classList.remove('active'));

    document.getElementById('moodFilterResults')?.classList.add('hidden');
}

/* ============================================================================
   ANALYTICS
   ============================================================================ */

async function loadAnalytics() {
    const result = await api('/api/analytics', 'GET');

    if (!result || !result.summary) return;

    state.analytics = result;

    const summary = result.summary;

    animateNumber('totalSongs', summary.total_songs, 0);
    animateNumber('avgEnergy', summary.avg_energy, 2);
    animateNumber('avgDance', summary.avg_danceability, 2);
    animateNumber('avgDanceability', summary.avg_danceability, 2);
    animateNumber('avgTempo', summary.avg_tempo, 0);
    animateNumber('avgPopularity', summary.avg_popularity, 0);

    const topMood =
        summary.most_common_mood ||
        Object.entries(state.allMoods).sort((a, b) => b[1].length - a[1].length)[0]?.[0];

    if (topMood) setText('commonMood', topMood);

    const tempoData = result.distributions?.tempo || {};
    const energyData = result.distributions?.energy || {};

    renderBarChart('tempoChart', tempoData, {
        slow: 'Slow',
        moderate: 'Moderate',
        fast: 'Fast',
    });

    renderBarChart('energyChart', energyData, {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
    });
}

function animateNumber(id, target, decimals) {
    const el = document.getElementById(id);
    if (!el) return;

    const start = 0;
    const duration = 900;
    const startTime = performance.now();

    function step(now) {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = start + (target - start) * eased;

        el.textContent = decimals === 0
            ? Math.round(value).toLocaleString()
            : value.toFixed(decimals);

        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function renderBarChart(id, data, labels) {
    const chart = document.getElementById(id);
    if (!chart) return;

    chart.innerHTML = '';

    const total = Object.values(data).reduce((sum, value) => sum + value, 0) || 1;

    Object.entries(data).forEach(([key, value], index) => {
        const percent = (value / total) * 100;

        const row = document.createElement('div');
        row.className = 'bar-row';

        row.innerHTML = `
            <div class="bar-row-label">${labels[key] || key}</div>
            <div class="bar-track">
                <div class="bar-fill" style="width: 0"></div>
            </div>
            <div class="bar-row-value">${value}</div>
        `;

        chart.appendChild(row);

        setTimeout(() => {
            row.querySelector('.bar-fill').style.width = percent + '%';
        }, 100 + index * 80);
    });
}

/* ============================================================================
   BATTLE
   ============================================================================ */

function populateBattleSelects() {
    const song1 = document.getElementById('song1');
    const song2 = document.getElementById('song2');

    if (!song1 || !song2) return;

    const seen = new Set();

    const uniqueSongs = state.songs.filter(song => {
        if (seen.has(song.id)) return false;
        seen.add(song.id);
        return true;
    });

    uniqueSongs.sort((a, b) => a.title.localeCompare(b.title));

    const options = uniqueSongs
        .map(song => `<option value="${song.id}">${escapeHtml(song.title)} — ${escapeHtml(song.artist)}</option>`)
        .join('');

    song1.innerHTML = `<option value="">Select song…</option>${options}`;
    song2.innerHTML = `<option value="">Select song…</option>${options}`;
}

async function handleBattle() {
    const id1 = parseInt(document.getElementById('song1')?.value, 10);
    const id2 = parseInt(document.getElementById('song2')?.value, 10);

    if (!id1 || !id2) {
        toast('Pick two tracks to battle');
        return;
    }

    if (id1 === id2) {
        toast('Pick two different tracks');
        return;
    }

    const result = await api('/api/battle', 'POST', {
        song1_id: id1,
        song2_id: id2,
    });

    if (!result) {
        toast('Battle failed. Try again.');
        return;
    }

    renderBattle(result);
}

function renderBattle(result) {
    const wrapper = document.getElementById('battleResults');
    if (!wrapper) return;

    const song1 = result.song1 || {};
    const song2 = result.song2 || {};

    const winnerIs1 = result.winner === 'song1';
    const winner = winnerIs1 ? song1 : song2;

    wrapper.innerHTML = `
        <div class="battle-winner">
            <div class="battle-winner-label">Winner</div>
            <div class="battle-winner-name">
                ${escapeHtml(winner.title || '—')}
                ${winner.artist ? ' · ' + escapeHtml(winner.artist) : ''}
            </div>
        </div>

        <div class="battle-comparison">
            ${battleSide(song1, winnerIs1)}
            ${battleSide(song2, !winnerIs1)}
        </div>
    `;

    wrapper.classList.remove('hidden');

    setTimeout(() => {
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function battleSide(song, isWinner) {
    return `
        <div class="battle-side ${isWinner ? 'winner' : ''}">
            <div class="battle-side-title">
                ${escapeHtml(song.title || '—')}<br>
                <span style="color:var(--text-muted);font-weight:400;font-size:0.85rem;">
                    ${escapeHtml(song.artist || '')}
                </span>
            </div>

            <div class="battle-side-features">
                <div class="battle-feature-row">
                    <span>Energy</span>
                    <span>${Number(song.energy || 0).toFixed(2)}</span>
                </div>

                <div class="battle-feature-row">
                    <span>Dance</span>
                    <span>${Number(song.danceability || 0).toFixed(2)}</span>
                </div>

                <div class="battle-feature-row">
                    <span>Tempo</span>
                    <span>${song.tempo || 0} BPM</span>
                </div>

                <div class="battle-feature-row">
                    <span>Popularity</span>
                    <span>${song.popularity || 0}</span>
                </div>
            </div>
        </div>
    `;
}

/* ============================================================================
   UTIL
   ============================================================================ */

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[char]));
}
