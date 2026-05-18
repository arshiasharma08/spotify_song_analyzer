/**
 * Sonar.ai - Enhanced Script
 * Features: Search, Recommendations, Mood Filtering, Battle Mode, Spotify Playback
 */

// ============================================================================
// GLOBAL STATE
// ============================================================================

const state = {
    songs: [],
    selectedSong: null,
    recentlyPlayed: [],
    favorites: new Set(JSON.parse(localStorage.getItem('sonar_favorites') || '[]')),
    currentPage: 1
};

const SONGS_PER_PAGE = 50;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 Sonar.ai initializing...');
    setupEventListeners();
    loadRecentlyPlayed();
    console.log('✓ Sonar.ai ready');
});

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    // Search
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (searchInput) searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.dataset.query;
            const input = document.getElementById('searchInput');
            if (input) {
                input.value = query;
                handleSearch();
            }
        });
    });
    
    // Battle
    const battleBtn = document.getElementById('battleBtn');
    if (battleBtn) battleBtn.addEventListener('click', handleBattle);
    
    // Mood filtering
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('mood-card')) {
            const mood = e.target.dataset.mood;
            filterByMood(mood);
        }
    });
    
    // Clear mood filter
    const clearMoodBtn = document.getElementById('clearMoodFilterBtn');
    if (clearMoodBtn) {
        clearMoodBtn.addEventListener('click', clearMoodFilter);
    }
}

// ============================================================================
// SEARCH
// ============================================================================

async function handleSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    
    const query = input.value.trim();
    if (!query || query.length < 2) {
        showMessage('Enter at least 2 characters', 'warning');
        return;
    }
    
    console.log(`🔍 Searching: ${query}`);
    showLoading(true);
    
    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            displaySearchResults(data.results);
        } else {
            showMessage('No songs found', 'info');
        }
    } catch (error) {
        console.error('❌ Search error:', error);
        showMessage('Search failed', 'error');
    } finally {
        showLoading(false);
    }
}

function displaySearchResults(results) {
    const resultsSection = document.getElementById('results');
    const resultsList = document.getElementById('resultsList');
    
    if (!resultsSection || !resultsList) return;
    
    resultsList.innerHTML = '';
    
    results.forEach((song, idx) => {
        const card = createSongCard(song);
        card.style.animationDelay = `${idx * 30}ms`;
        resultsList.appendChild(card);
    });
    
    resultsSection.classList.remove('hidden');
    console.log(`✓ Displayed ${results.length} results`);
}

// ============================================================================
// SONG CARD CREATION
// ============================================================================

function createSongCard(song) {
    const card = document.createElement('div');
    card.className = 'song-card';
    
    const isFavorite = state.favorites.has(song.id);
    const favoriteClass = isFavorite ? 'active' : '';
    
    card.innerHTML = `
        <div class="song-card-header">
            <div class="song-info">
                <h3 class="song-title">${escapeHtml(song.title)}</h3>
                <p class="song-artist">${escapeHtml(song.artist)}</p>
            </div>
            <div class="song-actions">
                <button class="btn-icon favorite-btn ${favoriteClass}" data-song-id="${song.id}" title="Add to favorites">
                    ♡
                </button>
                ${song.spotify_url ? `
                    <a href="${song.spotify_url}" target="_blank" class="btn-icon spotify-btn" title="Open on Spotify">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.093-.899-.513-.12-.42.093-.787.513-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.659.576.48.96-.21.339-.645.457-1.01.276l-.002-.002zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.42.12-.957-.09-1.079-.51-.12-.42.09-.957.51-1.079 4.263-1.3 9.6-.645 13.2 1.575.361.223.54.645.241 1.041l-.001-.001zm.12-3.36C15.24 9.6 8.82 9.21 5.46 10.44c-.42.15-.87-.066-.99-.474-.12-.408.066-.87.474-.99 3.99-1.32 10.99-.957 15.231 1.35.347.182.573.549.421.923-.133.289-.394.468-.771.468-.12 0-.247-.03-.36-.09l.001-.002z"/>
                        </svg>
                    </a>
                ` : ''}
            </div>
        </div>
        <div class="song-metrics">
            <div class="metric">
                <span class="metric-label">Energy</span>
                <div class="metric-bar"><div class="metric-fill" style="width: ${song.energy * 100}%"></div></div>
                <span class="metric-value">${song.energy.toFixed(2)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Dance</span>
                <div class="metric-bar"><div class="metric-fill" style="width: ${song.danceability * 100}%"></div></div>
                <span class="metric-value">${song.danceability.toFixed(2)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Tempo</span>
                <span class="metric-value">${song.tempo} BPM</span>
            </div>
            <div class="metric">
                <span class="metric-label">Pop</span>
                <span class="metric-value">${song.popularity}</span>
            </div>
        </div>
        <button class="btn btn-primary select-song-btn" data-song-id="${song.id}">
            Select & Play
        </button>
    `;
    
    // Favorite button
    const favBtn = card.querySelector('.favorite-btn');
    if (favBtn) {
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
            favBtn.classList.toggle('active');
        });
    }
    
    // Select song button
    const selectBtn = card.querySelector('.select-song-btn');
    if (selectBtn) {
        selectBtn.addEventListener('click', () => selectSong(song));
    }
    
    return card;
}

