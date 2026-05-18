/* ============================================================================
   AUDIO INTELLIGENCE PLATFORM - ENHANCED JAVASCRIPT
   3D Background, Mood Filtering, Interactive Features
   ============================================================================ */

// STATE MANAGEMENT
const state = {
    songs: [],
    selectedSong: null,
    selectedMood: null,
    currentRecommendations: [],
    analytics: null
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 Audio Intelligence Platform initializing...');
    
    // Initialize 3D background
    init3D();
    
    // Setup event listeners
    setupListeners();
    
    // Load initial data
    loadInitialData();
});

/* ============================================================================
   3D BACKGROUND WITH THREE.JS
   ============================================================================ */

let scene, camera, renderer, particles;

function init3D() {
    console.log('🎨 Initializing 3D background...');
    
    try {
        const canvas = document.getElementById('canvas-3d');
        if (!canvas) return;

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
   EVENT LISTENERS
   ============================================================================ */

function setupListeners() {
    console.log('📌 Setting up event listeners...');
    
    // Search
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Battle
    document.getElementById('battleBtn').addEventListener('click', handleBattle);

    // Clear mood filter
    const clearBtn = document.getElementById('clearMoodBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearMoodFilter);
    }

    console.log('✓ Event listeners ready');
}

/* ============================================================================
   INITIAL DATA LOADING
   ============================================================================ */

async function loadInitialData() {
    console.log('📊 Loading initial data...');
    
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
        
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (data) options.body = JSON.stringify(data);
        
        const response = await fetch(endpoint, options);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('API Error:', error);
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
        } else {
            loader.classList.add('hidden');
        }
    }
}

/* ============================================================================
   SEARCH FUNCTIONALITY
   ============================================================================ */

async function handleSearch() {
    const input = document.getElementById('searchInput');
    const query = input.value.trim();
    
    if (!query || query.length < 2) {
        alert('Please enter at least 2 characters');
        return;
    }

    console.log(`🔍 Searching: "${query}"`);
    
    const result = await callAPI('/api/search', 'POST', { query });
    if (!result || !result.results) {
        alert('Search failed');
        return;
    }

    displaySearchResults(result.results);
}

function displaySearchResults(results) {
    const container = document.getElementById('resultsList');
    const section = document.getElementById('searchResults');
    
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.6);">No songs found</p>';
        section.classList.remove('hidden');
        return;
    }

    results.forEach((song, idx) => {
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
        
        card.addEventListener('click', () => selectSong(song));
        container.appendChild(card);
    });

    section.classList.remove('hidden');
}

/* ============================================================================
   SONG SELECTION & RECOMMENDATIONS
   ============================================================================ */

async function selectSong(song) {
    console.log(`✓ Selected: ${song.title}`);
    
    state.selectedSong = song;
    state.selectedMood = null;
    
    // Clear mood filter
    document.querySelectorAll('.mood-card').forEach(m => m.classList.remove('active'));
    document.getElementById('clearMoodBtn')?.classList.add('hidden');
    document.querySelector('.mood-summary')?.classList.add('hidden');
    
    // Display selected song
    const card = document.getElementById('selectedSongCard');
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
    document.getElementById('selectedSongSection').classList.remove('hidden');

    // Show mood section
    document.getElementById('moodSection').classList.remove('hidden');

    // Get recommendations
    await getRecommendations(song.id);
    
    // Get insights
    await getInsights(song.id);

    // Populate battle dropdowns
    populateBattle();
}

async function getRecommendations(songId) {
    const result = await callAPI('/api/recommend', 'POST', {
        song_id: songId,
        count: 5
    });
    
    if (!result || !result.recommendations) return;
    
    state.currentRecommendations = result.recommendations;
    displayRecommendations(result.recommendations);
}

