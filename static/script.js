/* ============================================================================
   AUDIO INTELLIGENCE PLATFORM - FIXED JAVASCRIPT
   All functionality restored with debugging
   ============================================================================ */

// STATE MANAGEMENT
const state = {
    songs: [],
    selectedSong: null,
    selectedMood: null,
    currentRecommendations: [],
    analytics: null
};

// INITIALIZATION - ALL EVENT LISTENERS INSIDE DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 Audio Intelligence Platform initializing...');
    
    // Initialize 3D background
    init3D();
    
    // Setup event listeners FIRST
    console.log('📌 Setting up event listeners...');
    setupListeners();
    
    // Load initial data
    console.log('📊 Loading initial data...');
    loadInitialData();
    
    console.log('✓ Platform ready');
});

/* ============================================================================
   3D BACKGROUND WITH THREE.JS
   ============================================================================ */

let scene, camera, renderer, particles;

function init3D() {
    console.log('🎨 Initializing 3D background...');
    
    try {
        const canvas = document.getElementById('canvas-3d');
        if (!canvas) {
            console.warn('Canvas not found');
            return;
        }

        // Scene setup
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 50;
        
        renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true, 
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        // Create particles
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 200;
            positions[i + 1] = (Math.random() - 0.5) * 200;
            positions[i + 2] = (Math.random() - 0.5) * 200;

            colors[i] = 0;
            colors[i + 1] = 0.85;
            colors[i + 2] = 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.8,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.6,
            vertexColors: true
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            particles.rotation.x += 0.0001;
            particles.rotation.y += 0.0002;

            // Slight floating motion
            const positions = geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += (Math.random() - 0.5) * 0.2;
                positions[i + 1] += (Math.random() - 0.5) * 0.2;
                positions[i + 2] += (Math.random() - 0.5) * 0.2;

                // Keep in bounds
                if (positions[i] > 100) positions[i] = -100;
                if (positions[i] < -100) positions[i] = 100;
                if (positions[i + 1] > 100) positions[i + 1] = -100;
                if (positions[i + 1] < -100) positions[i + 1] = 100;
            }

            geometry.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });

        // Mouse interaction
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            camera.position.x = x * 10;
            camera.position.y = y * 10;
        });

        animate();
        console.log('✓ 3D background initialized');

    } catch (error) {
        console.warn('3D initialization failed:', error.message);
    }
}

/* ============================================================================
   EVENT LISTENERS - INSIDE DOMContentLoaded
   ============================================================================ */

function setupListeners() {
    // Search button
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        console.log('✓ Found searchBtn');
        searchBtn.addEventListener('click', () => {
            console.log('🔍 SEARCH BUTTON CLICKED');
            handleSearch();
        });
    } else {
        console.error('❌ searchBtn not found');
    }

    // Search input Enter key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        console.log('✓ Found searchInput');
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('🔍 SEARCH INPUT ENTER PRESSED');
                handleSearch();
            }
        });
    } else {
        console.error('❌ searchInput not found');
    }

    // Battle button
    const battleBtn = document.getElementById('battleBtn');
    if (battleBtn) {
        console.log('✓ Found battleBtn');
        battleBtn.addEventListener('click', () => {
            console.log('⚔️ BATTLE BUTTON CLICKED');
            handleBattle();
        });
    } else {
        console.error('❌ battleBtn not found');
    }

    // Clear mood filter
    const clearBtn = document.getElementById('clearMoodBtn');
    if (clearBtn) {
        console.log('✓ Found clearMoodBtn');
        clearBtn.addEventListener('click', () => {
            console.log('🔄 CLEAR MOOD FILTER CLICKED');
            clearMoodFilter();
        });
    } else {
        console.warn('clearMoodBtn not found (will be added dynamically)');
    }

    console.log('✓ Event listeners setup complete');
}

/* ============================================================================
   INITIAL DATA LOADING
   ============================================================================ */

