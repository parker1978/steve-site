# Now Playing Dashboard - Setup Guide

This guide will help you connect your dashboard to real APIs for Spotify, Strava, Instagram, and Weather data.

## 🎵 Spotify API Setup

1. **Create a Spotify App**
   - Go to https://developer.spotify.com/dashboard
   - Log in with your Spotify account
   - Click "Create an App"
   - Fill in the app name and description
   - Add `http://localhost:3000/callback` as a Redirect URI

2. **Get Your Credentials**
   - Note your Client ID and Client Secret
   - You'll need these for OAuth authentication

3. **API Endpoints to Use**
   - Currently Playing: `GET https://api.spotify.com/v1/me/player/currently-playing`
   - Get Playlist: `GET https://api.spotify.com/v1/playlists/{playlist_id}`
   - Create a playlist for your running music and get its ID from the URL

4. **Implementation**
   ```javascript
   const getSpotifyAccessToken = async () => {
     // Implement Spotify OAuth flow
     // You'll need to handle the authorization code flow
     // Store the access token (it expires after 1 hour)
   };

   const fetchCurrentlyPlaying = async (accessToken) => {
     const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
       headers: {
         'Authorization': `Bearer ${accessToken}`
       }
     });
     return response.json();
   };
   ```

## 🏃 Strava API Setup

1. **Create a Strava App**
   - Go to https://www.strava.com/settings/api
   - Create an app
   - Set Authorization Callback Domain to `localhost`

2. **Get Your Credentials**
   - Note your Client ID and Client Secret
   - You'll need to implement OAuth 2.0

3. **API Endpoints to Use**
   - Activities: `GET https://www.strava.com/api/v3/athlete/activities`
   - Stats: `GET https://www.strava.com/api/v3/athletes/{id}/stats`

4. **Implementation**
   ```javascript
   const getStravaActivities = async (accessToken) => {
     const response = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=5', {
       headers: {
         'Authorization': `Bearer ${accessToken}`
       }
     });
     const activities = await response.json();
     // Filter for runs: activities.filter(a => a.type === 'Run')
     return activities;
   };
   ```

## 📸 Instagram API Options

Instagram's API has become more restricted. Here are your options:

### Option 1: Instagram Basic Display API (Personal Use)
1. Create a Facebook Developer account at https://developers.facebook.com
2. Create an App and add Instagram Basic Display product
3. This gives you access to your own media only
4. API endpoint: `GET https://graph.instagram.com/me/media`

### Option 2: Manual Integration (Easiest)
1. Upload photos to your website's image folder
2. Update a JSON file with image URLs and captions
3. The dashboard reads from this JSON file
4. You can automate this with a script that you run periodically

### Option 3: Third-party Service
- Use services like SnapWidget or EmbedSocial
- They handle the Instagram API complexity
- Usually require a small fee

## 🌤️ Weather API Setup

Using OpenWeatherMap (Free tier available):

1. **Sign Up**
   - Go to https://openweathermap.org/api
   - Create a free account
   - Get your API key

2. **API Endpoint**
   ```javascript
   const getWeather = async (lat, lon, apiKey) => {
     const response = await fetch(
       `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
     );
     return response.json();
   };
   ```

3. **Get Your Coordinates**
   - You can hardcode your location coordinates
   - Or use the browser's Geolocation API: `navigator.geolocation.getCurrentPosition()`

## 📚 Books Section

For the books section, you have a few options:

### Option 1: Manual Update
- Edit the dashboard code directly with your current book
- Update progress percentage as you read

### Option 2: Goodreads API
- Note: Goodreads API is no longer accepting new developer keys
- If you already have access, you can use it

### Option 3: JSON File
- Create a `current-book.json` file
- Update it manually or with a script
- The dashboard reads from this file

## 🏃‍♂️ Running Shoes

This is best kept as manual data since there's no API for shoe mileage:

1. Create a `shoes.json` file:
```json
{
  "current": {
    "brand": "Nike",
    "model": "Pegasus 40",
    "miles": 187,
    "maxMiles": 400
  },
  "retired": [
    {"brand": "Hoka", "model": "Clifton 8", "miles": 423},
    {"brand": "Brooks", "model": "Ghost 14", "miles": 456}
  ]
}
```

2. Update the miles periodically (you could even create a simple form on another page to update this)

## 🔐 Security Best Practices

1. **Never commit API keys to Git**
   - Use environment variables
   - Create a `.env` file (add to `.gitignore`)
   
2. **Backend Proxy**
   - Consider creating a simple backend (Node.js/Express)
   - Store API keys on the backend
   - Frontend makes requests to your backend, not directly to APIs
   - This keeps your keys secure

3. **Token Refresh**
   - Most OAuth tokens expire
   - Implement automatic token refresh
   - Store refresh tokens securely

## 🚀 Deployment Options

### Option 1: Static Site with Serverless Functions
- Host on Vercel, Netlify, or similar
- Use serverless functions for API calls
- Keep secrets in environment variables

### Option 2: Traditional Backend
- Deploy a Node.js server (Heroku, DigitalOcean, etc.)
- Handle all API calls server-side
- Serve the React frontend

### Option 3: Hybrid Approach
- Static site for the frontend
- Separate API service (like Railway or Render)
- CORS configuration to allow your domain

## 📝 Implementation Checklist

- [ ] Set up Spotify Developer account and app
- [ ] Set up Strava Developer account and app  
- [ ] Choose and implement Instagram solution
- [ ] Get OpenWeatherMap API key
- [ ] Decide on books tracking method
- [ ] Create shoes data file
- [ ] Set up environment variables
- [ ] Implement OAuth flows for Spotify and Strava
- [ ] Create backend proxy for API calls (recommended)
- [ ] Test all integrations locally
- [ ] Deploy to production
- [ ] Set up automatic data refresh (cron jobs or webhooks)

## 💡 Pro Tips

1. **Caching**: Cache API responses to avoid rate limits
2. **Auto-refresh**: Set up the dashboard to refresh data every 5-10 minutes
3. **Fallbacks**: Have default/cached data to show if APIs fail
4. **Loading States**: Show skeletons or loading animations while fetching
5. **Error Handling**: Display friendly messages when APIs are down
6. **Mobile First**: Test on mobile - this dashboard should look great on all devices

## 🔄 Optional Enhancements

- Add a settings panel to update data manually
- Create an admin page to edit books and shoes
- Add more stats (monthly running totals, music listening stats)
- Include a "memories" section with random past Instagram posts
- Add weather forecasts, not just current weather
- Show Spotify listening history graphs

---

Questions? The trickiest parts are usually the OAuth flows for Spotify and Strava. There are great libraries like `passport` (Node.js) or tutorials specific to each platform that can help!