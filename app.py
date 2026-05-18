"""
Audio Intelligence Platform - Flask Backend
A modern music analytics and recommendation system
"""

from flask import Flask, render_template, request, jsonify
import json
from songs import SONGS, get_song_metrics, calculate_mood, recommend_songs, battle_songs

app = Flask(__name__)

# ============================================================================
# ROUTES
# ============================================================================

@app.route('/')
def index():
    """Render main page with song data injected"""
    return render_template('index.html', songs=SONGS)


@app.route('/api/search', methods=['POST'])
def search():
    """
    Search songs by title or artist
    Returns matching songs with their audio features
    """
    data = request.json
    query = data.get('query', '').lower()
    
    if not query or len(query) < 2:
        return jsonify({'error': 'Query too short'}), 400
    
    # Filter songs by title or artist
    results = [
        song for song in SONGS
        if query in song['title'].lower() or query in song['artist'].lower()
    ]
    
    return jsonify({
        'results': results,
        'count': len(results)
    })


@app.route('/api/recommend', methods=['POST'])
def recommend():
    """
    Generate recommendations based on a selected song
    Uses weighted Euclidean distance with audio features
    """
    data = request.json
    song_id = data.get('song_id')
    num_recommendations = data.get('count', 5)
    
    # Find the seed song
    seed_song = next((s for s in SONGS if s['id'] == song_id), None)
    if not seed_song:
        return jsonify({'error': 'Song not found'}), 404
    
    # Get recommendations
    recommendations = recommend_songs(seed_song, SONGS, num_recommendations)
    
    return jsonify({
        'seed': seed_song,
        'recommendations': recommendations
    })


@app.route('/api/battle', methods=['POST'])
def battle():
    """
    Compare two songs head-to-head
    Returns feature comparison and a winner based on weighted scoring
    """
    data = request.json
    song1_id = data.get('song1_id')
    song2_id = data.get('song2_id')
    
    song1 = next((s for s in SONGS if s['id'] == song1_id), None)
    song2 = next((s for s in SONGS if s['id'] == song2_id), None)
    
    if not song1 or not song2:
        return jsonify({'error': 'One or both songs not found'}), 404
    
    result = battle_songs(song1, song2)
    
    return jsonify(result)


@app.route('/api/moods', methods=['GET'])
def get_moods():
    """
    Classify all songs into mood categories based on audio features
    Returns mood groupings and their songs
    """
    moods = {}
    
    for song in SONGS:
        mood = calculate_mood(song)
        
        if mood not in moods:
            moods[mood] = []
        
        moods[mood].append({
            'id': song['id'],
            'title': song['title'],
            'artist': song['artist'],
            'energy': song['energy'],
            'danceability': song['danceability']
        })
    
    return jsonify({
        'moods': moods,
        'total_songs': len(SONGS),
        'mood_count': len(moods)
    })


@app.route('/api/analytics', methods=['GET'])
def analytics():
    """
    Generate analytics dashboard data
    Computes aggregate statistics across entire song collection
    """
    if not SONGS:
        return jsonify({'error': 'No song data available'}), 400
    
    # Calculate averages
    avg_energy = sum(s['energy'] for s in SONGS) / len(SONGS)
    avg_danceability = sum(s['danceability'] for s in SONGS) / len(SONGS)
    avg_tempo = sum(s['tempo'] for s in SONGS) / len(SONGS)
    avg_popularity = sum(s['popularity'] for s in SONGS) / len(SONGS)
    
    # Find extremes
    most_danceable = max(SONGS, key=lambda s: s['danceability'])
    highest_energy = max(SONGS, key=lambda s: s['energy'])
    fastest = max(SONGS, key=lambda s: s['tempo'])
    
    # Tempo distribution
    tempo_ranges = {
        'slow': len([s for s in SONGS if s['tempo'] < 90]),
        'moderate': len([s for s in SONGS if 90 <= s['tempo'] < 130]),
        'fast': len([s for s in SONGS if s['tempo'] >= 130])
    }
    
    # Energy distribution
    energy_ranges = {
        'low': len([s for s in SONGS if s['energy'] < 0.4]),
        'medium': len([s for s in SONGS if 0.4 <= s['energy'] < 0.7]),
        'high': len([s for s in SONGS if s['energy'] >= 0.7])
    }
    
    return jsonify({
        'summary': {
            'total_songs': len(SONGS),
            'avg_energy': round(avg_energy, 2),
            'avg_danceability': round(avg_danceability, 2),
            'avg_tempo': round(avg_tempo, 1),
            'avg_popularity': round(avg_popularity, 1)
        },
        'extremes': {
            'most_danceable': most_danceable,
            'highest_energy': highest_energy,
            'fastest': fastest
        },
        'distributions': {
            'tempo': tempo_ranges,
            'energy': energy_ranges
        }
    })


@app.route('/api/insights', methods=['POST'])
def insights():
    """
    Generate AI-style insights based on a song selection
    Logic-based insights that explain recommendation reasoning
    """
    data = request.json
    song_id = data.get('song_id')
    
    song = next((s for s in SONGS if s['id'] == song_id), None)
    if not song:
        return jsonify({'error': 'Song not found'}), 404
    
    # Generate insights based on audio features
    insight_list = []
    
    # Energy insight
    if song['energy'] > 0.8:
        insight_list.append(f"⚡ High-energy track perfect for intense workouts or late-night adventures.")
    elif song['energy'] > 0.5:
        insight_list.append(f"🎵 Moderate energy—ideal for focused work or social gatherings.")
    else:
        insight_list.append(f"🌙 Low-energy vibes; great for relaxation and wind-down moments.")
    
    # Danceability insight
    if song['danceability'] > 0.7:
        insight_list.append(f"💃 Highly danceable with a strong rhythmic foundation—club and party material.")
    elif song['danceability'] > 0.4:
        insight_list.append(f"🎶 Moderately danceable with good groove potential.")
    
    # Tempo insight
    if song['tempo'] < 100:
        insight_list.append(f"🎼 Slower pace ({song['tempo']} BPM) creates a relaxed atmosphere.")
    elif song['tempo'] < 140:
        insight_list.append(f"🎼 Moderate tempo ({song['tempo']} BPM) balanced for versatility.")
    else:
        insight_list.append(f"🚀 Fast tempo ({song['tempo']} BPM)—energizing and upbeat.")
    
    # Popularity insight
    if song['popularity'] > 75:
        insight_list.append(f"🌟 High popularity score ({song['popularity']}/100)—widely loved track.")
    elif song['popularity'] > 50:
        insight_list.append(f"📈 Solid popularity ({song['popularity']}/100)—recognized and appreciated.")
    
    # Mood insight
    mood = calculate_mood(song)
    insight_list.append(f"✨ Classified as '{mood}' based on energy and danceability patterns.")
    
    return jsonify({
        'song': song,
        'mood': calculate_mood(song),
        'insights': insight_list
    })


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print(f"🎵 Audio Intelligence Platform loading {len(SONGS)} songs...")
    app.run(debug=True, port=5000)
