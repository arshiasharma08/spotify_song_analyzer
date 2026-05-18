/*
 * AUDIO INTELLIGENCE PLATFORM - VERSION 2
 * Enhanced JavaScript with 3D background, mood filtering, and advanced interactivity
 * All critical IDs and functionality preserved for Flask backend compatibility
 */

/* ============================================================================
   1. GLOBAL STATE & INITIALIZATION
   ============================================================================ */

let appState = {
    allSongs: [],
    selectedSong: null,
    selectedMood: null,
    isLoading: false,
    threeScene: null
};

console.log('🎵 Audio Intelligence Platform V2 - Enhanced Frontend');

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ DOM Loaded - Initializing...');
    
    // Initialize 3D background
    init3DBackground();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadInitialData();
});

/* ============================================================================
   2. 3D BACKGROUND WITH THREE.JS
   ============================================================================ */

/**
 * Creates animated floating particles in 3D space
 * Uses Three.js for WebGL rendering
 * Creates an ambient, musical visualization behind the hero section
 */
function init3DBackground() {
    console.log('🎨 Initializing 3D background...');
    
    try {
        const container = document.getElementById('canvas-container');
        if (!container) {
            console.warn('Canvas container not found');
            return;
        }

        // Scene setup
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        const scene = new THREE.Scene();
        scene.background = null;
        scene.fog = new THREE.Fog(0x0f0f1e, 100, 2000);
        
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 30;
        
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = false;
        container.appendChild(renderer.domElement);

        // Create particles for floating music nodes visualization
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCnt = 100;
        
        const posArray = new Float32Array(particlesCnt * 3);
        for (let i = 0; i < particlesCnt * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 100;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // Create material with gradient effect
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.5,
            color: 0x00d9ff,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.6
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Store reference for animation
        appState.threeScene = {
            scene: scene,
            renderer: renderer,
            camera: camera,
            particles: particlesMesh,
            posArray: posArray
        };

        // Handle window resize
        window.addEventListener('resize', () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            
            renderer.setSize(newWidth, newHeight);
        });

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            // Rotate particles slowly
            particlesMesh.rotation.x += 0.00005;
            particlesMesh.rotation.y += 0.0001;

            // Animate particle positions for floating effect
            for (let i = 0; i < particlesCnt * 3; i += 3) {
                posArray[i] += (Math.random() - 0.5) * 0.1;
                posArray[i + 1] += (Math.random() - 0.5) * 0.1;
                posArray[i + 2] += (Math.random() - 0.5) * 0.1;

                // Keep particles in bounds
                if (posArray[i] > 50) posArray[i] = -50;
                if (posArray[i] < -50) posArray[i] = 50;
                if (posArray[i + 1] > 50) posArray[i + 1] = -50;
                if (posArray[i + 1] < -50) posArray[i + 1] = 50;
            }
            
            particlesGeometry.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        }

        animate();
        console.log('✓ 3D background initialized');

    } catch (error) {
        console.warn('Three.js initialization skipped:', error.message);
        // App still works without 3D background
    }
}

/* ============================================================================
   3. EVENT LISTENER SETUP
   ============================================================================ */

function setupEventListeners() {
    console.log('📌 Setting up event listeners...');
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Battle button
    const battleBtn = document.getElementById('battleBtn');
    if (battleBtn) {
        battleBtn.addEventListener('click', handleBattle);
    }

    // Clear mood filter button
    const clearMoodBtn = document.getElementById('clearMoodFilter');
    if (clearMoodBtn) {
        clearMoodBtn.addEventListener('click', clearMoodFilter);
    }
    
    console.log('✓ Event listeners attached');
}

/* ============================================================================
   4. INITIAL DATA LOADING
   ============================================================================ */

function loadInitialData() {
    console.log('📊 Loading initial data...');
    loadMoods();
    loadAnalytics();
}

/* ============================================================================
   5. API HELPER WITH LOADING STATES
   ============================================================================ */

async function callAPI(endpoint, method = 'GET', data = null) {
    try {
        showLoadingState(true);
        console.log(`🔄 API Call: ${method} ${endpoint}`);
        
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (data) options.body = JSON.stringify(data);
        
        const response = await fetch(endpoint, options);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const result = await response.json();
        console.log(`✓ Success: ${endpoint}`);
        return result;
        
    } catch (error) {
        console.error(`❌ API Error:`, error);
        showError(`Failed to fetch data: ${error.message}`);
        return null;
    } finally {
        showLoadingState(false);
    }
}

