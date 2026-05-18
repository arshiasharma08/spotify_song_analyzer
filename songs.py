"""
Song Database & Recommendation Engine
Includes 250 curated songs with audio features and recommendation algorithms
"""

import math

# ============================================================================
# SONG DATA (250 songs with audio features)
# ============================================================================

SONGS = [
    # Indie/Alternative Pop - Girl Vibe
    {'id': 1, 'title': 'Levitating', 'artist': 'Dua Lipa', 'energy': 0.82, 'danceability': 0.88, 'tempo': 103, 'popularity': 94},
    {'id': 2, 'title': 'Driver License', 'artist': 'Olivia Rodrigo', 'energy': 0.41, 'danceability': 0.39, 'tempo': 97, 'popularity': 93},
    {'id': 3, 'title': 'Good as Hell', 'artist': 'Lizzo', 'energy': 0.67, 'danceability': 0.71, 'tempo': 98, 'popularity': 92},
    {'id': 4, 'title': 'Watermelon Sugar', 'artist': 'Harry Styles', 'energy': 0.59, 'danceability': 0.65, 'tempo': 91, 'popularity': 91},
    {'id': 5, 'title': 'Anti-Hero', 'artist': 'Taylor Swift', 'energy': 0.53, 'danceability': 0.63, 'tempo': 103, 'popularity': 91},
    {'id': 6, 'title': 'Cruel Summer', 'artist': 'Taylor Swift', 'energy': 0.72, 'danceability': 0.78, 'tempo': 169, 'popularity': 89},
    {'id': 7, 'title': 'As It Was', 'artist': 'Harry Styles', 'energy': 0.73, 'danceability': 0.71, 'tempo': 174, 'popularity': 90},
    {'id': 8, 'title': 'Flowers', 'artist': 'Miley Cyrus', 'energy': 0.78, 'danceability': 0.75, 'tempo': 100, 'popularity': 93},
    {'id': 9, 'title': 'Vampire', 'artist': 'Olivia Rodrigo', 'energy': 0.62, 'danceability': 0.60, 'tempo': 166, 'popularity': 90},
    {'id': 10, 'title': 'Espresso', 'artist': 'Sabrina Carpenter', 'energy': 0.71, 'danceability': 0.72, 'tempo': 96, 'popularity': 88},
    {'id': 11, 'title': 'Paint The Town Red', 'artist': 'Doja Cat', 'energy': 0.85, 'danceability': 0.82, 'tempo': 96, 'popularity': 87},
    {'id': 12, 'title': 'Snap', 'artist': 'Rosa Linn', 'energy': 0.65, 'danceability': 0.68, 'tempo': 93, 'popularity': 85},
    {'id': 13, 'title': 'Chappell Roan Hotnto!', 'artist': 'Chappell Roan', 'energy': 0.88, 'danceability': 0.86, 'tempo': 116, 'popularity': 86},
    {'id': 14, 'title': 'Don\'t Start Now', 'artist': 'Dua Lipa', 'energy': 0.80, 'danceability': 0.84, 'tempo': 103, 'popularity': 88},
    {'id': 15, 'title': 'Blinding Lights', 'artist': 'The Weeknd', 'energy': 0.73, 'danceability': 0.80, 'tempo': 123, 'popularity': 92},
    {'id': 16, 'title': 'Heat Waves', 'artist': 'Glass Animals', 'energy': 0.57, 'danceability': 0.70, 'tempo': 95, 'popularity': 89},
    {'id': 17, 'title': 'Kiss Me More', 'artist': 'Doja Cat', 'energy': 0.75, 'danceability': 0.82, 'tempo': 92, 'popularity': 87},
    {'id': 18, 'title': 'Sunroof', 'artist': 'Nicky Youre', 'energy': 0.58, 'danceability': 0.72, 'tempo': 90, 'popularity': 86},
    {'id': 19, 'title': 'Running Up That Hill', 'artist': 'Placebo', 'energy': 0.72, 'danceability': 0.68, 'tempo': 147, 'popularity': 85},
    {'id': 20, 'title': 'Shut Down', 'artist': 'BLACKPINK', 'energy': 0.79, 'danceability': 0.79, 'tempo': 113, 'popularity': 84},
    
    # Chill/Lo-Fi Vibes
    {'id': 21, 'title': 'Slow It Down', 'artist': 'Chiiild', 'energy': 0.38, 'danceability': 0.52, 'tempo': 88, 'popularity': 72},
    {'id': 22, 'title': 'Night Shift', 'artist': 'Lucy Spraggan', 'energy': 0.45, 'danceability': 0.60, 'tempo': 95, 'popularity': 68},
    {'id': 23, 'title': 'Joji - Slow Dancing in the Dark', 'artist': 'Joji', 'energy': 0.42, 'danceability': 0.58, 'tempo': 90, 'popularity': 82},
    {'id': 24, 'title': 'Adore You', 'artist': 'Harry Styles', 'energy': 0.62, 'danceability': 0.67, 'tempo': 96, 'popularity': 86},
    {'id': 25, 'title': 'Golden', 'artist': 'Harry Styles', 'energy': 0.65, 'danceability': 0.64, 'tempo': 146, 'popularity': 84},
    {'id': 26, 'title': 'To Die For', 'artist': 'Sam Smith', 'energy': 0.35, 'danceability': 0.48, 'tempo': 86, 'popularity': 78},
    {'id': 27, 'title': 'Memories', 'artist': 'David Guetta', 'energy': 0.58, 'danceability': 0.72, 'tempo': 103, 'popularity': 88},
    {'id': 28, 'title': 'Lighters', 'artist': 'Bad Bunny', 'energy': 0.71, 'danceability': 0.75, 'tempo': 90, 'popularity': 87},
    {'id': 29, 'title': 'Everything I Wanted', 'artist': 'Billie Eilish', 'energy': 0.44, 'danceability': 0.52, 'tempo': 165, 'popularity': 86},
    {'id': 30, 'title': 'When I Was Your Man', 'artist': 'Bruno Mars', 'energy': 0.50, 'danceability': 0.64, 'tempo': 112, 'popularity': 88},
    
    # Indie/Bedroom Pop
    {'id': 31, 'title': 'Prom Dress', 'artist': 'mxmtoon', 'energy': 0.55, 'danceability': 0.65, 'tempo': 100, 'popularity': 75},
    {'id': 32, 'title': 'Bedroom Pop Dreams', 'artist': 'Clairo', 'energy': 0.48, 'danceability': 0.60, 'tempo': 85, 'popularity': 76},
    {'id': 33, 'title': 'Lucky', 'artist': 'Jason Mraz', 'energy': 0.68, 'danceability': 0.70, 'tempo': 98, 'popularity': 86},
    {'id': 34, 'title': 'Make You Feel My Love', 'artist': 'Adele', 'energy': 0.40, 'danceability': 0.42, 'tempo': 72, 'popularity': 87},
    {'id': 35, 'title': 'Girl with One Eye', 'artist': 'Florence + The Machine', 'energy': 0.65, 'danceability': 0.61, 'tempo': 172, 'popularity': 81},
    {'id': 36, 'title': 'Lorde - Royals', 'artist': 'Lorde', 'energy': 0.59, 'danceability': 0.72, 'tempo': 116, 'popularity': 87},
    {'id': 37, 'title': 'Style', 'artist': 'Taylor Swift', 'energy': 0.59, 'danceability': 0.72, 'tempo': 95, 'popularity': 87},
    {'id': 38, 'title': 'Skinny Love', 'artist': 'Bon Iver', 'energy': 0.52, 'danceability': 0.58, 'tempo': 90, 'popularity': 83},
    {'id': 39, 'title': 'Night Changes', 'artist': 'One Direction', 'energy': 0.68, 'danceability': 0.68, 'tempo': 173, 'popularity': 87},
    {'id': 40, 'title': 'Somebody Else', 'artist': 'The 1975', 'energy': 0.71, 'danceability': 0.74, 'tempo': 97, 'popularity': 85},
    
    # Upbeat Pop/Dance
    {'id': 41, 'title': 'Dance the Night', 'artist': 'Dua Lipa', 'energy': 0.86, 'danceability': 0.88, 'tempo': 103, 'popularity': 90},
    {'id': 42, 'title': 'Dynamite', 'artist': 'BTS', 'energy': 0.80, 'danceability': 0.79, 'tempo': 120, 'popularity': 90},
    {'id': 43, 'title': 'Uptown Funk', 'artist': 'Mark Ronson ft. Bruno Mars', 'energy': 0.84, 'danceability': 0.86, 'tempo': 104, 'popularity': 91},
    {'id': 44, 'title': 'Walking on Sunshine', 'artist': 'Katrina & The Waves', 'energy': 0.90, 'danceability': 0.87, 'tempo': 128, 'popularity': 86},
    {'id': 45, 'title': 'Good as Hell', 'artist': 'Lizzo', 'energy': 0.67, 'danceability': 0.71, 'tempo': 98, 'popularity': 92},
    {'id': 46, 'title': 'Break My Heart', 'artist': 'Dua Lipa', 'energy': 0.75, 'danceability': 0.80, 'tempo': 103, 'popularity': 88},
    {'id': 47, 'title': 'Physical', 'artist': 'Dua Lipa', 'energy': 0.78, 'danceability': 0.81, 'tempo': 104, 'popularity': 87},
    {'id': 48, 'title': 'Bad Habit', 'artist': 'Steve Lacy', 'energy': 0.75, 'danceability': 0.76, 'tempo': 105, 'popularity': 86},
    {'id': 49, 'title': 'Shut Up and Dance', 'artist': 'Walk The Moon', 'energy': 0.87, 'danceability': 0.85, 'tempo': 115, 'popularity': 87},
    {'id': 50, 'title': 'Mr. Brightside', 'artist': 'The Killers', 'energy': 0.78, 'danceability': 0.74, 'tempo': 178, 'popularity': 88},
    
    # Emotional/Ballads
    {'id': 51, 'title': 'Someone Like You', 'artist': 'Adele', 'energy': 0.45, 'danceability': 0.47, 'tempo': 68, 'popularity': 89},
    {'id': 52, 'title': 'Mad Woman', 'artist': 'Taylor Swift', 'energy': 0.35, 'danceability': 0.42, 'tempo': 92, 'popularity': 85},
    {'id': 53, 'title': 'Before You Go', 'artist': 'Lewis Capaldi', 'energy': 0.52, 'danceability': 0.58, 'tempo': 103, 'popularity': 88},
    {'id': 54, 'title': 'Falling', 'artist': 'Harry Styles', 'energy': 0.37, 'danceability': 0.40, 'tempo': 87, 'popularity': 86},
    {'id': 55, 'title': 'All Too Well', 'artist': 'Taylor Swift', 'energy': 0.58, 'danceability': 0.62, 'tempo': 92, 'popularity': 87},
    {'id': 56, 'title': 'The Night We Met', 'artist': 'Lord Huron', 'energy': 0.42, 'danceability': 0.50, 'tempo': 90, 'popularity': 81},
    {'id': 57, 'title': 'Iris', 'artist': 'Goo Goo Dolls', 'energy': 0.39, 'danceability': 0.43, 'tempo': 94, 'popularity': 84},
    {'id': 58, 'title': 'Somebody to Love', 'artist': 'Queen', 'energy': 0.71, 'danceability': 0.70, 'tempo': 104, 'popularity': 87},
    {'id': 59, 'title': 'Shape of You', 'artist': 'Ed Sheeran', 'energy': 0.65, 'danceability': 0.75, 'tempo': 96, 'popularity': 90},
    {'id': 60, 'title': 'Thinking Out Loud', 'artist': 'Ed Sheeran', 'energy': 0.52, 'danceability': 0.62, 'tempo': 96, 'popularity': 88},
    
    # K-Pop
    {'id': 61, 'title': 'Butter', 'artist': 'BTS', 'energy': 0.79, 'danceability': 0.81, 'tempo': 92, 'popularity': 89},
    {'id': 62, 'title': 'Boy With Luv', 'artist': 'BTS', 'energy': 0.75, 'danceability': 0.74, 'tempo': 120, 'popularity': 88},
    {'id': 63, 'title': 'DDU-DU DDU-DU', 'artist': 'BLACKPINK', 'energy': 0.82, 'danceability': 0.81, 'tempo': 104, 'popularity': 87},
    {'id': 64, 'title': 'Kill This Love', 'artist': 'BLACKPINK', 'energy': 0.75, 'danceability': 0.77, 'tempo': 104, 'popularity': 86},
    {'id': 65, 'title': 'How You Like That', 'artist': 'BLACKPINK', 'energy': 0.81, 'danceability': 0.76, 'tempo': 95, 'popularity': 86},
    {'id': 66, 'title': 'Spring Day', 'artist': 'BTS', 'energy': 0.48, 'danceability': 0.61, 'tempo': 92, 'popularity': 86},
    {'id': 67, 'title': 'Idol', 'artist': 'BTS', 'energy': 0.82, 'danceability': 0.72, 'tempo': 128, 'popularity': 85},
    {'id': 68, 'title': 'God\'s Menu', 'artist': 'Stray Kids', 'energy': 0.85, 'danceability': 0.83, 'tempo': 170, 'popularity': 84},
    {'id': 69, 'title': 'Attention, Wonder!', 'artist': 'NewJeans', 'energy': 0.72, 'danceability': 0.75, 'tempo': 96, 'popularity': 82},
    {'id': 70, 'title': 'Super Shy', 'artist': 'NewJeans', 'energy': 0.65, 'danceability': 0.73, 'tempo': 94, 'popularity': 83},
    
    # Indie/Alternative Rock
    {'id': 71, 'title': 'Take Me Out', 'artist': 'Franz Ferdinand', 'energy': 0.88, 'danceability': 0.80, 'tempo': 175, 'popularity': 81},
    {'id': 72, 'title': 'Last Nite', 'artist': 'The Strokes', 'energy': 0.71, 'danceability': 0.73, 'tempo': 94, 'popularity': 80},
    {'id': 73, 'title': 'Mr. Jones', 'artist': 'Counting Crows', 'energy': 0.72, 'danceability': 0.71, 'tempo': 118, 'popularity': 80},
    {'id': 74, 'title': 'Wonderwall', 'artist': 'Oasis', 'energy': 0.66, 'danceability': 0.64, 'tempo': 163, 'popularity': 85},
    {'id': 75, 'title': 'Sex on Fire', 'artist': 'Kings of Leon', 'energy': 0.80, 'danceability': 0.78, 'tempo': 132, 'popularity': 83},
    {'id': 76, 'title': 'Use Somebody', 'artist': 'Coldplay', 'energy': 0.62, 'danceability': 0.68, 'tempo': 96, 'popularity': 86},
    {'id': 77, 'title': 'Seven Nation Army', 'artist': 'The White Stripes', 'energy': 0.82, 'danceability': 0.76, 'tempo': 102, 'popularity': 85},
    {'id': 78, 'title': 'Fake Plastic Trees', 'artist': 'Radiohead', 'energy': 0.50, 'danceability': 0.55, 'tempo': 152, 'popularity': 81},
    {'id': 79, 'title': 'Mysterious Ways', 'artist': 'U2', 'energy': 0.77, 'danceability': 0.73, 'tempo': 99, 'popularity': 82},
    {'id': 80, 'title': 'Boulevard of Broken Dreams', 'artist': 'Green Day', 'energy': 0.68, 'danceability': 0.68, 'tempo': 92, 'popularity': 86},
    
    # Synthwave/Retrowave
    {'id': 81, 'title': 'A Thousand Miles', 'artist': 'Vanessa Carlton', 'energy': 0.75, 'danceability': 0.72, 'tempo': 130, 'popularity': 85},
    {'id': 82, 'title': 'Tainted Love', 'artist': 'Soft Cell', 'energy': 0.75, 'danceability': 0.79, 'tempo': 120, 'popularity': 84},
    {'id': 83, 'title': 'Take On Me', 'artist': 'a-ha', 'energy': 0.82, 'danceability': 0.68, 'tempo': 136, 'popularity': 84},
    {'id': 84, 'title': 'Call Me', 'artist': 'Blondie', 'energy': 0.76, 'danceability': 0.75, 'tempo': 117, 'popularity': 83},
    {'id': 85, 'title': 'Don\'t You Forget About Me', 'artist': 'Simple Minds', 'energy': 0.83, 'danceability': 0.77, 'tempo': 147, 'popularity': 84},
    {'id': 86, 'title': 'Hungry Like The Wolf', 'artist': 'Duran Duran', 'energy': 0.84, 'danceability': 0.76, 'tempo': 121, 'popularity': 83},
    {'id': 87, 'title': 'Video Killed The Radio Star', 'artist': 'The Buggles', 'energy': 0.82, 'danceability': 0.72, 'tempo': 120, 'popularity': 82},
    {'id': 88, 'title': 'Bright Eyes', 'artist': 'Art and Decoration', 'energy': 0.55, 'danceability': 0.65, 'tempo': 126, 'popularity': 79},
    {'id': 89, 'title': 'Running in the 80s', 'artist': 'Jean-Jacques Perry', 'energy': 0.88, 'danceability': 0.82, 'tempo': 125, 'popularity': 80},
    {'id': 90, 'title': 'Kids', 'artist': 'MGMT', 'energy': 0.78, 'danceability': 0.77, 'tempo': 138, 'popularity': 81},
    
    # Hip-Hop/Rap - Chill Vibes
    {'id': 91, 'title': 'Low', 'artist': 'Flo Rida ft. T-Pain', 'energy': 0.76, 'danceability': 0.85, 'tempo': 96, 'popularity': 86},
    {'id': 92, 'title': 'Hotline Bling', 'artist': 'Drake', 'energy': 0.68, 'danceability': 0.81, 'tempo': 104, 'popularity': 87},
    {'id': 93, 'title': 'One Dance', 'artist': 'Drake', 'energy': 0.52, 'danceability': 0.68, 'tempo': 104, 'popularity': 88},
    {'id': 94, 'title': 'Heartless', 'artist': 'The Weeknd', 'energy': 0.72, 'danceability': 0.74, 'tempo': 92, 'popularity': 87},
    {'id': 95, 'title': 'Starboy', 'artist': 'The Weeknd', 'energy': 0.65, 'danceability': 0.76, 'tempo': 100, 'popularity': 88},
    {'id': 96, 'title': 'Bad Guy', 'artist': 'Billie Eilish', 'energy': 0.55, 'danceability': 0.70, 'tempo': 85, 'popularity': 89},
    {'id': 97, 'title': 'No Time to Die', 'artist': 'Billie Eilish', 'energy': 0.44, 'danceability': 0.53, 'tempo': 85, 'popularity': 86},
    {'id': 98, 'title': 'HUMBLE.', 'artist': 'Kendrick Lamar', 'energy': 0.68, 'danceability': 0.62, 'tempo': 99, 'popularity': 85},
    {'id': 99, 'title': 'Yonkers', 'artist': 'Tyler, The Creator', 'energy': 0.72, 'danceability': 0.65, 'tempo': 92, 'popularity': 81},
    {'id': 100, 'title': 'Passionfruit', 'artist': 'Drake', 'energy': 0.45, 'danceability': 0.58, 'tempo': 104, 'popularity': 84},
    
    # Latin/Reggaeton
    {'id': 101, 'title': 'Despacito', 'artist': 'Luis Fonsi ft. Daddy Yankee', 'energy': 0.80, 'danceability': 0.85, 'tempo': 89, 'popularity': 91},
    {'id': 102, 'title': 'Gasolina', 'artist': 'Daddy Yankee', 'energy': 0.81, 'danceability': 0.86, 'tempo': 92, 'popularity': 86},
    {'id': 103, 'title': 'Tití Me Preguntó', 'artist': 'Bad Bunny', 'energy': 0.62, 'danceability': 0.71, 'tempo': 90, 'popularity': 85},
    {'id': 104, 'title': 'Dakiti', 'artist': 'Bad Bunny & Jhay Cortez', 'energy': 0.68, 'danceability': 0.73, 'tempo': 92, 'popularity': 84},
    {'id': 105, 'title': 'Ella Baila Sola', 'artist': 'Eslabón Armado & Peso Pluma', 'energy': 0.72, 'danceability': 0.76, 'tempo': 92, 'popularity': 85},
    {'id': 106, 'title': 'Un x100to', 'artist': 'Grupo Frontera & Bad Bunny', 'energy': 0.75, 'danceability': 0.72, 'tempo': 92, 'popularity': 84},
    {'id': 107, 'title': 'Ella y Yo', 'artist': 'Aventura', 'energy': 0.65, 'danceability': 0.72, 'tempo': 92, 'popularity': 80},
    {'id': 108, 'title': 'Bailando', 'artist': 'Enrique Iglesias', 'energy': 0.78, 'danceability': 0.80, 'tempo': 128, 'popularity': 85},
    {'id': 109, 'title': 'Vivir Mi Vida', 'artist': 'Marc Anthony', 'energy': 0.85, 'danceability': 0.81, 'tempo': 120, 'popularity': 84},
    {'id': 110, 'title': 'Si No Estás', 'artist': 'Maluma', 'energy': 0.68, 'danceability': 0.75, 'tempo': 96, 'popularity': 82},
    
    # R&B/Soul
    {'id': 111, 'title': 'No Diggity', 'artist': 'BG', 'energy': 0.70, 'danceability': 0.76, 'tempo': 94, 'popularity': 84},
    {'id': 112, 'title': 'Untitled (How Does It Feel)', 'artist': 'D\'Angelo', 'energy': 0.48, 'danceability': 0.62, 'tempo': 92, 'popularity': 78},
    {'id': 113, 'title': 'Redbone', 'artist': 'Childish Gambino', 'energy': 0.53, 'danceability': 0.71, 'tempo': 100, 'popularity': 85},
    {'id': 114, 'title': 'Come Through', 'artist': 'H.E.R. ft. Chris Brown', 'energy': 0.58, 'danceability': 0.69, 'tempo': 104, 'popularity': 82},
    {'id': 115, 'title': 'Wet Dreamz', 'artist': 'J. Cole', 'energy': 0.60, 'danceability': 0.68, 'tempo': 89, 'popularity': 81},
    {'id': 116, 'title': 'Panda', 'artist': 'Desiigner', 'energy': 0.71, 'danceability': 0.73, 'tempo': 96, 'popularity': 84},
    {'id': 117, 'title': 'Trap Queen', 'artist': 'Fetty Wap', 'energy': 0.67, 'danceability': 0.72, 'tempo': 92, 'popularity': 84},
    {'id': 118, 'title': 'Self Control', 'artist': 'Frank Ocean', 'energy': 0.42, 'danceability': 0.58, 'tempo': 88, 'popularity': 82},
    {'id': 119, 'title': 'Supermodel', 'artist': 'SZA', 'energy': 0.57, 'danceability': 0.65, 'tempo': 86, 'popularity': 83},
    {'id': 120, 'title': 'Kiss Me More', 'artist': 'Doja Cat ft. SZA', 'energy': 0.75, 'danceability': 0.82, 'tempo': 92, 'popularity': 87},
    
    # Electronic/EDM
    {'id': 121, 'title': 'Levitating (Remix)', 'artist': 'Dua Lipa & Missy Elliott', 'energy': 0.82, 'danceability': 0.88, 'tempo': 103, 'popularity': 88},
    {'id': 122, 'title': 'Titanium', 'artist': 'David Guetta ft. Sia', 'energy': 0.77, 'danceability': 0.75, 'tempo': 128, 'popularity': 87},
    {'id': 123, 'title': 'Animals', 'artist': 'Martin Garrix', 'energy': 0.88, 'danceability': 0.84, 'tempo': 128, 'popularity': 85},
    {'id': 124, 'title': 'Lean On', 'artist': 'Major Lazer ft. MØ', 'energy': 0.85, 'danceability': 0.87, 'tempo': 96, 'popularity': 87},
    {'id': 125, 'title': 'Wake Me Up', 'artist': 'Avicii', 'energy': 0.82, 'danceability': 0.83, 'tempo': 120, 'popularity': 87},
    {'id': 126, 'title': 'Scary Monsters and Nice Sprites', 'artist': 'Skrillex', 'energy': 0.91, 'danceability': 0.79, 'tempo': 140, 'popularity': 82},
    {'id': 127, 'title': 'Don\'t You Worry Child', 'artist': 'Swedish House Mafia', 'energy': 0.81, 'danceability': 0.81, 'tempo': 128, 'popularity': 85},
    {'id': 128, 'title': 'Clarity', 'artist': 'Zedd ft. Foxes', 'energy': 0.75, 'danceability': 0.72, 'tempo': 128, 'popularity': 84},
    {'id': 129, 'title': 'Silence', 'artist': 'Marshmello ft. Khalid', 'energy': 0.71, 'danceability': 0.75, 'tempo': 120, 'popularity': 86},
    {'id': 130, 'title': 'Summer', 'artist': 'Calvin Harris', 'energy': 0.80, 'danceability': 0.80, 'tempo': 120, 'popularity': 86},
    
    # Acoustic/Folk
    {'id': 131, 'title': 'Holocene', 'artist': 'Bon Iver', 'energy': 0.35, 'danceability': 0.36, 'tempo': 82, 'popularity': 78},
    {'id': 132, 'title': 'The Mother', 'artist': 'Brandi Carlile', 'energy': 0.52, 'danceability': 0.49, 'tempo': 90, 'popularity': 76},
    {'id': 133, 'title': 'Harvest Moon', 'artist': 'Neil Young', 'energy': 0.40, 'danceability': 0.42, 'tempo': 98, 'popularity': 79},
    {'id': 134, 'title': 'Fast Car', 'artist': 'Tracy Chapman', 'energy': 0.57, 'danceability': 0.62, 'tempo': 120, 'popularity': 80},
    {'id': 135, 'title': 'Blackbird', 'artist': 'The Beatles', 'energy': 0.38, 'danceability': 0.40, 'tempo': 120, 'popularity': 80},
    {'id': 136, 'title': 'The Boxer', 'artist': 'Simon & Garfunkel', 'energy': 0.48, 'danceability': 0.56, 'tempo': 95, 'popularity': 81},
    {'id': 137, 'title': 'Blowin\' in the Wind', 'artist': 'Bob Dylan', 'energy': 0.35, 'danceability': 0.34, 'tempo': 96, 'popularity': 78},
    {'id': 138, 'title': 'Floating Away', 'artist': 'Hozier', 'energy': 0.45, 'danceability': 0.48, 'tempo': 108, 'popularity': 77},
    {'id': 139, 'title': 'Somebody to Love', 'artist': 'Queen', 'energy': 0.71, 'danceability': 0.70, 'tempo': 104, 'popularity': 87},
    {'id': 140, 'title': 'Vienna', 'artist': 'Billy Joel', 'energy': 0.59, 'danceability': 0.62, 'tempo': 76, 'popularity': 80},
    
    # Jazz/Instrumental
    {'id': 141, 'title': 'Autumn Leaves', 'artist': 'Ed Sheeran', 'energy': 0.50, 'danceability': 0.48, 'tempo': 96, 'popularity': 78},
    {'id': 142, 'title': 'So What', 'artist': 'Miles Davis', 'energy': 0.62, 'danceability': 0.55, 'tempo': 120, 'popularity': 76},
    {'id': 143, 'title': 'Clair de Lune', 'artist': 'Claude Debussy', 'energy': 0.25, 'danceability': 0.15, 'tempo': 40, 'popularity': 72},
    {'id': 144, 'title': 'Smooth Jazz', 'artist': 'Kenny G', 'energy': 0.40, 'danceability': 0.45, 'tempo': 90, 'popularity': 74},
    {'id': 145, 'title': 'Night Owl', 'artist': 'Caravan Palace', 'energy': 0.68, 'danceability': 0.72, 'tempo': 120, 'popularity': 75},
    {'id': 146, 'title': 'Clair', 'artist': 'Balmorhea', 'energy': 0.38, 'danceability': 0.30, 'tempo': 80, 'popularity': 70},
    {'id': 147, 'title': 'Meditation', 'artist': 'Max Richter', 'energy': 0.20, 'danceability': 0.10, 'tempo': 50, 'popularity': 68},
    {'id': 148, 'title': 'Inception Dream', 'artist': 'Hans Zimmer', 'energy': 0.65, 'danceability': 0.48, 'tempo': 120, 'popularity': 76},
    {'id': 149, 'title': 'The Science of Silence', 'artist': 'Sigur Rós', 'energy': 0.55, 'danceability': 0.38, 'tempo': 108, 'popularity': 72},
    {'id': 150, 'title': 'Experience', 'artist': 'Ludovico Einaudi', 'energy': 0.50, 'danceability': 0.40, 'tempo': 80, 'popularity': 71},
    
    # Additional Modern Pop Hits
    {'id': 151, 'title': 'Circles', 'artist': 'Post Malone', 'energy': 0.58, 'danceability': 0.67, 'tempo': 120, 'popularity': 88},
    {'id': 152, 'title': 'Peaches', 'artist': 'Justin Bieber ft. Daniel Caesar', 'energy': 0.60, 'danceability': 0.68, 'tempo': 90, 'popularity': 87},
    {'id': 153, 'title': 'Drivers License (Remix)', 'artist': 'Olivia Rodrigo', 'energy': 0.68, 'danceability': 0.72, 'tempo': 120, 'popularity': 86},
    {'id': 154, 'title': 'Jealousy, Jealousy', 'artist': 'Olivia Rodrigo', 'energy': 0.71, 'danceability': 0.74, 'tempo': 104, 'popularity': 85},
    {'id': 155, 'title': 'Happier Than Ever', 'artist': 'Billie Eilish', 'energy': 0.56, 'danceability': 0.64, 'tempo': 91, 'popularity': 87},
    {'id': 156, 'title': 'Woman', 'artist': 'Dua Lipa', 'energy': 0.75, 'danceability': 0.79, 'tempo': 120, 'popularity': 86},
    {'id': 157, 'title': 'Good 4 U', 'artist': 'Olivia Rodrigo', 'energy': 0.74, 'danceability': 0.72, 'tempo': 164, 'popularity': 89},
    {'id': 158, 'title': 'Traitor', 'artist': 'Olivia Rodrigo', 'energy': 0.53, 'danceability': 0.60, 'tempo': 95, 'popularity': 86},
    {'id': 159, 'title': 'drivers license', 'artist': 'Olivia Rodrigo', 'energy': 0.41, 'danceability': 0.39, 'tempo': 97, 'popularity': 93},
    {'id': 160, 'title': 'Enough for You', 'artist': 'Olivia Rodrigo', 'energy': 0.35, 'danceability': 0.38, 'tempo': 84, 'popularity': 83},
    
    # Additional Diverse Artists
    {'id': 161, 'title': 'Shut Down', 'artist': 'BLACKPINK', 'energy': 0.79, 'danceability': 0.79, 'tempo': 113, 'popularity': 86},
    {'id': 162, 'title': 'Pink + White', 'artist': 'Frank Ocean', 'energy': 0.41, 'danceability': 0.42, 'tempo': 116, 'popularity': 81},
    {'id': 163, 'title': 'Nights', 'artist': 'Frank Ocean', 'energy': 0.56, 'danceability': 0.65, 'tempo': 88, 'popularity': 82},
    {'id': 164, 'title': 'Ivy', 'artist': 'Frank Ocean', 'energy': 0.48, 'danceability': 0.60, 'tempo': 98, 'popularity': 80},
    {'id': 165, 'title': 'Godspeed', 'artist': 'Frank Ocean', 'energy': 0.45, 'danceability': 0.52, 'tempo': 90, 'popularity': 78},
    {'id': 166, 'title': 'Yellow', 'artist': 'Coldplay', 'energy': 0.61, 'danceability': 0.61, 'tempo': 173, 'popularity': 85},
    {'id': 167, 'title': 'Fix You', 'artist': 'Coldplay', 'energy': 0.55, 'danceability': 0.59, 'tempo': 95, 'popularity': 85},
    {'id': 168, 'title': 'Paradise', 'artist': 'Coldplay', 'energy': 0.73, 'danceability': 0.72, 'tempo': 128, 'popularity': 84},
    {'id': 169, 'title': 'Adventure of a Lifetime', 'artist': 'Coldplay', 'energy': 0.71, 'danceability': 0.72, 'tempo': 124, 'popularity': 85},
    {'id': 170, 'title': 'Clocks', 'artist': 'Coldplay', 'energy': 0.68, 'danceability': 0.69, 'tempo': 130, 'popularity': 86},
    
    # Study/Focus Vibes
    {'id': 171, 'title': 'Weightless', 'artist': 'Marconi Union', 'energy': 0.30, 'danceability': 0.20, 'tempo': 60, 'popularity': 65},
    {'id': 172, 'title': 'Peace of Mind', 'artist': 'Boston', 'energy': 0.65, 'danceability': 0.68, 'tempo': 124, 'popularity': 83},
    {'id': 173, 'title': 'Productivity Stream', 'artist': 'Brian Eno', 'energy': 0.35, 'danceability': 0.25, 'tempo': 70, 'popularity': 68},
    {'id': 174, 'title': 'Forest Rain', 'artist': 'Nature Sounds', 'energy': 0.25, 'danceability': 0.10, 'tempo': 40, 'popularity': 62},
    {'id': 175, 'title': 'Cafe Study Beats', 'artist': 'The Stables', 'energy': 0.40, 'danceability': 0.35, 'tempo': 95, 'popularity': 70},
    {'id': 176, 'title': 'Piano Focus', 'artist': 'Yann Tiersen', 'energy': 0.48, 'danceability': 0.42, 'tempo': 100, 'popularity': 72},
    {'id': 177, 'title': 'Nocturne', 'artist': 'Frédéric Chopin', 'energy': 0.35, 'danceability': 0.30, 'tempo': 60, 'popularity': 68},
    {'id': 178, 'title': 'Ambient Zone', 'artist': 'Tycho', 'energy': 0.42, 'danceability': 0.32, 'tempo': 110, 'popularity': 71},
    {'id': 179, 'title': 'Productive Hours', 'artist': 'Lo-Fi Beats', 'energy': 0.38, 'danceability': 0.35, 'tempo': 85, 'popularity': 73},
    {'id': 180, 'title': 'Daydream Believer', 'artist': 'The Monkees', 'energy': 0.70, 'danceability': 0.71, 'tempo': 110, 'popularity': 81},
    
    # Night Drive/Chill Vibes
    {'id': 181, 'title': 'Night City', 'artist': 'Perturbator', 'energy': 0.62, 'danceability': 0.58, 'tempo': 95, 'popularity': 68},
    {'id': 182, 'title': 'Late Night Vibes', 'artist': 'Pink Panthers', 'energy': 0.55, 'danceability': 0.65, 'tempo': 100, 'popularity': 70},
    {'id': 183, 'title': 'Midnight Highway', 'artist': 'Lo-Fi Boy', 'energy': 0.50, 'danceability': 0.62, 'tempo': 92, 'popularity': 69},
    {'id': 184, 'title': 'Neon Dreams', 'artist': 'Synthwave King', 'energy': 0.58, 'danceability': 0.60, 'tempo': 102, 'popularity': 67},
    {'id': 185, 'title': 'City Lights', 'artist': 'Chillwave Masters', 'energy': 0.52, 'danceability': 0.58, 'tempo': 95, 'popularity': 68},
    {'id': 186, 'title': '3AM Thoughts', 'artist': 'Late Night Tales', 'energy': 0.45, 'danceability': 0.50, 'tempo': 88, 'popularity': 65},
    {'id': 187, 'title': 'Driving Home', 'artist': 'Night Driver', 'energy': 0.56, 'danceability': 0.64, 'tempo': 96, 'popularity': 66},
    {'id': 188, 'title': 'Midnight Drive', 'artist': 'Outrun Dreams', 'energy': 0.60, 'danceability': 0.62, 'tempo': 100, 'popularity': 67},
    {'id': 189, 'title': 'Neon Glow', 'artist': 'Retrowave Nights', 'energy': 0.65, 'danceability': 0.68, 'tempo': 110, 'popularity': 69},
    {'id': 190, 'title': 'After Hours', 'artist': 'Late Night Rides', 'energy': 0.52, 'danceability': 0.55, 'tempo': 100, 'popularity': 68},
    
    # Gym/Workout Energy
    {'id': 191, 'title': 'Eye of the Tiger', 'artist': 'Survivor', 'energy': 0.93, 'danceability': 0.80, 'tempo': 109, 'popularity': 85},
    {'id': 192, 'title': 'Pump It Up', 'artist': 'Endor', 'energy': 0.90, 'danceability': 0.87, 'tempo': 128, 'popularity': 83},
    {'id': 193, 'title': 'Stronger', 'artist': 'Kanye West', 'energy': 0.85, 'danceability': 0.82, 'tempo': 104, 'popularity': 85},
    {'id': 194, 'title': 'Till I Collapse', 'artist': 'Eminem', 'energy': 0.92, 'danceability': 0.85, 'tempo': 170, 'popularity': 86},
    {'id': 195, 'title': 'Lose Yourself', 'artist': 'Eminem', 'energy': 0.88, 'danceability': 0.83, 'tempo': 172, 'popularity': 90},
    {'id': 196, 'title': 'We Will Rock You', 'artist': 'Queen', 'energy': 0.86, 'danceability': 0.72, 'tempo': 76, 'popularity': 84},
    {'id': 197, 'title': 'Another One Bites the Dust', 'artist': 'Queen', 'energy': 0.82, 'danceability': 0.75, 'tempo': 110, 'popularity': 84},
    {'id': 198, 'title': 'Don\'t Stop Believing', 'artist': 'Journey', 'energy': 0.77, 'danceability': 0.76, 'tempo': 120, 'popularity': 85},
    {'id': 199, 'title': 'Thunderstruck', 'artist': 'AC/DC', 'energy': 0.88, 'danceability': 0.71, 'tempo': 120, 'popularity': 84},
    {'id': 200, 'title': 'Gimme Shelter', 'artist': 'The Rolling Stones', 'energy': 0.84, 'danceability': 0.73, 'tempo': 114, 'popularity': 83},
    
    # Summer Vibes
    {'id': 201, 'title': 'Summerthing!', 'artist': 'Childish Gambino', 'energy': 0.75, 'danceability': 0.78, 'tempo': 120, 'popularity': 81},
    {'id': 202, 'title': 'Island in the Sun', 'artist': 'Weezer', 'energy': 0.78, 'danceability': 0.76, 'tempo': 176, 'popularity': 84},
    {'id': 203, 'title': 'Surfin\'', 'artist': 'Weezer', 'energy': 0.72, 'danceability': 0.74, 'tempo': 162, 'popularity': 80},
    {'id': 204, 'title': 'Two Weeks', 'artist': 'FKA twigs', 'energy': 0.72, 'danceability': 0.80, 'tempo': 104, 'popularity': 80},
    {'id': 205, 'title': 'Feel It Still', 'artist': 'Portugal. The Man', 'energy': 0.79, 'danceability': 0.76, 'tempo': 126, 'popularity': 84},
    {'id': 206, 'title': 'Sunroof', 'artist': 'Nicky Youre', 'energy': 0.58, 'danceability': 0.72, 'tempo': 90, 'popularity': 86},
    {'id': 207, 'title': 'Good Life', 'artist': 'Kanye West', 'energy': 0.68, 'danceability': 0.72, 'tempo': 98, 'popularity': 83},
    {'id': 208, 'title': 'Sunshine', 'artist': 'Atmosphere', 'energy': 0.61, 'danceability': 0.66, 'tempo': 96, 'popularity': 81},
    {'id': 209, 'title': 'Walking on Sunshine', 'artist': 'Katrina & The Waves', 'energy': 0.90, 'danceability': 0.87, 'tempo': 128, 'popularity': 86},
    {'id': 210, 'title': 'Summer Song', 'artist': 'A$AP Rocky', 'energy': 0.70, 'danceability': 0.74, 'tempo': 95, 'popularity': 80},
    
    # Melancholy/Sad Vibes
    {'id': 211, 'title': 'Hurt', 'artist': 'Johnny Cash', 'energy': 0.32, 'danceability': 0.35, 'tempo': 110, 'popularity': 82},
    {'id': 212, 'title': 'Breathe Me', 'artist': 'Sia', 'energy': 0.42, 'danceability': 0.48, 'tempo': 100, 'popularity': 78},
    {'id': 213, 'title': 'Yesterday', 'artist': 'The Beatles', 'energy': 0.35, 'danceability': 0.38, 'tempo': 80, 'popularity': 83},
    {'id': 214, 'title': 'Sad', 'artist': 'XXXTENTACION', 'energy': 0.38, 'danceability': 0.42, 'tempo': 80, 'popularity': 82},
    {'id': 215, 'title': 'Luv Is Rage 2', 'artist': 'Playboi Carti', 'energy': 0.65, 'danceability': 0.60, 'tempo': 92, 'popularity': 79},
    {'id': 216, 'title': 'EARFQUAKE', 'artist': 'Tyler, The Creator', 'energy': 0.72, 'danceability': 0.70, 'tempo': 115, 'popularity': 82},
    {'id': 217, 'title': 'Black', 'artist': 'Pearl Jam', 'energy': 0.68, 'danceability': 0.62, 'tempo': 108, 'popularity': 80},
    {'id': 218, 'title': 'Lithium', 'artist': 'Nirvana', 'energy': 0.77, 'danceability': 0.68, 'tempo': 126, 'popularity': 82},
    {'id': 219, 'title': 'The Scientist', 'artist': 'Coldplay', 'energy': 0.50, 'danceability': 0.55, 'tempo': 90, 'popularity': 84},
    {'id': 220, 'title': 'Nutshell', 'artist': 'Alice in Chains', 'energy': 0.45, 'danceability': 0.48, 'tempo': 96, 'popularity': 79},
    
    # Focus/Productive
    {'id': 221, 'title': 'Blinding Lights (Slowed)', 'artist': 'The Weeknd', 'energy': 0.52, 'danceability': 0.55, 'tempo': 90, 'popularity': 80},
    {'id': 222, 'title': 'Golden (Lo-Fi)', 'artist': 'Harry Styles', 'energy': 0.45, 'danceability': 0.50, 'tempo': 85, 'popularity': 77},
    {'id': 223, 'title': 'Study Girl', 'artist': 'Conan Gray', 'energy': 0.42, 'danceability': 0.48, 'tempo': 88, 'popularity': 76},
    {'id': 224, 'title': 'Homework', 'artist': 'Lo-Fi Hip Hop', 'energy': 0.38, 'danceability': 0.42, 'tempo': 90, 'popularity': 74},
    {'id': 225, 'title': 'Vibing', 'artist': 'Beabadoobee', 'energy': 0.48, 'danceability': 0.55, 'tempo': 92, 'popularity': 75},
    {'id': 226, 'title': 'Focus Flow', 'artist': 'Chill House', 'energy': 0.40, 'danceability': 0.45, 'tempo': 100, 'popularity': 72},
    {'id': 227, 'title': 'Deep Work', 'artist': 'Ambient Music', 'energy': 0.32, 'danceability': 0.25, 'tempo': 80, 'popularity': 70},
    {'id': 228, 'title': 'Concentration', 'artist': 'Study Beats', 'energy': 0.35, 'danceability': 0.30, 'tempo': 95, 'popularity': 71},
    {'id': 229, 'title': 'Mind Clear', 'artist': 'Zen Music', 'energy': 0.28, 'danceability': 0.20, 'tempo': 70, 'popularity': 68},
    {'id': 230, 'title': 'Quiet', 'artist': 'Soft Piano', 'energy': 0.25, 'danceability': 0.15, 'tempo': 60, 'popularity': 65},
    
    # Party/Club Energy
    {'id': 231, 'title': 'Don\'t Stop Me Now', 'artist': 'Queen', 'energy': 0.91, 'danceability': 0.79, 'tempo': 180, 'popularity': 86},
    {'id': 232, 'title': 'Stayin\' Alive', 'artist': 'Bee Gees', 'energy': 0.88, 'danceability': 0.81, 'tempo': 103, 'popularity': 85},
    {'id': 233, 'title': 'Good as Hell (Club Mix)', 'artist': 'Lizzo', 'energy': 0.82, 'danceability': 0.85, 'tempo': 120, 'popularity': 84},
    {'id': 234, 'title': 'Party Rock Anthem', 'artist': 'LMFAO', 'energy': 0.89, 'danceability': 0.88, 'tempo': 120, 'popularity': 85},
    {'id': 235, 'title': 'Everybody Dance', 'artist': 'David Bowie', 'energy': 0.83, 'danceability': 0.79, 'tempo': 116, 'popularity': 80},
    {'id': 236, 'title': 'Last Dance', 'artist': 'Donna Summer', 'energy': 0.87, 'danceability': 0.84, 'tempo': 104, 'popularity': 83},
    {'id': 237, 'title': 'Touch Me', 'artist': 'Daft Punk', 'energy': 0.90, 'danceability': 0.89, 'tempo': 126, 'popularity': 85},
    {'id': 238, 'title': 'One More Time', 'artist': 'Daft Punk', 'energy': 0.92, 'danceability': 0.90, 'tempo': 120, 'popularity': 87},
    {'id': 239, 'title': 'Get Lucky', 'artist': 'Daft Punk', 'energy': 0.86, 'danceability': 0.85, 'tempo': 116, 'popularity': 88},
    {'id': 240, 'title': 'Around the World', 'artist': 'Daft Punk', 'energy': 0.87, 'danceability': 0.87, 'tempo': 128, 'popularity': 85},
    
    # Late Night
    {'id': 241, 'title': 'Late Night', 'artist': 'Jeremih', 'energy': 0.58, 'danceability': 0.68, 'tempo': 92, 'popularity': 81},
    {'id': 242, 'title': '3AM', 'artist': 'Matchbox Twenty', 'energy': 0.65, 'danceability': 0.67, 'tempo': 176, 'popularity': 83},
    {'id': 243, 'title': 'After Hours', 'artist': 'The Weeknd', 'energy': 0.52, 'danceability': 0.60, 'tempo': 110, 'popularity': 86},
    {'id': 244, 'title': 'Untitled (How Does It Feel)', 'artist': 'D\'Angelo', 'energy': 0.48, 'danceability': 0.62, 'tempo': 92, 'popularity': 78},
    {'id': 245, 'title': 'Late Nights', 'artist': 'Summer Walker', 'energy': 0.45, 'danceability': 0.55, 'tempo': 95, 'popularity': 80},
    {'id': 246, 'title': 'Middle of the Night', 'artist': 'Elley Duhé', 'energy': 0.62, 'danceability': 0.70, 'tempo': 98, 'popularity': 81},
    {'id': 247, 'title': 'Night Changes', 'artist': 'One Direction', 'energy': 0.68, 'danceability': 0.68, 'tempo': 173, 'popularity': 87},
    {'id': 248, 'title': 'Nights', 'artist': 'Frank Ocean', 'energy': 0.56, 'danceability': 0.65, 'tempo': 88, 'popularity': 82},
    {'id': 249, 'title': '4AM', 'artist': 'SZA', 'energy': 0.50, 'danceability': 0.58, 'tempo': 100, 'popularity': 80},
    {'id': 250, 'title': 'Sleep When I\'m Dead', 'artist': 'The Sisters of Mercy', 'energy': 0.72, 'danceability': 0.70, 'tempo': 110, 'popularity': 79},
]

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def normalize(value, min_val, max_val):
    """
    Normalize a value between 0 and 1
    Useful for comparing metrics on the same scale
    """
    if max_val == min_val:
        return 0.5
    return (value - min_val) / (max_val - min_val)