async function loadInitialData() {
    console.log('📊 Loading moods and analytics...');
    
    // Load moods (gets all songs)
    await loadMoods();
    
    // Load analytics
    await loadAnalytics();
}

/* ============================================================================
   API HELPER
   ============================================================================ */

async function callAPI(endpoint, method = 'GET', data = null) {
    try {
        showLoading(true);
        console.log(`📡 API Call: ${method} ${endpoint}`, data);
        
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (data) options.body = JSON.stringify(data);
        
        const response = await fetch(endpoint, options);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const result = await response.json();
        console.log(`✓ API Success: ${endpoint}`, result);
        return result;
        
    } catch (error) {
        console.error('❌ API Error:', error);
        return null;
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
        if (show) {
            loader.classList.remove('hidden');
            console.log('⏳ Loading...');
        } else {
            loader.classList.add('hidden');
        }
    }
}

/* ============================================================================
   SEARCH FUNCTIONALITY
   ============================================================================ */

async function handleSearch() {
    console.log('🔍 handleSearch called');
    
    const input = document.getElementById('searchInput');
    if (!input) {
        console.error('❌ searchInput element not found');
        return;
    }
    
    const query = input.value.trim();
    console.log(`Searching for: "${query}"`);
    
    if (!query || query.length < 2) {
        console.warn('⚠️ Query too short');
        showInlineMessage('Please enter at least 2 characters', 'warning');
        return;
    }

    console.log(`📡 Calling /api/search with query: "${query}"`);
    const result = await callAPI('/api/search', 'POST', { query });
    
    if (!result || !result.results) {
        console.error('❌ Search failed - no results');
        showInlineMessage('Search failed. Please try again.', 'error');
        return;
    }

    console.log(`✓ Got ${result.results.length} results`);
    displaySearchResults(result.results);
}