function showLoadingState(isLoading) {
    appState.isLoading = isLoading;
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (isLoading) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
}

/* ============================================================================
   6. SEARCH FUNCTIONALITY
   ============================================================================ */

async function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query || query.length < 2) {
        showError('Please enter at least 2 characters');
        return;
    }
    
    console.log(`🔍 Searching for: "${query}"`);
    
    const result = await callAPI('/api/search', 'POST', { query: query });
    
    if (!result || !result.results) {
        showError('Search failed. Please try again.');
        return;
    }
    
    displaySearchResults(result.results);
}

function displaySearchResults(results) {
    console.log(`📊 Displaying ${results.length} search results`);
    
    const searchResultsSection = document.getElementById('searchResultsSection');
    const resultsContainer = document.getElementById('searchResultsContainer');
    
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }
    
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No songs found. Try "levitating" or "blinding lights".</p>';
        searchResultsSection.style.display = 'block';
        return;
    }
    
    results.forEach((song, index) => {
        const card = createSongCard(song);
        resultsContainer.appendChild(card);
    });
    
    searchResultsSection.style.display = 'block';
    
    // Smooth scroll to results
    setTimeout(() => {
        searchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

function createSongCard(song) {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.style.animationDelay = Math.random() * 0.3 + 's';
    
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
    
    card.addEventListener('click', function() {
        selectSong(song);
    });
    
    return card;
}

/* ============================================================================
   7. SONG SELECTION & RECOMMENDATIONS
   ============================================================================ */

async function selectSong(song) {
    console.log(`✓ Song selected: ${song.title} (ID: ${song.id})`);
    
    appState.selectedSong = song;
    appState.selectedMood = null;
    
    // Clear mood filter when new song is selected
    document.querySelectorAll('.mood-filter-card').forEach(card => {
        card.classList.remove('active');
    });
    
    displaySelectedSong(song);
    await getRecommendations(song.id);
    await getInsights(song.id);
    populateBattleDropdowns();
    
    // Show mood filter section
    const moodFilterSection = document.getElementById('moodFilterSection');
    if (moodFilterSection) {
        moodFilterSection.style.display = 'block';
    }
}

function displaySelectedSong(song) {
    console.log(`Displaying selected song: ${song.title}`);
    
    const selectedSection = document.getElementById('selectedSongSection');
    const infoContainer = document.getElementById('selectedSongInfo');
    
    if (!infoContainer) return;
    
    infoContainer.innerHTML = `
        <div class="info-item">
            <div class="info-label">🎵 Song</div>
            <div class="info-value">${escapeHtml(song.title)}</div>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: rgba(255,255,255,0.6);">${escapeHtml(song.artist)}</p>
        </div>
        <div class="info-item">
            <div class="info-label">⚡ Energy</div>
            <div class="info-value">${song.energy.toFixed(2)}</div>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: rgba(255,255,255,0.6);">Intensity</p>
        </div>
        <div class="info-item">
            <div class="info-label">💃 Danceability</div>
            <div class="info-value">${song.danceability.toFixed(2)}</div>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: rgba(255,255,255,0.6);">Dance-worthy</p>
        </div>
        <div class="info-item">
            <div class="info-label">🎼 Tempo</div>
            <div class="info-value">${song.tempo} BPM</div>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: rgba(255,255,255,0.6);">Speed</p>
        </div>
        <div class="info-item">
            <div class="info-label">⭐ Popularity</div>
            <div class="info-value">${song.popularity}</div>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: rgba(255,255,255,0.6);">Out of 100</p>
        </div>
    `;
    
    selectedSection.style.display = 'block';
}

/**
 * Get recommendations for selected song
 * Calls Flask POST /api/recommend endpoint
 */
async function getRecommendations(songId) {
    console.log(`📎 Getting recommendations for song ${songId}`);
    
    const result = await callAPI('/api/recommend', 'POST', {
        song_id: songId,
        count: 5
    });
    
    if (!result || !result.recommendations) {
        showError('Failed to get recommendations');
        return;
    }
    
    displayRecommendations(result.recommendations);
}

function displayRecommendations(recommendations) {
    console.log(`📊 Displaying ${recommendations.length} recommendations`);
    
    const recSection = document.getElementById('recommendationsSection');
    const recContainer = document.getElementById('recommendationsContainer');
    const recSubtitle = document.getElementById('recommendationsSubtitle');
    
    if (!recContainer) return;
    
    recContainer.innerHTML = '';
    
    const reasonsMap = {
        'similar_energy': 'Recommended because it has similar energy levels.',
        'similar_danceability': 'Recommended because it matches your danceability preference.',
        'similar_tempo': 'Recommended because it has a compatible tempo.',
        'popular': 'Recommended because it\'s trending and popular.',
        'overall': 'Recommended based on overall audio similarity.'
    };
    
    recommendations.forEach((rec, index) => {
        const card = createRecommendationCard(rec, index);
        recContainer.appendChild(card);
    });
    
    if (appState.selectedMood) {
        recSubtitle.textContent = `Recommended songs matching "${appState.selectedMood}" mood`;
    } else {
        recSubtitle.textContent = 'Based on audio feature similarity analysis';
    }
    
    recSection.style.display = 'block';
    
    // Smooth scroll to recommendations
    setTimeout(() => {
        recSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
}

function createRecommendationCard(rec, index) {
    const card = document.createElement('div');
    card.className = 'recommendation-card';
    
    const confidencePercent = Math.round(rec.similarity_score * 100);
    
    // Determine recommendation reason
    let reason = 'Recommended based on audio similarity.';
    if (confidencePercent >= 95) reason = 'Perfect match! Very similar to your selection.';
    else if (confidencePercent >= 85) reason = 'High similarity in energy and danceability.';
    else if (confidencePercent >= 75) reason = 'Good match with similar audio characteristics.';
    
    card.innerHTML = `
        <h4>${escapeHtml(rec.title)}</h4>
        <div class="recommendation-artist">${escapeHtml(rec.artist)}</div>
        
        <div class="recommendation-score">${confidencePercent}% Match</div>
        
        <div class="recommendation-reason">💡 ${reason}</div>
        
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

/* ============================================================================
   8. INSIGHTS
   ============================================================================ */

async function getInsights(songId) {
    console.log(`💡 Getting insights for song ${songId}`);
    
    const result = await callAPI('/api/insights', 'POST', { song_id: songId });
    
    if (!result || !result.insights) {
        console.warn('No insights returned');
        return;
    }
    
    displayInsights(result.insights);
}

function displayInsights(insights) {
    console.log(`💡 Displaying ${insights.length} insights`);
    
    const insightsSection = document.getElementById('insightsSection');
    const insightsContainer = document.getElementById('insightsContainer');
    
    if (!insightsContainer) return;
    
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

/* ============================================================================
   9. MOOD FILTERING
   ============================================================================ */

/**
 * Populate mood filter cards
 * Called when recommendations are displayed
 */
function populateMoodFilters(moods) {
    console.log('🎭 Populating mood filters...');
    
    const moodFilterContainer = document.getElementById('moodFilterContainer');
    if (!moodFilterContainer) return;
    
    moodFilterContainer.innerHTML = '';
    
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
        card.className = 'mood-filter-card';
        
        const emoji = moodEmojis[moodName] || '🎵';
        
        card.innerHTML = `
            <div class="mood-filter-emoji">${emoji}</div>
            <div class="mood-filter-name">${escapeHtml(moodName)}</div>
            <div class="mood-filter-count">${songs.length} songs</div>
        `;
        
        card.addEventListener('click', () => {
            filterByMood(moodName, songs);
        });
        
        moodFilterContainer.appendChild(card);
    });
    
    console.log('✓ Mood filters populated');
}

/**
 * Filter recommendations by selected mood
 * Shows only songs matching the selected mood
 */
function filterByMood(moodName, moodSongs) {
    console.log(`🎭 Filtering by mood: ${moodName}`);
    
    // Update UI
    document.querySelectorAll('.mood-filter-card').forEach(card => {
        card.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    appState.selectedMood = moodName;
    
    // Filter recommendations
    const filtered = appState.currentRecommendations.filter(rec => rec.mood === moodName);
    
    if (filtered.length === 0) {
        showError(`No recommendations found for ${moodName} mood`);
        return;
    }
    
    displayRecommendations(filtered);
}

function clearMoodFilter() {
    console.log('🔄 Clearing mood filter');
    
    appState.selectedMood = null;
    
    // Clear highlight
    document.querySelectorAll('.mood-filter-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Show all recommendations
    if (appState.currentRecommendations) {
        displayRecommendations(appState.currentRecommendations);
    }
}

/* ============================================================================
   10. SONG BATTLE
   ============================================================================ */

function populateBattleDropdowns() {
    console.log(`Populating battle dropdowns with ${appState.allSongs.length} songs`);
    
    const select1 = document.getElementById('battleSong1');
    const select2 = document.getElementById('battleSong2');
    
    if (!select1 || !select2) return;
    
    if (appState.allSongs.length === 0) {
        console.warn('No songs loaded for battle');
        return;
    }
    
    select1.innerHTML = '<option value="">Select a song...</option>';
    select2.innerHTML = '<option value="">Select a song...</option>';
    
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
    
    const battleSection = document.getElementById('battleSection');
    if (battleSection) {
        battleSection.style.display = 'block';
    }
    
    console.log('✓ Battle dropdowns populated');
}

async function handleBattle() {
    console.log('⚔️ Battle handler triggered');
    
    const select1 = document.getElementById('battleSong1');
    const select2 = document.getElementById('battleSong2');
    
    const song1Id = parseInt(select1.value);
    const song2Id = parseInt(select2.value);
    
    if (!song1Id || !song2Id) {
        showError('Please select two songs');
        return;
    }
    
    if (song1Id === song2Id) {
        showError('Please select two different songs');
        return;
    }
    
    console.log(`Comparing songs: ${song1Id} vs ${song2Id}`);
    
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

function displayBattleResults(result) {
    console.log('📊 Displaying battle results');
    
    const battleSection = document.getElementById('battleSection');
    const resultsContainer = document.getElementById('battleResultsContainer');
    
    if (!resultsContainer) return;
    
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

/* ============================================================================
   11. ANALYTICS
   ============================================================================ */

async function loadAnalytics() {
    console.log('📊 Loading analytics...');
    
    const result = await callAPI('/api/analytics', 'GET');
    
    if (!result) {
        showError('Failed to load analytics');
        return;
    }
    
    displayAnalytics(result);
}

function displayAnalytics(data) {
    console.log('📊 Displaying analytics');
    
    const analyticsSection = document.getElementById('analyticsSection');
    const summaryContainer = document.getElementById('analyticsSummary');
    const chartsContainer = document.getElementById('analyticsCharts');
    
    if (!summaryContainer || !chartsContainer) return;
    
    summaryContainer.innerHTML = '';
    chartsContainer.innerHTML = '';
    
    // Summary cards
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
    
    summaryCards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'analytics-card';
        cardEl.style.animationDelay = `${index * 100}ms`;
        cardEl.innerHTML = `
            <div class="analytics-label">${card.label}</div>
            <div class="analytics-value">${card.value}</div>
            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 0.5rem;">${card.subtext}</div>
        `;
        summaryContainer.appendChild(cardEl);
    });
    
    // Charts
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

function createDistributionChart(title, data) {
    const chart = document.createElement('div');
    chart.className = 'chart';
    
    const maxValue = Math.max(...data.map(d => d.value));
    
    let barsHTML = '';
    data.forEach((item) => {
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

/* ============================================================================
   12. MOODS
   ============================================================================ */

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
    
    displayMoods(result.moods);
    populateMoodFilters(result.moods);
}

function displayMoods(moods) {
    console.log(`🎭 Displaying ${Object.keys(moods).length} mood categories`);
    
    const moodsSection = document.getElementById('moodsSection');
    const moodsContainer = document.getElementById('moodsContainer');
    
    if (!moodsContainer) return;
    
    moodsContainer.innerHTML = '';
    
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
    
    let delayCount = 0;
    Object.entries(moods).forEach(([moodName, songs]) => {
        const card = document.createElement('div');
        card.className = 'mood-card';
        card.style.animationDelay = `${Math.min(delayCount, 5) * 100}ms`;
        
        const emoji = moodEmojis[moodName] || '🎵';
        
        card.innerHTML = `
            <div class="mood-emoji">${emoji}</div>
            <div class="mood-name">${escapeHtml(moodName)}</div>
            <div class="mood-count">${songs.length} songs</div>
        `;
        
        moodsContainer.appendChild(card);
        delayCount++;
    });
    
    moodsSection.style.display = 'block';
}

/* ============================================================================
   13. UTILITY FUNCTIONS
   ============================================================================ */

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

function showError(message) {
    console.error('❌ Error:', message);
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 0, 110, 0.9);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #ff006e;
        z-index: 10000;
        max-width: 400px;
        font-size: 0.95rem;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(255, 0, 110, 0.3);
    `;
    errorDiv.textContent = `⚠️ ${message}`;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/* ============================================================================
   14. INITIALIZE ON LOAD
   ============================================================================ */

console.log('✓ Audio Intelligence Platform V2 Ready');