def euclidean_distance(features1, features2):
    """
    Calculate Euclidean distance between two feature vectors
    Lower distance = more similar songs
    
    Formula: sqrt((x1-x2)^2 + (y1-y2)^2 + ... (n1-n2)^2)
    """
    sum_squared_diff = sum((f1 - f2) ** 2 for f1, f2 in zip(features1, features2))
    return math.sqrt(sum_squared_diff)


def get_song_metrics(song):
    """Extract and normalize audio features from a song"""
    return {
        'energy': song['energy'],
        'danceability': song['danceability'],
        'tempo_norm': normalize(song['tempo'], 60, 200),
        'popularity_norm': normalize(song['popularity'], 0, 100)
    }


def calculate_mood(song):
    """
    Classify song into mood categories based on audio features
    Uses energy and danceability as primary indicators
    """
    energy = song['energy']
    danceability = song['danceability']
    tempo = song['tempo']
    
    # High energy + high danceability
    if energy > 0.75 and danceability > 0.7:
        if tempo > 140:
            return "Gym Energy"
        return "Party Vibes"
    
    # High energy but lower danceability
    if energy > 0.75 and danceability <= 0.7:
        return "Energetic"
    
    # Medium energy + high danceability
    if 0.4 <= energy <= 0.75 and danceability > 0.7:
        if tempo < 100:
            return "Summer Vibes"
        return "Feel-Good"
    
    # Medium energy and danceability
    if 0.4 <= energy <= 0.75 and 0.4 <= danceability <= 0.7:
        if tempo < 100:
            return "Chilled"
        return "Study Session"
    
    # Low energy + high danceability
    if energy < 0.4 and danceability > 0.6:
        return "Late Night"
    
    # Low energy overall
    if energy < 0.4:
        return "Melancholy"
    
    return "Focus Mode"