function displaySearchResults(results) {
    console.log(`📊 displaySearchResults with ${results.length} items`);
    
    const container = document.getElementById('resultsList');
    const section = document.getElementById('searchResults');
    
    if (!container || !section) {
        console.error('❌ resultsList or searchResults element not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (results.length === 0) {
        console.warn('No results to display');
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.6);">No songs found</p>';
        section.classList.remove('hidden');
        return;
    }

    results.forEach((song, idx) => {
        console.log(`Adding result: ${song.title} by ${song.artist}`);
        
        const card = document.createElement('div');
        card.className = 'result-card';
        card.style.animationDelay = `${idx * 50}ms`;
        
        card.innerHTML = `
            <h4>${escapeHtml(song.title)}</h4>
            <p>${escapeHtml(song.artist)}</p>
            <div class="metrics-row">
                <div class="metric">
                    <div class="metric-label">Energy</div>
                    <div class="metric-value">${song.energy.toFixed(2)}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Dance</div>
                    <div class="metric-value">${song.danceability.toFixed(2)}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Tempo</div>
                    <div class="metric-value">${song.tempo}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Pop</div>
                    <div class="metric-value">${song.popularity}</div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            console.log(`🎵 Clicked song: ${song.title}`);
            selectSong(song);
        });
        
        container.appendChild(card);
    });

    console.log('✓ Results displayed, removing hidden class');
    section.classList.remove('hidden');
}

/* ============================================================================
   SONG SELECTION & RECOMMENDATIONS
   ============================================================================ */

async function selectSong(song) {
    console.log(`✓ selectSong: ${song.title} (ID: ${song.id})`);
    
    state.selectedSong = song;
    state.selectedMood = null;
    
    // Clear mood filter
    document.querySelectorAll('.mood-card').forEach(m => {
        m.classList.remove('active');
        console.log('Removed active class from mood card');
    });
    const clearBtn = document.getElementById('clearMoodBtn');
    if (clearBtn) clearBtn.classList.add('hidden');
    const summary = document.querySelector('.mood-summary');
    if (summary) summary.classList.add('hidden');
    
    // Display selected song
    const card = document.getElementById('selectedSongCard');
    if (card) {
        card.innerHTML = `
            <h3 class="song-title">${escapeHtml(song.title)}</h3>
            <p class="song-artist">${escapeHtml(song.artist)}</p>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-item-label">Energy</div>
                    <div class="info-item-value">${song.energy.toFixed(2)}</div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">Danceability</div>
                    <div class="info-item-value">${song.danceability.toFixed(2)}</div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">Tempo</div>
                    <div class="info-item-value">${song.tempo} BPM</div>
                </div>
                <div class="info-item">
                    <div class="info-item-label">Popularity</div>
                    <div class="info-item-value">${song.popularity}</div>
                </div>
            </div>
        `;
        console.log('✓ Updated selectedSongCard');
    }
    
    const section = document.getElementById('selectedSongSection');
    if (section) {
        section.classList.remove('hidden');
        console.log('✓ Showing selectedSongSection');
    }

    // Get recommendations
    await getRecommendations(song.id);
    
    // Get insights
    await getInsights(song.id);

    // Populate battle dropdowns
    populateBattle();
}

async function getRecommendations(songId) {
    console.log(`📎 Getting recommendations for song ${songId}`);
    
    const result = await callAPI('/api/recommend', 'POST', {
        song_id: songId,
        count: 5
    });
    
    if (!result || !result.recommendations) {
        console.error('❌ No recommendations returned');
        return;
    }
    
    console.log(`✓ Got ${result.recommendations.length} recommendations`);
    state.currentRecommendations = result.recommendations;
    displayRecommendations(result.recommendations);
}

function displayRecommendations(recs) {
    console.log(`📊 displayRecommendations with ${recs.length} items`);
    
    const container = document.getElementById('recommendationsGrid');
    const section = document.getElementById('recommendationsSection');
    const subtitle = document.getElementById('recSubtitle');
    
    if (!container || !section) {
        console.error('❌ recommendationsGrid or recommendationsSection not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (state.selectedMood) {
        subtitle.textContent = `Based on "${state.selectedMood}" mood`;
    } else {
        subtitle.textContent = 'Based on audio feature similarity';
    }

    recs.forEach((rec, idx) => {
        const confidence = Math.round(rec.similarity_score * 100);
        const reason = getRecommendationReason(confidence);
        
        console.log(`Adding recommendation: ${rec.title} (${confidence}%)`);
        
        const card = document.createElement('div');
        card.className = 'rec-card';
        card.style.animationDelay = `${idx * 50}ms`;
        
        card.innerHTML = `
            <h4 class="rec-title">${escapeHtml(rec.title)}</h4>
            <p class="rec-artist">${escapeHtml(rec.artist)}</p>
            <div class="rec-score">${confidence}% Match</div>
            <div class="rec-reason">💡 ${reason}</div>
            <div class="rec-features">
                <div class="rec-feature">
                    <div class="feature-label">⚡ Energy</div>
                    <div class="feature-value">${rec.energy.toFixed(2)}</div>
                </div>
                <div class="rec-feature">
                    <div class="feature-label">💃 Dance</div>
                    <div class="feature-value">${rec.danceability.toFixed(2)}</div>
                </div>
                <div class="rec-feature">
                    <div class="feature-label">🎼 Tempo</div>
                    <div class="feature-value">${rec.tempo}</div>
                </div>
                <div class="rec-feature">
                    <div class="feature-label">⭐ Pop</div>
                    <div class="feature-value">${rec.popularity}</div>
                </div>
            </div>
            <span class="rec-mood">${escapeHtml(rec.mood)}</span>
        `;
        
        container.appendChild(card);
    });

    section.classList.remove('hidden');
    console.log('✓ Recommendations displayed');
    
    // Smooth scroll
    setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

function getRecommendationReason(confidence) {
    if (confidence >= 95) return 'Perfect match! Very similar to your selection.';
    if (confidence >= 85) return 'High similarity in energy and danceability.';
    if (confidence >= 75) return 'Good match with similar audio characteristics.';
    if (confidence >= 65) return 'Similar in overall vibe and mood.';
    return 'Recommended based on audio similarity.';
}

async function getInsights(songId) {
    console.log(`💡 Getting insights for song ${songId}`);
    
    const result = await callAPI('/api/insights', 'POST', { song_id: songId });
    if (!result || !result.insights) {
        console.warn('⚠️ No insights returned');
        return;
    }
    
    console.log(`✓ Got ${result.insights.length} insights`);
    
    const container = document.getElementById('insightsList');
    if (!container) {
        console.error('❌ insightsList not found');
        return;
    }
    
    container.innerHTML = '';
    
    result.insights.forEach((insight, idx) => {
        const item = document.createElement('div');
        item.className = 'insight-item';
        item.style.animationDelay = `${idx * 100}ms`;
        item.textContent = insight;
        container.appendChild(item);
    });
    
    const section = document.getElementById('insightsSection');
    if (section) {
        section.classList.remove('hidden');
        console.log('✓ Insights displayed');
    }
}

/* ============================================================================
   MOOD FILTERING
   ============================================================================ */

async function loadMoods() {
    console.log('🎭 loadMoods called');
    
    const result = await callAPI('/api/moods', 'GET');
    if (!result || !result.moods) {
        console.error('❌ No moods returned');
        return;
    }
    
    console.log(`✓ Got moods data`);
    
    // Extract all songs
    state.songs = [];
    Object.values(result.moods).forEach(songs => {
        state.songs.push(...songs);
    });
    console.log(`✓ Loaded ${state.songs.length} total songs`);

    // Display mood cards
    const container = document.getElementById('moodGrid');
    if (!container) {
        console.error('❌ moodGrid not found');
        return;
    }
    
    container.innerHTML = '';
    
    const moodEmojis = {
        'Gym Energy': '💪', 'Party Vibes': '🎉', 'Energetic': '⚡',
        'Feel-Good': '😊', 'Study Session': '📚', 'Chilled': '❄️',
        'Summer Vibes': '☀️', 'Late Night': '🌙', 'Melancholy': '😢',
        'Focus Mode': '🎯'
    };
    
    Object.entries(result.moods).forEach(([mood, songs], idx) => {
        console.log(`Adding mood card: ${mood} (${songs.length} songs)`);
        
        const card = document.createElement('div');
        card.className = 'mood-card';
        card.style.animationDelay = `${idx * 50}ms`;
        
        const emoji = moodEmojis[mood] || '🎵';
        card.innerHTML = `
            <div class="mood-emoji">${emoji}</div>
            <div class="mood-name">${escapeHtml(mood)}</div>
            <div class="mood-count">${songs.length} songs</div>
        `;
        
        card.addEventListener('click', () => {
            console.log(`🎭 MOOD CARD CLICKED: ${mood}`);
            filterByMood(mood, result.moods);
        });
        
        container.appendChild(card);
    });
    
    console.log('✓ Mood cards displayed');

    // Display moods showcase
    const showcase = document.getElementById('moodsShowcaseGrid');
    if (showcase) {
        showcase.innerHTML = '';
        
        Object.entries(result.moods).forEach(([mood, songs]) => {
            const card = document.createElement('div');
            card.className = 'mood-showcase-card';
            
            const emoji = moodEmojis[mood] || '🎵';
            card.innerHTML = `
                <div class="mood-large-emoji">${emoji}</div>
                <h4 class="mood-showcase-name">${escapeHtml(mood)}</h4>
                <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem;">${songs.length} songs in collection</p>
            `;
            
            showcase.appendChild(card);
        });
        
        console.log('✓ Mood showcase displayed');
    }
}

function filterByMood(mood, allMoods) {
    console.log(`🎭 filterByMood: ${mood}`);
    
    state.selectedMood = mood;
    
    // Update UI
    document.querySelectorAll('.mood-card').forEach(card => {
        const name = card.querySelector('.mood-name');
        if (name && name.textContent.trim() === mood) {
            card.classList.add('active');
            console.log(`✓ Highlighted ${mood}`);
        } else {
            card.classList.remove('active');
        }
    });
    
    const clearBtn = document.getElementById('clearMoodBtn');
    if (clearBtn) {
        clearBtn.classList.remove('hidden');
        console.log('✓ Showing clear button');
    }
    
    // Filter recommendations
    const filtered = state.currentRecommendations.filter(rec => rec.mood === mood);
    console.log(`Filtered to ${filtered.length} recommendations`);
    
    if (filtered.length === 0) {
        console.warn(`No recommendations for ${mood}`);
        displayNoRecommendationsMessage(mood);
        return;
    }
    
    // Update summary
    const summary = document.querySelector('.mood-summary');
    if (summary) {
        summary.innerHTML = `Filtering recommendations by <strong>${mood}</strong> mood (${filtered.length} songs)`;
        summary.classList.remove('hidden');
        console.log('✓ Showing mood summary');
    }
    
    displayRecommendations(filtered);
}

function clearMoodFilter() {
    console.log('🔄 clearMoodFilter called');
    
    state.selectedMood = null;
    
    document.querySelectorAll('.mood-card').forEach(card => {
        card.classList.remove('active');
    });
    
    const clearBtn = document.getElementById('clearMoodBtn');
    if (clearBtn) {
        clearBtn.classList.add('hidden');
        console.log('✓ Hiding clear button');
    }
    
    const summary = document.querySelector('.mood-summary');
    if (summary) {
        summary.classList.add('hidden');
        console.log('✓ Hiding mood summary');
    }
    
    if (state.currentRecommendations.length > 0) {
        console.log('✓ Showing all recommendations');
        displayRecommendations(state.currentRecommendations);
    }
}

/* ============================================================================
   SONG BATTLE
   ============================================================================ */

function populateBattle() {
    console.log('⚔️ populateBattle called');
    
    const s1 = document.getElementById('song1');
    const s2 = document.getElementById('song2');
    
    if (!s1 || !s2) {
        console.error('❌ song1 or song2 not found');
        return;
    }
    
    s1.innerHTML = '<option value="">Select song...</option>';
    s2.innerHTML = '<option value="">Select song...</option>';
    
    console.log(`Populating with ${state.songs.length} songs`);
    
    state.songs.forEach(song => {
        const o1 = document.createElement('option');
        o1.value = song.id;
        o1.textContent = `${song.title} - ${song.artist}`;
        s1.appendChild(o1);
        
        const o2 = document.createElement('option');
        o2.value = song.id;
        o2.textContent = `${song.title} - ${song.artist}`;
        s2.appendChild(o2);
    });
    
    console.log('✓ Battle dropdowns populated');
}

async function handleBattle() {
    console.log('⚔️ handleBattle called');
    
    const s1 = document.getElementById('song1');
    const s2 = document.getElementById('song2');
    
    if (!s1 || !s2) {
        console.error('❌ song1 or song2 not found');
        return;
    }
    
    const id1 = parseInt(s1.value);
    const id2 = parseInt(s2.value);
    
    console.log(`Comparing: ${id1} vs ${id2}`);
    
    if (!id1 || !id2 || id1 === id2) {
        console.warn('⚠️ Invalid selection');
        showInlineMessage('Please select two different songs', 'warning');
        return;
    }

    const result = await callAPI('/api/battle', 'POST', {
        song1_id: id1,
        song2_id: id2
    });
    
    if (!result) {
        console.error('❌ Battle failed');
        showInlineMessage('Battle comparison failed. Please try again.', 'error');
        return;
    }
    
    console.log(`✓ Battle result: ${result.winner}`);
    
    const container = document.getElementById('battleResults');
    if (!container) {
        console.error('❌ battleResults not found');
        return;
    }
    
    container.innerHTML = '';
    
    const displayBattleCard = (song, isWinner) => {
        const card = document.createElement('div');
        card.className = `battle-card ${isWinner ? 'winner' : ''}`;
        
        card.innerHTML = `
            ${isWinner ? '<div class="winner-badge">🏆 WINNER</div>' : ''}
            <h3 class="battle-title">${escapeHtml(song.title)}</h3>
            <p class="battle-artist">${escapeHtml(song.artist)}</p>
            <div class="battle-score">${Math.round(song.score * 100)}</div>
            <div class="battle-metrics">
                <div class="battle-metric">
                    <span class="metric-name">⚡ Energy</span>
                    <span class="metric-val">${song.metrics.energy.toFixed(2)}</span>
                </div>
                <div class="battle-metric">
                    <span class="metric-name">💃 Danceability</span>
                    <span class="metric-val">${song.metrics.danceability.toFixed(2)}</span>
                </div>
                <div class="battle-metric">
                    <span class="metric-name">🎼 Tempo</span>
                    <span class="metric-val">${song.metrics.tempo} BPM</span>
                </div>
                <div class="battle-metric">
                    <span class="metric-name">⭐ Popularity</span>
                    <span class="metric-val">${song.metrics.popularity}/100</span>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    };
    
    const winner1 = result.winner === 'song1';
    displayBattleCard(result.song1, winner1);
    displayBattleCard(result.song2, !winner1);
    
    container.classList.remove('hidden');
    console.log('✓ Battle results displayed');
}

/* ============================================================================
   ANALYTICS
   ============================================================================ */

async function loadAnalytics() {
    console.log('📊 loadAnalytics called');
    
    const result = await callAPI('/api/analytics', 'GET');
    if (!result) {
        console.error('❌ No analytics returned');
        return;
    }
    
    console.log('✓ Got analytics data');
    state.analytics = result;
    displayAnalytics(result);
}

function displayAnalytics(data) {
    console.log('📊 displayAnalytics called');
    
    // Update stat cards with animation
    animateCounter('totalSongs', 0, data.summary.total_songs, 1000);
    animateCounter('avgEnergy', 0, parseFloat(data.summary.avg_energy.toFixed(2)), 1000, 2);
    animateCounter('avgDance', 0, parseFloat(data.summary.avg_danceability.toFixed(2)), 1000, 2);
    animateCounter('avgTempo', 0, Math.round(data.summary.avg_tempo), 1000);
    animateCounter('avgPopularity', 0, Math.round(data.summary.avg_popularity), 1000);
    
    // Most common mood
    const moodCounts = {};
    if (state.songs.length > 0) {
        state.songs.forEach(song => {
            moodCounts[song.mood || 'Unknown'] = (moodCounts[song.mood || 'Unknown'] || 0) + 1;
        });
        const commonMood = Object.keys(moodCounts).reduce((a, b) => 
            moodCounts[a] > moodCounts[b] ? a : b
        );
        const elem = document.getElementById('commonMood');
        if (elem) {
            elem.textContent = commonMood;
            console.log(`✓ Updated commonMood: ${commonMood}`);
        }
    }
    
    // Avg match %
    if (state.currentRecommendations && state.currentRecommendations.length > 0) {
        const avgMatch = Math.round(
            state.currentRecommendations.reduce((sum, r) => sum + r.similarity_score * 100, 0) / 
            state.currentRecommendations.length
        );
        const elem = document.getElementById('avgMatch');
        if (elem) {
            elem.textContent = avgMatch + '%';
            console.log(`✓ Updated avgMatch: ${avgMatch}%`);
        }
    }
    
    // Dominant tempo
    const tempoRanges = data.distributions.tempo;
    const dominant = Object.keys(tempoRanges).reduce((a, b) => 
        tempoRanges[a] > tempoRanges[b] ? a : b
    );
    const tempoLabels = {
        slow: 'Slow (<90)',
        moderate: 'Moderate (90-130)',
        fast: 'Fast (>130)'
    };
    const tempoElem = document.getElementById('dominantTempo');
    if (tempoElem) {
        tempoElem.textContent = tempoLabels[dominant] || 'Moderate';
        console.log(`✓ Updated dominantTempo: ${tempoLabels[dominant]}`);
    }
    
    // Charts
    displayChart('tempoChart', [
        { label: 'Slow (<90)', value: data.distributions.tempo.slow },
        { label: 'Moderate', value: data.distributions.tempo.moderate },
        { label: 'Fast (>130)', value: data.distributions.tempo.fast }
    ]);
    
    displayChart('energyChart', [
        { label: 'Low (<0.4)', value: data.distributions.energy.low },
        { label: 'Medium', value: data.distributions.energy.medium },
        { label: 'High (>0.7)', value: data.distributions.energy.high }
    ]);
    
    console.log('✓ Analytics displayed');
}

function animateCounter(id, start, end, duration, decimals = 0) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`❌ Element ${id} not found`);
        return;
    }
    
    const increment = (end - start) / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        
        if (decimals > 0) {
            element.textContent = current.toFixed(decimals);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

function displayChart(id, data) {
    const container = document.getElementById(id);
    if (!container) {
        console.error(`❌ Chart container ${id} not found`);
        return;
    }
    
    container.innerHTML = '';
    
    const maxValue = Math.max(...data.map(d => d.value));
    
    data.forEach(item => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = percentage + '%';
        
        bar.innerHTML = `
            <div class="bar-value">${item.value}</div>
            <div class="bar-label">${item.label}</div>
        `;
        
        container.appendChild(bar);
    });
    
    console.log(`✓ Chart ${id} displayed`);
}

/* ============================================================================
   UTILITIES
   ============================================================================ */

/* ============================================================================
   UTILITIES & INLINE MESSAGES
   ============================================================================ */

/**
 * Display inline message in recommendations area
 * Replaces alert() with styled UI messages
 */
function showInlineMessage(message, type = 'info') {
    console.log(`💬 showInlineMessage: ${type} - ${message}`);
    
    const section = document.getElementById('recommendationsSection');
    if (!section) {
        console.warn('⚠️ recommendationsSection not found for message');
        return;
    }
    
    const container = document.getElementById('recommendationsGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `inline-message inline-message-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '❌';
    if (type === 'success') icon = '✓';
    
    messageEl.innerHTML = `
        <div class="inline-message-content">
            <span class="inline-message-icon">${icon}</span>
            <span class="inline-message-text">${escapeHtml(message)}</span>
        </div>
    `;
    
    container.appendChild(messageEl);
    
    if (!section.classList.contains('hidden')) {
        // Section already visible, no scroll needed
    } else {
        section.classList.remove('hidden');
    }
}

/**
 * Display message when no recommendations match selected mood
 */
function displayNoRecommendationsMessage(mood) {
    console.log(`💬 No recommendations for mood: ${mood}`);
    
    const section = document.getElementById('recommendationsSection');
    const container = document.getElementById('recommendationsGrid');
    
    if (!section || !container) {
        console.error('❌ recommendationsSection or grid not found');
        return;
    }
    
    container.innerHTML = '';
    
    const messageEl = document.createElement('div');
    messageEl.className = 'inline-message inline-message-info';
    
    messageEl.innerHTML = `
        <div class="inline-message-content">
            <span class="inline-message-icon">🎭</span>
            <div class="inline-message-body">
                <span class="inline-message-text">
                    No matching songs found for <strong>${escapeHtml(mood)}</strong> yet.
                </span>
                <span class="inline-message-subtext">
                    Try another mood or search for a different song.
                </span>
            </div>
        </div>
    `;
    
    container.appendChild(messageEl);
    section.classList.remove('hidden');
    
    console.log('✓ No recommendations message displayed');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('✓ Audio Intelligence Platform script loaded');
