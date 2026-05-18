/*
 * AUDIO INTELLIGENCE PLATFORM - JAVASCRIPT
 * Flask API Integration & Interactive Features
 * 
 * Backend Routes Being Called:
 * - POST /api/search       Search for songs
 * - POST /api/recommend    Get recommendations
 * - POST /api/battle       Compare songs
 * - GET  /api/moods        Get mood classifications
 * - GET  /api/analytics    Get analytics data
 * - POST /api/insights     Get song insights
 */

/* ============================================================================
   1. GLOBAL STATE & INITIALIZATION
   ============================================================================ */

// Global state
let appState = {
    allSongs: [],
    selectedSong: null,
    recommendCount: 5
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 Audio Intelligence Platform initialized');
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadInitialData();
});

// ============================================================================
// 2. EVENT LISTENER SETUP
// ============================================================================

function setupEventListeners() {
    console.log('📌 Setting up event listeners...');
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    if (searchInput) {
        // Also search on Enter key
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Battle button
    const battleBtn = document.getElementById('battleBtn');
    if (battleBtn) {
        battleBtn.addEventListener('click', handleBattle);
    }
    
    console.log('✓ Event listeners attached');
}

// ============================================================================
// 3. INITIAL DATA LOADING
// ============================================================================

function loadInitialData() {
    console.log('📊 Loading initial data...');
    
    // Load moods (this gives us all songs for battle dropdowns)
    loadMoods();
    
    // Load analytics
    loadAnalytics();
}

// ============================================================================
// 4. API HELPER FUNCTION
// ============================================================================

/**
 * Generic API call wrapper
 * Handles fetch, error handling, and response parsing
 */
async function callAPI(endpoint, method = 'GET', data = null) {
    try {
        console.log(`🔄 API Call: ${method} ${endpoint}`, data);
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(endpoint, options);
        
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log(`✓ Success: ${endpoint}`, result);
        return result;
        
    } catch (error) {
        console.error(`❌ API Error (${endpoint}):`, error.message);
        showError(`Failed to fetch data: ${error.message}`);
        return null;
    }
}

// ============================================================================
// 5. SEARCH FUNCTIONALITY
// ============================================================================

/**
 * Handle search form submission
 */
async function handleSearch() {
    console.log('🔍 Search handler triggered');
    
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    // Validate input
    if (!query || query.length < 2) {
        showError('Please enter at least 2 characters');
        return;
    }
    
    console.log(`Searching for: "${query}"`);
    
    // Call API
    const result = await callAPI('/api/search', 'POST', { query: query });
    
    if (!result || !result.results) {
        showError('Search failed. Please try again.');
        return;
    }
    
    // Display results
    displaySearchResults(result.results);
}

/**
 * Display search results as cards
 */
function displaySearchResults(results) {
    console.log(`📊 Displaying ${results.length} search results`);
    
    const searchResultsSection = document.getElementById('searchResultsSection');
    const resultsContainer = document.getElementById('searchResultsContainer');
    
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b;">No songs found. Try searching for "levitating" or "blinding lights".</p>';
        searchResultsSection.style.display = 'block';
        return;
    }
    
    // Create song cards
    results.forEach(song => {
        const card = createSongCard(song);
        resultsContainer.appendChild(card);
    });
    
    searchResultsSection.style.display = 'block';
    console.log(`✓ Displayed ${results.length} song cards`);
}

/**
 * Create a song card HTML element
 */
function createSongCard(song) {
    const card = document.createElement('div');
    card.className = 'song-card';
    
    card.innerHTML = `
        <h4>${escapeHtml(song.title)}</h4>
        <p>${escapeHtml(song.artist)}</p>
        <div class="song-metrics">
            <div class="metric">
                <div class="metric-label">⚡ Energy</div>
                <div class="metric-value">${song.energy.toFixed(2)}</div>
            </div>
            <div class="metric">
                <div class="metric-label">💃 Dance</div>
                <div class="metric-value">${song.danceability.toFixed(2)}</div>
            </div>
            <div class="metric">
                <div class="metric-label">🎼 Tempo</div>
                <div class="metric-value">${song.tempo}</div>
            </div>
            <div class="metric">
                <div class="metric-label">⭐ Pop</div>
                <div class="metric-value">${song.popularity}</div>
            </div>
        </div>
    `;
    
    // Add click handler
    card.addEventListener('click', function() {
        selectSong(song);
    });
    
    return card;
}