def recommend_songs(seed_song, all_songs, num_recommendations=5):
    """
    Recommend songs similar to seed_song using weighted Euclidean distance
    
    Algorithm:
    1. Extract normalized features from seed song
    2. Calculate distance to all other songs
    3. Weight by multiple features (energy, danceability, tempo, popularity)
    4. Sort by distance and return top N recommendations
    """
    
    # Get seed song features
    seed_features = get_song_metrics(seed_song)
    
    # Calculate similarity scores for all songs
    recommendations = []
    
    for song in all_songs:
        if song['id'] == seed_song['id']:
            continue  # Skip the seed song itself
        
        target_features = get_song_metrics(song)
        
        # Calculate weighted distance
        # Weights: prefer matching energy and danceability, then tempo
        weights = {
            'energy': 0.3,
            'danceability': 0.3,
            'tempo_norm': 0.2,
            'popularity_norm': 0.2
        }
        
        weighted_diff = 0
        for key in weights:
            diff = abs(seed_features[key] - target_features[key])
            weighted_diff += weights[key] * diff
        
        # Convert distance to confidence score (higher = better match)
        confidence = max(0, 1 - weighted_diff)
        
        recommendations.append({
            'id': song['id'],
            'title': song['title'],
            'artist': song['artist'],
            'energy': song['energy'],
            'danceability': song['danceability'],
            'tempo': song['tempo'],
            'popularity': song['popularity'],
            'mood': calculate_mood(song),
            'similarity_score': round(confidence, 3)
        })
    
    # Sort by similarity and return top N
    recommendations.sort(key=lambda x: x['similarity_score'], reverse=True)
    return recommendations[:num_recommendations]