function displayRecommendations(recs) {
    const container = document.getElementById('recommendationsGrid');
    const section = document.getElementById('recommendationsSection');
    const subtitle = document.getElementById('recSubtitle');
    
    container.innerHTML = '';
    
    if (state.selectedMood) {
        subtitle.textContent = `Based on "${state.selectedMood}" mood`;
    } else {
        subtitle.textContent = 'Based on audio feature similarity';
    }

    recs.forEach((rec, idx) => {
        const confidence = Math.round(rec.similarity_score * 100);
        const reason = getRecommendationReason(confidence);
        
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
    const result = await callAPI('/api/insights', 'POST', { song_id: songId });
    if (!result || !result.insights) return;
    
    const container = document.getElementById('insightsList');
    container.innerHTML = '';
    
    result.insights.forEach((insight, idx) => {
        const item = document.createElement('div');
        item.className = 'insight-item';
        item.style.animationDelay = `${idx * 100}ms`;
        item.textContent = insight;
        container.appendChild(item);
    });
    
    document.getElementById('insightsSection').classList.remove('hidden');
}

/* ============================================================================
   MOOD FILTERING
   ============================================================================ */

async function loadMoods() {
    const result = await callAPI('/api/moods', 'GET');
    if (!result || !result.moods) return;
    
    // Extract all songs
    state.songs = [];
    Object.values(result.moods).forEach(songs => {
        state.songs.push(...songs);
    });

    // Display mood cards
    const container = document.getElementById('moodGrid');
    container.innerHTML = '';
    
    const moodEmojis = {
        'Gym Energy': '💪', 'Party Vibes': '🎉', 'Energetic': '⚡',
        'Feel-Good': '😊', 'Study Session': '📚', 'Chilled': '❄️',
        'Summer Vibes': '☀️', 'Late Night': '🌙', 'Melancholy': '😢',
        'Focus Mode': '🎯'
    };
    
    Object.entries(result.moods).forEach(([mood, songs], idx) => {
        const card = document.createElement('div');
        card.className = 'mood-card';
        card.style.animationDelay = `${idx * 50}ms`;
        
        const emoji = moodEmojis[mood] || '🎵';
        card.innerHTML = `
            <div class="mood-emoji">${emoji}</div>
            <div class="mood-name">${escapeHtml(mood)}</div>
            <div class="mood-count">${songs.length} songs</div>
        `;
        
        card.addEventListener('click', () => filterByMood(mood, result.moods));
        container.appendChild(card);
    });

    // Display moods showcase
    const showcase = document.getElementById('moodsShowcaseGrid');
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

    document.getElementById('moodsShowcaseSection').classList.remove('hidden');
}

function filterByMood(mood, allMoods) {
    console.log(`🎭 Filtering by: ${mood}`);
    
    state.selectedMood = mood;
    
    // Update UI
    document.querySelectorAll('.mood-card').forEach(card => {
        if (card.querySelector('.mood-name').textContent.trim() === mood) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    
    document.getElementById('clearMoodBtn').classList.remove('hidden');
    
    // Filter recommendations
    const filtered = state.currentRecommendations.filter(rec => rec.mood === mood);
    
    if (filtered.length === 0) {
        alert(`No recommendations found for "${mood}" mood`);
        return;
    }
    
    // Update summary
    const summary = document.querySelector('.mood-summary');
    if (summary) {
        summary.innerHTML = `Filtering recommendations by <strong>${mood}</strong> mood (${filtered.length} songs)`;
        summary.classList.remove('hidden');
    }
    
    displayRecommendations(filtered);
}

function clearMoodFilter() {
    console.log('🔄 Clearing mood filter');
    
    state.selectedMood = null;
    
    document.querySelectorAll('.mood-card').forEach(card => {
        card.classList.remove('active');
    });
    
    document.getElementById('clearMoodBtn').classList.add('hidden');
    document.querySelector('.mood-summary')?.classList.add('hidden');
    
    if (state.currentRecommendations.length > 0) {
        displayRecommendations(state.currentRecommendations);
    }
}

/* ============================================================================
   SONG BATTLE
   ============================================================================ */

function populateBattle() {
    const s1 = document.getElementById('song1');
    const s2 = document.getElementById('song2');
    
    s1.innerHTML = '<option value="">Select song...</option>';
    s2.innerHTML = '<option value="">Select song...</option>';
    
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
    
    document.getElementById('battleSection').classList.remove('hidden');
}

async function handleBattle() {
    const id1 = parseInt(document.getElementById('song1').value);
    const id2 = parseInt(document.getElementById('song2').value);
    
    if (!id1 || !id2 || id1 === id2) {
        alert('Select two different songs');
        return;
    }

    const result = await callAPI('/api/battle', 'POST', {
        song1_id: id1,
        song2_id: id2
    });
    
    if (!result) return;
    
    const container = document.getElementById('battleResults');
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
}

/* ============================================================================
   ANALYTICS
   ============================================================================ */

async function loadAnalytics() {
    const result = await callAPI('/api/analytics', 'GET');
    if (!result) return;
    
    state.analytics = result;
    displayAnalytics(result);
}

function displayAnalytics(data) {
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
        document.getElementById('commonMood').textContent = commonMood;
    }
    
    // Avg match %
    if (state.currentRecommendations && state.currentRecommendations.length > 0) {
        const avgMatch = Math.round(
            state.currentRecommendations.reduce((sum, r) => sum + r.similarity_score * 100, 0) / 
            state.currentRecommendations.length
        );
        document.getElementById('avgMatch').textContent = avgMatch + '%';
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
    document.getElementById('dominantTempo').textContent = tempoLabels[dominant] || 'Moderate';
    
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
    
    document.getElementById('analyticsSection').classList.remove('hidden');
}

function animateCounter(id, start, end, duration, decimals = 0) {
    const element = document.getElementById(id);
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
}

/* ============================================================================
   UTILITIES
   ============================================================================ */

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('✓ Audio Intelligence Platform ready');