// ============================================================================
// SONG SELECTION & SPOTIFY PLAYER
// ============================================================================

function selectSong(song) {
    console.log(`♪ Selected: ${song.title}`);
    state.selectedSong = song;
    
    // Add to recently played
    addToRecentlyPlayed(song);
    
    // Show player and load recommendations
    displaySongPlayer(song);
    loadRecommendations(song.id);
    loadInsights(song.id);
}

function displaySongPlayer(song) {
    const detail = document.getElementById('song-detail');
    const content = document.getElementById('selectedSongDetail');
    
    if (!detail || !content) return;
    
    let playerHTML = `
        <div class="song-player-card">
            <div class="player-header">
                <h2>${escapeHtml(song.title)}</h2>
                <p class="player-artist">${escapeHtml(song.artist)}</p>
            </div>
    `;
    
    // Spotify embedded player
    if (song.spotify_track_id) {
        playerHTML += `
            <div class="spotify-player">
                <iframe style="border-radius: 12px" 
                    src="https://open.spotify.com/embed/track/${song.spotify_track_id}?utm_source=generator" 
                    width="100%" height="152" frameBorder="0" allowfullscreen="" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy">
                </iframe>
            </div>
        `;
    }
    
    playerHTML += `
        <div class="player-metrics">
            <div class="player-stat">
                <div class="stat-circle" style="--energy: ${song.energy}">
                    <span>⚡</span>
                </div>
                <div class="stat-label">Energy<br><strong>${song.energy.toFixed(2)}</strong></div>
            </div>
            <div class="player-stat">
                <div class="stat-circle" style="--dance: ${song.danceability}">
                    <span>💃</span>
                </div>
                <div class="stat-label">Dance<br><strong>${song.danceability.toFixed(2)}</strong></div>
            </div>
            <div class="player-stat">
                <div class="stat-circle" style="--tempo: ${Math.min(song.tempo / 200, 1)}">
                    <span>🎼</span>
                </div>
                <div class="stat-label">Tempo<br><strong>${song.tempo} BPM</strong></div>
            </div>
            <div class="player-stat">
                <div class="stat-circle" style="--popularity: ${song.popularity / 100}">
                    <span>⭐</span>
                </div>
                <div class="stat-label">Pop<br><strong>${song.popularity}</strong></div>
            </div>
        </div>
    `;
    
    if (song.spotify_url) {
        playerHTML += `
            <a href="${song.spotify_url}" target="_blank" class="btn btn-primary">
                Open Full Player on Spotify
            </a>
        `;
    }
    
    playerHTML += '</div>';
    
    content.innerHTML = playerHTML;
    detail.classList.remove('hidden');
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

async function loadRecommendations(songId) {
    console.log(`🔄 Loading recommendations for song ${songId}`);
    
    try {
        const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ song_id: songId, count: 8 })
        });
        
        const data = await response.json();
        displayRecommendations(data.recommendations);
    } catch (error) {
        console.error('❌ Recommendation error:', error);
    }
}

function displayRecommendations(recommendations) {
    const section = document.getElementById('recommendationsSection');
    const list = document.getElementById('recommendationsList');
    
    if (!section || !list) return;
    
    list.innerHTML = '';
    recommendations.forEach((rec, idx) => {
        const card = createSongCard(rec);
        card.style.animationDelay = `${idx * 50}ms`;
        list.appendChild(card);
    });
    
    section.classList.remove('hidden');
    console.log(`✓ Displayed ${recommendations.length} recommendations`);
}

// ============================================================================
// INSIGHTS
// ============================================================================

async function loadInsights(songId) {
    console.log(`💡 Loading insights for song ${songId}`);
    
    try {
        const response = await fetch('/api/insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ song_id: songId })
        });
        
        const data = await response.json();
        displayInsights(data.insights, data.mood);
    } catch (error) {
        console.error('❌ Insights error:', error);
    }
}

function displayInsights(insights, mood) {
    const section = document.getElementById('insightsSection');
    const list = document.getElementById('insightsList');
    
    if (!section || !list) return;
    
    list.innerHTML = `<div class="insights-header">
        <h4>Insights & Mood Classification</h4>
        <span class="mood-badge">${escapeHtml(mood)}</span>
    </div>`;
    
    insights.forEach((insight, idx) => {
        const item = document.createElement('div');
        item.className = 'insight-item';
        item.style.animationDelay = `${idx * 50}ms`;
        item.textContent = insight;
        list.appendChild(item);
    });
    
    section.classList.remove('hidden');
}

// ============================================================================
// MOOD FILTERING
// ============================================================================

async function filterByMood(mood) {
    console.log(`🎭 Filtering by mood: ${mood}`);
    
    try {
        const response = await fetch('/api/moods');
        const data = await response.json();
        
        const moodSongs = data.moods[mood] || [];
        displayMoodResults(mood, moodSongs);
    } catch (error) {
        console.error('❌ Mood filter error:', error);
    }
}

function displayMoodResults(mood, songs) {
    const section = document.getElementById('moodFilterResults');
    const grid = document.getElementById('moodFilterGrid');
    const title = document.getElementById('moodResultsTitle');
    
    if (!section || !grid) return;
    
    title.textContent = `${mood} (${songs.length} songs)`;
    grid.innerHTML = '';
    
    songs.forEach((song, idx) => {
        const card = createSongCard(song);
        card.style.animationDelay = `${idx * 30}ms`;
        grid.appendChild(card);
    });
    
    section.classList.remove('hidden');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearMoodFilter() {
    const section = document.getElementById('moodFilterResults');
    if (section) section.classList.add('hidden');
    document.querySelectorAll('.mood-card').forEach(card => {
        card.classList.remove('active');
    });
}

// ============================================================================
// BATTLE MODE
// ============================================================================

async function handleBattle() {
    const song1Id = parseInt(document.getElementById('song1').value);
    const song2Id = parseInt(document.getElementById('song2').value);
    
    if (!song1Id || !song2Id || song1Id === song2Id) {
        showMessage('Select two different songs', 'warning');
        return;
    }
    
    console.log(`⚔️ Battle: ${song1Id} vs ${song2Id}`);
    showLoading(true);
    
    try {
        const response = await fetch('/api/battle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ song1_id: song1Id, song2_id: song2Id })
        });
        
        const data = await response.json();
        displayBattleResults(data);
    } catch (error) {
        console.error('❌ Battle error:', error);
        showMessage('Battle failed', 'error');
    } finally {
        showLoading(false);
    }
}

function displayBattleResults(result) {
    const section = document.getElementById('battleResults');
    if (!section) return;
    
    const winner = result.winner === 'song1' ? result.song1 : result.song2;
    const loser = result.winner === 'song1' ? result.song2 : result.song1;
    
    section.innerHTML = `
        <div class="battle-container">
            <div class="battle-card winner">
                <div class="battle-medal">🏆</div>
                <h3>${escapeHtml(winner.title)}</h3>
                <p>${escapeHtml(winner.artist)}</p>
                <div class="battle-score">${(winner.score * 100).toFixed(1)}</div>
            </div>
            <div class="battle-card loser">
                <h3>${escapeHtml(loser.title)}</h3>
                <p>${escapeHtml(loser.artist)}</p>
                <div class="battle-score">${(loser.score * 100).toFixed(1)}</div>
            </div>
        </div>
    `;
    
    section.classList.remove('hidden');
}

// ============================================================================
// RECENTLY PLAYED & FAVORITES
// ============================================================================

function addToRecentlyPlayed(song) {
    state.recentlyPlayed = [song, ...state.recentlyPlayed.filter(s => s.id !== song.id)].slice(0, 10);
    localStorage.setItem('sonar_recently_played', JSON.stringify(state.recentlyPlayed));
}

function loadRecentlyPlayed() {
    const stored = localStorage.getItem('sonar_recently_played');
    if (stored) {
        state.recentlyPlayed = JSON.parse(stored);
    }
}

function toggleFavorite(songId) {
    if (state.favorites.has(songId)) {
        state.favorites.delete(songId);
    } else {
        state.favorites.add(songId);
    }
    localStorage.setItem('sonar_favorites', JSON.stringify([...state.favorites]));
    console.log(`♡ Favorites: ${state.favorites.size} songs`);
}

// ============================================================================
// UTILITIES
// ============================================================================

function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

function showMessage(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Could add toast notification here
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on load
console.log('✓ Sonar.ai script loaded');