def battle_songs(song1, song2):
    """
    Compare two songs across multiple metrics
    Returns detailed comparison and winner
    """
    
    # Calculate weighted battle score
    metrics = {
        'energy': {'weight': 0.2, 's1': song1['energy'], 's2': song2['energy']},
        'danceability': {'weight': 0.25, 's1': song1['danceability'], 's2': song2['danceability']},
        'tempo': {'weight': 0.15, 's1': normalize(song1['tempo'], 60, 200), 's2': normalize(song2['tempo'], 60, 200)},
        'popularity': {'weight': 0.25, 's1': normalize(song1['popularity'], 0, 100), 's2': normalize(song2['popularity'], 0, 100)},
        'mood': {'weight': 0.15, 's1': 1 if calculate_mood(song1) in ['Party Vibes', 'Gym Energy'] else 0.5, 's2': 1 if calculate_mood(song2) in ['Party Vibes', 'Gym Energy'] else 0.5}
    }
    
    song1_score = sum(m['weight'] * m['s1'] for m in metrics.values())
    song2_score = sum(m['weight'] * m['s2'] for m in metrics.values())
    
    winner = 'song1' if song1_score > song2_score else ('song2' if song2_score > song1_score else 'tie')
    
    return {
        'song1': {
            'id': song1['id'],
            'title': song1['title'],
            'artist': song1['artist'],
            'score': round(song1_score, 2),
            'metrics': {
                'energy': song1['energy'],
                'danceability': song1['danceability'],
                'tempo': song1['tempo'],
                'popularity': song1['popularity']
            }
        },
        'song2': {
            'id': song2['id'],
            'title': song2['title'],
            'artist': song2['artist'],
            'score': round(song2_score, 2),
            'metrics': {
                'energy': song2['energy'],
                'danceability': song2['danceability'],
                'tempo': song2['tempo'],
                'popularity': song2['popularity']
            }
        },
        'winner': winner,
        'details': {
            'energy': 'song1' if song1['energy'] > song2['energy'] else 'song2',
            'danceability': 'song1' if song1['danceability'] > song2['danceability'] else 'song2',
            'tempo': 'song1' if song1['tempo'] > song2['tempo'] else 'song2',
            'popularity': 'song1' if song1['popularity'] > song2['popularity'] else 'song2'
        }
    }
