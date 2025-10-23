// backend-server.js
// Simple Express server to handle API calls securely
// This keeps your API keys safe and handles OAuth flows

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// SPOTIFY ENDPOINTS
// ============================================

// Store tokens in memory (in production, use a database)
let spotifyAccessToken = null;
let spotifyRefreshToken = null;

// Spotify OAuth - Step 1: Redirect to Spotify login
app.get('/auth/spotify', (req, res) => {
  const scopes = 'user-read-currently-playing user-read-playback-state playlist-read-private';
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3001/auth/spotify/callback';
  
  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: redirectUri
  })}`;
  
  res.redirect(authUrl);
});

// Spotify OAuth - Step 2: Handle callback and get tokens
app.get('/auth/spotify/callback', async (req, res) => {
  const code = req.query.code;
  
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3001/auth/spotify/callback'
      }), {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
          ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    spotifyAccessToken = response.data.access_token;
    spotifyRefreshToken = response.data.refresh_token;
    
    // Redirect back to your frontend
    res.redirect('http://localhost:3000?spotify=connected');
  } catch (error) {
    console.error('Spotify auth error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to authenticate with Spotify' });
  }
});

// Refresh Spotify token
const refreshSpotifyToken = async () => {
  if (!spotifyRefreshToken) return false;
  
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: spotifyRefreshToken
      }), {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
          ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    spotifyAccessToken = response.data.access_token;
    return true;
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    return false;
  }
};

// Get currently playing track
app.get('/api/spotify/now-playing', async (req, res) => {
  if (!spotifyAccessToken) {
    return res.status(401).json({ error: 'Not authenticated with Spotify' });
  }
  
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { 'Authorization': `Bearer ${spotifyAccessToken}` }
    });
    
    if (response.status === 204) {
      return res.json({ isPlaying: false });
    }
    
    const track = response.data.item;
    res.json({
      currentTrack: {
        name: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        albumArt: track.album.images[0]?.url,
        isPlaying: response.data.is_playing
      }
    });
  } catch (error) {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshed = await refreshSpotifyToken();
      if (refreshed) {
        return res.redirect('/api/spotify/now-playing');
      }
    }
    console.error('Spotify API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Spotify data' });
  }
});

// Get running playlist
app.get('/api/spotify/running-playlist', async (req, res) => {
  if (!spotifyAccessToken) {
    return res.status(401).json({ error: 'Not authenticated with Spotify' });
  }
  
  const playlistId = process.env.SPOTIFY_RUNNING_PLAYLIST_ID;
  
  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: { 'Authorization': `Bearer ${spotifyAccessToken}` }
    });
    
    const tracks = response.data.tracks.items.slice(0, 5).map(item => ({
      name: item.track.name,
      artist: item.track.artists.map(a => a.name).join(', ')
    }));
    
    res.json({
      name: response.data.name,
      tracks: tracks
    });
  } catch (error) {
    console.error('Spotify playlist error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

// ============================================
// STRAVA ENDPOINTS
// ============================================

let stravaAccessToken = null;
let stravaRefreshToken = null;

// Strava OAuth - Step 1: Redirect to Strava
app.get('/auth/strava', (req, res) => {
  const authUrl = `https://www.strava.com/oauth/authorize?${new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    redirect_uri: process.env.STRAVA_REDIRECT_URI || 'http://localhost:3001/auth/strava/callback',
    response_type: 'code',
    scope: 'read,activity:read'
  })}`;
  
  res.redirect(authUrl);
});

// Strava OAuth - Step 2: Handle callback
app.get('/auth/strava/callback', async (req, res) => {
  const code = req.query.code;
  
  try {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code'
    });
    
    stravaAccessToken = response.data.access_token;
    stravaRefreshToken = response.data.refresh_token;
    
    res.redirect('http://localhost:3000?strava=connected');
  } catch (error) {
    console.error('Strava auth error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to authenticate with Strava' });
  }
});

// Get recent runs
app.get('/api/strava/activities', async (req, res) => {
  if (!stravaAccessToken) {
    return res.status(401).json({ error: 'Not authenticated with Strava' });
  }
  
  try {
    const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { 'Authorization': `Bearer ${stravaAccessToken}` },
      params: { per_page: 5 }
    });
    
    const runs = response.data
      .filter(activity => activity.type === 'Run')
      .map(run => ({
        name: run.name,
        distance: (run.distance / 1609.34).toFixed(1), // Convert meters to miles
        duration: new Date(run.moving_time * 1000).toISOString().substr(11, 8).replace(/^00:/, ''),
        pace: calculatePace(run.distance, run.moving_time),
        date: formatDate(run.start_date)
      }));
    
    // Calculate weekly mileage
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyMiles = response.data
      .filter(a => a.type === 'Run' && new Date(a.start_date) > oneWeekAgo)
      .reduce((sum, run) => sum + (run.distance / 1609.34), 0);
    
    res.json({
      recentRuns: runs.slice(0, 3),
      weeklyMileage: weeklyMiles.toFixed(1)
    });
  } catch (error) {
    console.error('Strava API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Strava data' });
  }
});

// Helper functions for Strava
function calculatePace(distanceMeters, timeSeconds) {
  const miles = distanceMeters / 1609.34;
  const paceSecondsPerMile = timeSeconds / miles;
  const minutes = Math.floor(paceSecondsPerMile / 60);
  const seconds = Math.floor(paceSecondsPerMile % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

// ============================================
// WEATHER ENDPOINT
// ============================================

app.get('/api/weather', async (req, res) => {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude required' });
  }
  
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: lat,
        lon: lon,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'imperial'
      }
    });
    
    res.json({
      temp: Math.round(response.data.main.temp),
      condition: response.data.weather[0].main,
      location: response.data.name
    });
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// ============================================
// STATIC DATA ENDPOINTS
// ============================================

// These serve data from local JSON files that you update manually

app.get('/api/book', (req, res) => {
  // You can read from a JSON file or database
  res.json({
    title: "Project Hail Mary",
    author: "Andy Weir",
    progress: 67,
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg"
  });
});

app.get('/api/shoes', (req, res) => {
  res.json({
    current: {
      brand: "Nike",
      model: "Pegasus 40",
      miles: 187,
      maxMiles: 400
    },
    retired: [
      { brand: "Hoka", model: "Clifton 8", miles: 423 },
      { brand: "Brooks", model: "Ghost 14", miles: 456 }
    ]
  });
});

// ============================================
// SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('\nTo connect your accounts:');
  console.log(`- Spotify: http://localhost:${PORT}/auth/spotify`);
  console.log(`- Strava: http://localhost:${PORT}/auth/strava`);
});

// ============================================
// .env FILE TEMPLATE
// ============================================
/*
Create a .env file in the same directory with:

# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3001/auth/spotify/callback
SPOTIFY_RUNNING_PLAYLIST_ID=your_running_playlist_id

# Strava
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=http://localhost:3001/auth/strava/callback

# OpenWeatherMap
OPENWEATHER_API_KEY=your_openweather_api_key

# Server
PORT=3001
*/

// ============================================
// INSTALLATION
// ============================================
/*
1. Initialize a new Node.js project:
   npm init -y

2. Install dependencies:
   npm install express cors axios dotenv

3. Create a .env file with your API credentials

4. Run the server:
   node backend-server.js

5. Update your React app to call these endpoints instead of the APIs directly
*/