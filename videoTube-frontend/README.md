# VideoTube Frontend

A modern, responsive YouTube-like video platform frontend built with vanilla HTML, CSS, and JavaScript.

## Features

### 🎥 Video Management
- **Video Player**: Custom video player with standard controls
- **Video Upload**: Upload videos with thumbnails, metadata, and categorization
- **Video Discovery**: Browse videos by categories, trending, and recommendations
- **Video Interactions**: Like, comment, share, and save videos

### 👤 User Authentication
- **Sign Up/Sign In**: Complete user registration and authentication
- **User Profiles**: Manage user information and avatars
- **Session Management**: Secure token-based authentication with auto-refresh

### 📺 Channel System
- **Multi-Channel Support**: Users can create and manage multiple channels
- **Channel Pages**: Dedicated pages for each channel with videos and info
- **Subscriptions**: Subscribe to channels and get personalized feed

### 🔍 Search & Discovery
- **Global Search**: Search across videos, channels, and users
- **Advanced Filters**: Filter by category, upload date, and relevance
- **Search Suggestions**: Real-time search suggestions (coming soon)

### 💬 Social Features
- **Comments System**: Add, edit, delete comments and replies
- **Likes System**: Like videos and comments
- **Playlists**: Create and manage video playlists
- **Watch History**: Track and view watch history

### 📱 Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Great experience on tablets
- **Desktop**: Full-featured desktop experience
- **Dark Theme**: Modern dark theme throughout

## Technology Stack

- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Flexbox, Grid, animations, and responsive design
- **Vanilla JavaScript**: ES6+ features, modules, and modern APIs
- **Font Awesome**: Icons and visual elements
- **No Frameworks**: Pure web technologies for maximum performance

## Project Structure

```
videoTube-frontend/
├── index.html              # Main HTML file
├── css/
│   ├── style.css          # Main styles and layout
│   └── components.css     # Component-specific styles
├── js/
│   ├── config.js          # Configuration and constants
│   ├── auth.js            # Authentication management
│   ├── api.js             # API client and requests
│   ├── ui.js              # UI management and interactions
│   ├── video.js           # Video player and management
│   ├── search.js          # Search functionality
│   └── app.js             # Main application controller
├── assets/
│   └── images/            # Static images and assets
└── README.md              # This file
```

## Getting Started

### Prerequisites

1. **Backend Server**: Make sure the VideoTube backend is running on `http://localhost:8001`
2. **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
3. **Web Server**: Any local web server (Live Server, Python HTTP server, etc.)

### Installation

1. **Clone or download** the frontend files to your local machine

2. **Start a local web server** in the project directory:

   ```bash
   # Using Python 3
   python -m http.server 3000
   
   # Using Python 2
   python -m SimpleHTTPServer 3000
   
   # Using Node.js (if you have http-server installed)
   npx http-server -p 3000
   
   # Using PHP
   php -S localhost:3000
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

### Configuration

The frontend is configured to connect to the backend at `http://localhost:8001`. If your backend is running on a different port or domain, update the `BASE_URL` in `js/config.js`:

```javascript
const API_CONFIG = {
    BASE_URL: 'http://your-backend-url:port/api/v1',
    // ... rest of config
};
```

## Usage

### First Time Setup

1. **Open the application** in your browser
2. **Create an account** by clicking "Sign In" → "Sign up"
3. **Create a channel** to start uploading videos
4. **Upload your first video** using the upload button (camera icon)

### Key Features

#### Video Upload
1. Click the camera icon in the top navigation
2. Select video file and thumbnail image
3. Fill in title, description, category, and tags
4. Choose visibility (public, unlisted, private)
5. Select which channel to upload to
6. Click "Upload Video"

#### Search
1. Use the search bar in the top navigation
2. Filter results by Videos, Channels, or Users
3. Click on any result to view

#### Video Player
1. Click on any video thumbnail to play
2. Use keyboard shortcuts:
   - `Space`: Play/Pause
   - `F`: Fullscreen
   - `M`: Mute/Unmute
   - `←/→`: Seek backward/forward 10 seconds
   - `↑/↓`: Volume up/down
   - `/`: Focus search
   - `Esc`: Exit fullscreen/close modals

#### Subscriptions
1. Visit any channel page
2. Click "Subscribe" button
3. View subscription feed from the sidebar

## API Integration

The frontend integrates with the VideoTube backend API:

- **Authentication**: JWT-based with automatic token refresh
- **File Uploads**: Multipart form data for videos and images
- **Real-time Updates**: Automatic UI updates after API calls
- **Error Handling**: Comprehensive error handling with user feedback

## Browser Support

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

## Performance Features

- **Lazy Loading**: Images and videos load on demand
- **Infinite Scroll**: Automatic loading of more content
- **Debounced Search**: Optimized search with request debouncing
- **Responsive Images**: Optimized images for different screen sizes
- **Minimal Dependencies**: Fast loading with no external frameworks

## Security Features

- **XSS Protection**: Input sanitization and safe DOM manipulation
- **CSRF Protection**: Secure API requests with proper headers
- **Secure Authentication**: Token-based auth with automatic refresh
- **Input Validation**: Client-side validation for all forms

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **High Contrast**: Dark theme with good contrast ratios
- **Focus Management**: Proper focus handling for modals and navigation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the browser console for errors
2. Ensure the backend is running and accessible
3. Verify your browser supports modern JavaScript features
4. Check network connectivity and CORS settings