// ============================================================================
// 6. SONG SELECTION & RECOMMENDATIONS
// ============================================================================

/**
 * Select a song and load recommendations/insights
 */
async function selectSong(song) {
    console.log(`✓ Song selected: ${song.title} (ID: ${song.id})`);
    
    appState.selectedSong = song;
    
    // Display selected song info
    displaySelectedSong(song);
    
    // Get recommendations
    await getRecommendations(song.id);
    
    // Get insights
    await getInsights(song.id);
    
    // Populate battle dropdowns
    populateBattleDropdowns();
}

/**
 * Display the selected song information
 */
function displaySelectedSong(song) {
    console.log(`Displaying selected song: ${song.title}`);
    
    const selectedSection = document.getElementById('selectedSongSection');
    const infoContainer = document.getElementById('selectedSongInfo');
    
    if (!infoContainer) {
        console.error('Selected song container not found');
        return;
    }
    
    infoContainer.innerHTML = `
        <div class="info-item">
            <div class="info-label">🎵 Song Title</div>
            <div class="info-value">${escapeHtml(song.title)}</div>
            <div class="info-subtext">${escapeHtml(song.artist)}</div>
        </div>
        <div class="info-item">
            <div class="info-label">⚡ Energy</div>
            <div class="info-value">${song.energy.toFixed(2)}</div>
            <div class="info-subtext">Intensity level</div>
        </div>
        <div class="info-item">
            <div class="info-label">💃 Danceability</div>
            <div class="info-value">${song.danceability.toFixed(2)}</div>
            <div class="info-subtext">Suitable for dancing</div>
        </div>
        <div class="info-item">
            <div class="info-label">🎼 Tempo</div>
            <div class="info-value">${song.tempo} BPM</div>
            <div class="info-subtext">Beats per minute</div>
        </div>
        <div class="info-item">
            <div class="info-label">⭐ Popularity</div>
            <div class="info-value">${song.popularity}</div>
            <div class="info-subtext">Out of 100</div>
        </div>
    `;
    
    selectedSection.style.display = 'block';
}

/**
 * Get recommendations for selected song
 */
async function getRecommendations(songId) {
    console.log(`📎 Getting recommendations for song ${songId}`);
    
    const result = await callAPI('/api/recommend', 'POST', {
        song_id: songId,
        count: appState.recommendCount
    });
    
    if (!result || !result.recommendations) {
        showError('Failed to get recommendations');
        return;
    }
    
    displayRecommendations(result.recommendations);
}

/**
 * Display recommendation cards
 */
function displayRecommendations(recommendations) {
    console.log(`📊 Displaying ${recommendations.length} recommendations`);
    
    const recSection = document.getElementById('recommendationsSection');
    const recContainer = document.getElementById('recommendationsContainer');
    
    if (!recContainer) {
        console.error('Recommendations container not found');
        return;
    }
    
    // Clear previous
    recContainer.innerHTML = '';
    
    recommendations.forEach((rec) => {
        const card = createRecommendationCard(rec);
        recContainer.appendChild(card);
    });
    
    recSection.style.display = 'block';
}

/**
 * Create a recommendation card
 */
function createRecommendationCard(rec) {
    const card = document.createElement('div');
    card.className = 'recommendation-card';
    
    const confidencePercent = Math.round(rec.similarity_score * 100);
    
    card.innerHTML = `
        <h4>${escapeHtml(rec.title)}</h4>
        <div class="recommendation-artist">${escapeHtml(rec.artist)}</div>
        
        <div class="recommendation-score">${confidencePercent}% Match</div>
        
        <div class="recommendation-features">
            <div class="feature">
                <div class="feature-label">⚡ Energy</div>
                <div class="feature-value">${rec.energy.toFixed(2)}</div>
            </div>
            <div class="feature">
                <div class="feature-label">💃 Dance</div>
                <div class="feature-value">${rec.danceability.toFixed(2)}</div>
            </div>
            <div class="feature">
                <div class="feature-label">🎼 Tempo</div>
                <div class="feature-value">${rec.tempo}</div>
            </div>
            <div class="feature">
                <div class="feature-label">⭐ Pop</div>
                <div class="feature-value">${rec.popularity}</div>
            </div>
        </div>
        
        <div class="mood-badge">${escapeHtml(rec.mood)}</div>
    `;
    
    return card;
}

// ============================================================================
// 7. INSIGHTS
// ============================================================================

/**
 * Get AI insights for selected song
 */
async function getInsights(songId) {
    console.log(`💡 Getting insights for song ${songId}`);
    
    const result = await callAPI('/api/insights', 'POST', { song_id: songId });
    
    if (!result || !result.insights) {
        console.warn('No insights returned');
        return;
    }
    
    displayInsights(result.insights);
}

/**
 * Display insights
 */
function displayInsights(insights) {
    console.log(`💡 Displaying ${insights.length} insights`);
    
    const insightsSection = document.getElementById('insightsSection');
    const insightsContainer = document.getElementById('insightsContainer');
    
    if (!insightsContainer) {
        console.error('Insights container not found');
        return;
    }
    
    insightsContainer.innerHTML = '';
    
    insights.forEach((insight, index) => {
        const item = document.createElement('div');
        item.className = 'insight-item';
        item.style.animationDelay = `${index * 100}ms`;
        item.textContent = insight;
        insightsContainer.appendChild(item);
    });
    
    insightsSection.style.display = 'block';
}

// ============================================================================
// 8. SONG BATTLE
// ============================================================================

/**
 * Populate battle dropdowns with all available songs
 */
function populateBattleDropdowns() {
    console.log(`Populating battle dropdowns with ${appState.allSongs.length} songs`);
    
    const select1 = document.getElementById('battleSong1');
    const select2 = document.getElementById('battleSong2');
    
    if (!select1 || !select2) {
        console.error('Battle select elements not found');
        return;
    }
    
    if (appState.allSongs.length === 0) {
        console.warn('No songs loaded for battle dropdowns');
        return;
    }
    
    // Clear existing options (keep placeholder)
    select1.innerHTML = '<option value="">Select a song...</option>';
    select2.innerHTML = '<option value="">Select a song...</option>';
    
    // Add all songs
    appState.allSongs.forEach(song => {
        const option1 = document.createElement('option');
        option1.value = song.id;
        option1.textContent = `${song.title} - ${song.artist}`;
        select1.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = song.id;
        option2.textContent = `${song.title} - ${song.artist}`;
        select2.appendChild(option2);
    });
    
    // Show battle section
    const battleSection = document.getElementById('battleSection');
    if (battleSection) {
        battleSection.style.display = 'block';
    }
    
    console.log('✓ Battle dropdowns populated');
}

/**
 * Handle battle comparison
 */
async function handleBattle() {
    console.log('⚔️ Battle handler triggered');
    
    const select1 = document.getElementById('battleSong1');
    const select2 = document.getElementById('battleSong2');
    
    const song1Id = parseInt(select1.value);
    const song2Id = parseInt(select2.value);
    
    // Validate selections
    if (!song1Id || !song2Id) {
        showError('Please select two songs');
        return;
    }
    
    if (song1Id === song2Id) {
        showError('Please select two different songs');
        return;
    }
    
    console.log(`Comparing songs: ${song1Id} vs ${song2Id}`);
    
    // Call API
    const result = await callAPI('/api/battle', 'POST', {
        song1_id: song1Id,
        song2_id: song2Id
    });
    
    if (!result) {
        showError('Battle comparison failed');
        return;
    }
    
    displayBattleResults(result);
}

/**
 * Display battle results
 */
function displayBattleResults(result) {
    console.log('📊 Displaying battle results');
    
    const battleSection = document.getElementById('battleSection');
    const resultsContainer = document.getElementById('battleResultsContainer');
    
    if (!resultsContainer) {
        console.error('Battle results container not found');
        return;
    }
    
    // Determine winners
    const song1Wins = result.winner === 'song1';
    const song2Wins = result.winner === 'song2';
    
    resultsContainer.innerHTML = `
        <div class="battle-card ${song1Wins ? 'winner' : ''}">
            ${song1Wins ? '<div class="winner-badge">🏆 WINNER</div>' : ''}
            <div class="battle-song-title">${escapeHtml(result.song1.title)}</div>
            <div class="battle-song-artist">${escapeHtml(result.song1.artist)}</div>
            <div class="battle-score">${Math.round(result.song1.score * 100)}</div>
            
            <div class="battle-metrics">
                <div class="battle-metric">
                    <span class="battle-metric-label">⚡ Energy</span>
                    <span class="battle-metric-value">${result.song1.metrics.energy.toFixed(2)}</span>
                </div>
                <div class="battle-metric">
                    <span class="battle-metric-label">💃 Danceability</span>
                    <span class="battle-metric-value">${result.song1.metrics.danceability.toFixed(2)}</span>
                </div>
                <div class="battle-metric">
                    <span class="battle-metric-label">🎼 Tempo</span>
                    <span class="battle-metric-value">${result.song1.metrics.tempo} BPM</span>
                </div>
                <div class="battle-metric">
                    <span class="battle-metric-label">⭐ Popularity</span>
                    <span class="battle-metric-value">${result.song1.metrics.popularity}/100</span>
                </div>
            </div>
        </div>
        
        <div class="battle-card ${song2Wins ? 'winner' : ''}">
            ${song2Wins ? '<div class="winner-badge">🏆 WINNER</div>' : ''}
            <div class="battle-song-title">${escapeHtml(result.song2.title)}</div>
            <div class="battle-song-artist">${escapeHtml(result.song2.artist)}</div>
            <div class="battle-score">${Math.round(result.song2.score * 100)}</div>
            
            <div class="battle-metrics">
                <div class="battle-metric">
                    <span class="battle-metric-label">⚡ Energy</span>
                    <span class="battle-metric-value">${result.song2.metrics.energy.toFixed(2)}</span>
                </div>
                <div class="battle-metric">
                    <span class="battle-metric-label">💃 Danceability</span>
                    <span class="battle-metric-value">${result.song2.metrics.danceability.toFixed(2)}</span>
                </div>
                <div class="battle-metric">
                    <span class="battle-metric-label">🎼 Tempo</span>
                    <span class="battle-metric-value">${result.song2.metrics.tempo} BPM</span>
                </div>
                <div class="battle-metric">
                    <span class="battle-metric-label">⭐ Popularity</span>
                    <span class="battle-metric-value">${result.song2.metrics.popularity}/100</span>
                </div>
            </div>
        </div>
    `;
    
    resultsContainer.style.display = 'grid';
}

// ============================================================================
// 9. ANALYTICS
// ============================================================================

/**
 * Load and display analytics
 */
async function loadAnalytics() {
    console.log('📊 Loading analytics...');
    
    const result = await callAPI('/api/analytics', 'GET');
    
    if (!result) {
        showError('Failed to load analytics');
        return;
    }
    
    displayAnalytics(result);
}

/**
 * Display analytics data
 */
function displayAnalytics(data) {
    console.log('📊 Displaying analytics');
    
    const analyticsSection = document.getElementById('analyticsSection');
    const summaryContainer = document.getElementById('analyticsSummary');
    const chartsContainer = document.getElementById('analyticsCharts');
    
    if (!summaryContainer || !chartsContainer) {
        console.error('Analytics containers not found');
        return;
    }
    
    // Clear previous content
    summaryContainer.innerHTML = '';
    chartsContainer.innerHTML = '';
    
    // Display summary cards
    const summaryCards = [
        {
            label: 'Total Songs',
            value: data.summary.total_songs,
            subtext: 'in collection'
        },
        {
            label: 'Avg Energy',
            value: data.summary.avg_energy.toFixed(2),
            subtext: 'on 0-1 scale'
        },
        {
            label: 'Avg Danceability',
            value: data.summary.avg_danceability.toFixed(2),
            subtext: 'on 0-1 scale'
        },
        {
            label: 'Avg Tempo',
            value: `${data.summary.avg_tempo.toFixed(0)} BPM`,
            subtext: 'average speed'
        },
        {
            label: 'Avg Popularity',
            value: data.summary.avg_popularity.toFixed(0),
            subtext: 'out of 100'
        }
    ];
    
    summaryCards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'analytics-card';
        cardEl.innerHTML = `
            <div class="analytics-label">${card.label}</div>
            <div class="analytics-value">${card.value}</div>
            <div class="analytics-subtext">${card.subtext}</div>
        `;
        summaryContainer.appendChild(cardEl);
    });
    
    // Display distribution charts
    const tempoChart = createDistributionChart(
        'Tempo Distribution',
        [
            { label: 'Slow (<90)', value: data.distributions.tempo.slow },
            { label: 'Moderate (90-130)', value: data.distributions.tempo.moderate },
            { label: 'Fast (>130)', value: data.distributions.tempo.fast }
        ]
    );
    chartsContainer.appendChild(tempoChart);
    
    const energyChart = createDistributionChart(
        'Energy Distribution',
        [
            { label: 'Low (<0.4)', value: data.distributions.energy.low },
            { label: 'Medium (0.4-0.7)', value: data.distributions.energy.medium },
            { label: 'High (>0.7)', value: data.distributions.energy.high }
        ]
    );
    chartsContainer.appendChild(energyChart);
    
    analyticsSection.style.display = 'block';
}

/**
 * Create a distribution chart
 */
function createDistributionChart(title, data) {
    const chart = document.createElement('div');
    chart.className = 'chart';
    
    // Find max value for scaling
    const maxValue = Math.max(...data.map(d => d.value));
    
    // Create bars
    let barsHTML = '';
    data.forEach((item, index) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        barsHTML += `
            <div class="chart-bar" style="height: ${percentage}%;">
                <div class="chart-bar-value">${item.value}</div>
                <div class="chart-bar-label">${item.label}</div>
            </div>
        `;
    });
    
    chart.innerHTML = `
        <div class="chart-title">${title}</div>
        <div class="chart-bars">
            ${barsHTML}
        </div>
    `;
    
    return chart;
}

// ============================================================================
// 10. MOODS
// ============================================================================

/**
 * Load mood data
 */
async function loadMoods() {
    console.log('🎭 Loading moods...');
    
    const result = await callAPI('/api/moods', 'GET');
    
    if (!result || !result.moods) {
        console.error('Failed to load moods');
        return;
    }
    
    // Extract all songs for battle dropdowns
    const allSongs = [];
    Object.values(result.moods).forEach(moodSongs => {
        allSongs.push(...moodSongs);
    });
    appState.allSongs = allSongs;
    console.log(`Loaded ${allSongs.length} songs from moods`);
    
    // Display moods
    displayMoods(result.moods);
}

/**
 * Display mood classification
 */
function displayMoods(moods) {
    console.log(`🎭 Displaying ${Object.keys(moods).length} mood categories`);
    
    const moodsSection = document.getElementById('moodsSection');
    const moodsContainer = document.getElementById('moodsContainer');
    
    if (!moodsContainer) {
        console.error('Moods container not found');
        return;
    }
    
    moodsContainer.innerHTML = '';
    
    // Mood emojis
    const moodEmojis = {
        'Gym Energy': '💪',
        'Party Vibes': '🎉',
        'Energetic': '⚡',
        'Feel-Good': '😊',
        'Study Session': '📚',
        'Chilled': '❄️',
        'Summer Vibes': '☀️',
        'Late Night': '🌙',
        'Melancholy': '😢',
        'Focus Mode': '🎯'
    };
    
    Object.entries(moods).forEach(([moodName, songs]) => {
        const card = document.createElement('div');
        card.className = 'mood-card';
        
        const emoji = moodEmojis[moodName] || '🎵';
        
        card.innerHTML = `
            <div class="mood-emoji">${emoji}</div>
            <div class="mood-name">${escapeHtml(moodName)}</div>
            <div class="mood-count">${songs.length} songs</div>
        `;
        
        moodsContainer.appendChild(card);
    });
    
    moodsSection.style.display = 'block';
}

// ============================================================================
// 11. UTILITY FUNCTIONS
// ============================================================================

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Show error message
 */
function showError(message) {
    console.error('❌ Error:', message);
    
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `⚠️ ${message}`;
    
    // Insert at top of main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
    console.log('✓ Success:', message);
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `✓ ${message}`;
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(successDiv, mainContent.firstChild);
    }
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// ============================================================================
// 12. DEBUG HELPERS
// ============================================================================

// Expose debug helpers in console
window.DEBUG = {
    state: () => {
        console.log('Current State:', appState);
        return appState;
    },
    
    testSearch: () => {
        console.log('Testing search...');
        return callAPI('/api/search', 'POST', { query: 'levitating' });
    },
    
    testMoods: () => {
        console.log('Testing moods API...');
        return callAPI('/api/moods', 'GET');
    },
    
    testAnalytics: () => {
        console.log('Testing analytics API...');
        return callAPI('/api/analytics', 'GET');
    },
    
    testBattle: (id1 = 1, id2 = 2) => {
        console.log(`Testing battle: ${id1} vs ${id2}`);
        return callAPI('/api/battle', 'POST', { song1_id: id1, song2_id: id2 });
    }
};

console.log('✓ Debug helpers available: window.DEBUG');
console.log('  Examples:');
console.log('    window.DEBUG.state()          - View current app state');
console.log('    window.DEBUG.testSearch()     - Test search API');
console.log('    window.DEBUG.testMoods()      - Test moods API');
console.log('    window.DEBUG.testAnalytics()  - Test analytics API');
console.log('    window.DEBUG.testBattle()     - Test battle API');
