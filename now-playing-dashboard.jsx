import React, { useState, useEffect } from 'react';
import { Music, Book, Shoe, Activity, MapPin, Cloud, Instagram, Calendar } from 'lucide-react';

const NowPlayingDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [spotifyData, setSpotifyData] = useState(null);
  const [stravaData, setStravaData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSpotifyData(),
      fetchStravaData(),
      fetchWeatherData()
    ]);
    setLoading(false);
  };

  // SPOTIFY API - Replace with your actual Spotify API calls
  const fetchSpotifyData = async () => {
    // Mock data - replace with actual Spotify API call
    // You'll need to set up Spotify OAuth and get an access token
    // API endpoint: https://api.spotify.com/v1/me/player/currently-playing
    setSpotifyData({
      currentTrack: {
        name: "Running Up That Hill",
        artist: "Kate Bush",
        album: "Hounds of Love",
        albumArt: "https://i.scdn.co/image/ab67616d0000b273b2a2e7bb6b37c2f3f5ae908a",
        isPlaying: true
      },
      runningPlaylist: {
        name: "Morning Run Mix",
        tracks: [
          { name: "Blinding Lights", artist: "The Weeknd" },
          { name: "Don't Stop Me Now", artist: "Queen" },
          { name: "Eye of the Tiger", artist: "Survivor" }
        ]
      }
    });
  };

  // STRAVA API - Replace with your actual Strava API calls
  const fetchStravaData = async () => {
    // Mock data - replace with actual Strava API call
    // You'll need to set up Strava OAuth
    // API endpoint: https://www.strava.com/api/v3/athlete/activities
    setStravaData({
      recentRuns: [
        {
          name: "Morning Run",
          distance: 5.2,
          duration: "28:45",
          pace: "5:32",
          date: "Today"
        },
        {
          name: "Evening Run",
          distance: 8.1,
          duration: "45:20",
          pace: "5:36",
          date: "Yesterday"
        }
      ],
      weeklyMileage: 24.3
    });
  };

  // WEATHER API - Replace with your actual weather API calls
  const fetchWeatherData = async () => {
    // Mock data - replace with actual weather API call
    // You can use OpenWeatherMap API: https://openweathermap.org/api
    setWeatherData({
      temp: 68,
      condition: "Partly Cloudy",
      location: "Brooklyn, NY"
    });
  };

  // Static data - you can make these dynamic or editable
  const currentBook = {
    title: "Project Hail Mary",
    author: "Andy Weir",
    progress: 67,
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg"
  };

  const runningShoes = {
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
  };

  const instagramPosts = [
    { url: "https://picsum.photos/seed/1/400/400", caption: "Brooklyn Bridge run" },
    { url: "https://picsum.photos/seed/2/400/400", caption: "Coffee fuel" },
    { url: "https://picsum.photos/seed/3/400/400", caption: "New kicks!" },
    { url: "https://picsum.photos/seed/4/400/400", caption: "Sunset run" }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading your world...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with location and time */}
        <div className="mb-8 text-white">
          <h1 className="text-5xl font-bold mb-4">Now Playing: My Life</h1>
          <div className="flex items-center gap-6 text-lg">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{weatherData?.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              <span>{weatherData?.temp}°F • {weatherData?.condition}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Current Spotify Track */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Now Playing</h2>
            </div>
            {spotifyData?.currentTrack && (
              <div>
                <img 
                  src={spotifyData.currentTrack.albumArt} 
                  alt="Album art"
                  className="w-full aspect-square rounded-lg mb-4 shadow-lg"
                />
                <h3 className="text-white font-bold text-lg mb-1">
                  {spotifyData.currentTrack.name}
                </h3>
                <p className="text-gray-300">{spotifyData.currentTrack.artist}</p>
                <p className="text-gray-400 text-sm mt-1">{spotifyData.currentTrack.album}</p>
                {spotifyData.currentTrack.isPlaying && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-green-400 animate-pulse"></div>
                      <div className="w-1 h-6 bg-green-400 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-5 bg-green-400 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span className="text-green-400 text-sm">Playing</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Running Playlist */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-semibold text-white">Running Playlist</h2>
            </div>
            <h3 className="text-white font-bold mb-3">{spotifyData?.runningPlaylist.name}</h3>
            <div className="space-y-3">
              {spotifyData?.runningPlaylist.tracks.map((track, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-3">
                  <p className="text-white text-sm font-medium">{track.name}</p>
                  <p className="text-gray-400 text-xs">{track.artist}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Current Book */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Book className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Currently Reading</h2>
            </div>
            <img 
              src={currentBook.coverUrl}
              alt="Book cover"
              className="w-full h-64 object-cover rounded-lg mb-4 shadow-lg"
            />
            <h3 className="text-white font-bold text-lg mb-1">{currentBook.title}</h3>
            <p className="text-gray-300 mb-3">{currentBook.author}</p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${currentBook.progress}%` }}
              ></div>
            </div>
            <p className="text-gray-400 text-sm mt-2">{currentBook.progress}% complete</p>
          </div>

          {/* Strava Stats */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold text-white">Recent Runs</h2>
            </div>
            <div className="mb-4 bg-red-500/20 rounded-lg p-3 border border-red-400/30">
              <p className="text-red-300 text-sm font-medium">This Week</p>
              <p className="text-white text-2xl font-bold">{stravaData?.weeklyMileage} miles</p>
            </div>
            <div className="space-y-3">
              {stravaData?.recentRuns.map((run, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-white font-medium">{run.name}</p>
                    <span className="text-gray-400 text-xs">{run.date}</span>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <span className="text-gray-300">{run.distance} mi</span>
                    <span className="text-gray-300">{run.duration}</span>
                    <span className="text-gray-300">{run.pace}/mi</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Running Shoes */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Shoe className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Running Shoes</h2>
            </div>
            <div className="mb-4">
              <h3 className="text-white font-bold mb-2">Current</h3>
              <div className="bg-yellow-500/20 rounded-lg p-3 border border-yellow-400/30">
                <p className="text-white font-medium">{runningShoes.current.brand} {runningShoes.current.model}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{runningShoes.current.miles} miles</span>
                    <span className="text-gray-400">{runningShoes.current.maxMiles} max</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${(runningShoes.current.miles / runningShoes.current.maxMiles) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2">Retired</h3>
              <div className="space-y-2">
                {runningShoes.retired.map((shoe, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-2">
                    <p className="text-gray-300 text-sm">{shoe.brand} {shoe.model}</p>
                    <p className="text-gray-500 text-xs">{shoe.miles} miles</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instagram Feed */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Instagram className="w-6 h-6 text-pink-400" />
              <h2 className="text-xl font-semibold text-white">Recent Moments</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {instagramPosts.map((post, idx) => (
                <div key={idx} className="relative group">
                  <img 
                    src={post.url}
                    alt={post.caption}
                    className="w-full aspect-square object-cover rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end p-2">
                    <p className="text-white text-xs">{post.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Last updated: {currentTime.toLocaleString()}</p>
          <button 
            onClick={fetchAllData}
            className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingDashboard;