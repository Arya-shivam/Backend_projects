// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:8001/api/v1',
    ENDPOINTS: {
        // Authentication
        REGISTER: '/users/register',
        LOGIN: '/users/login',
        LOGOUT: '/users/logout',
        REFRESH_TOKEN: '/users/refreshToken',
        CURRENT_USER: '/users/currentUser',
        
        // Videos
        VIDEOS: '/videos',
        VIDEO_BY_ID: '/videos',
        VIDEOS_BY_CATEGORY: '/videos/category',
        USER_VIDEOS: '/videos/user',
        INCREMENT_VIEWS: '/videos',
        UPLOAD_VIDEO: '/users/videos/upload',
        UPDATE_VIDEO: '/users/videos',
        DELETE_VIDEO: '/users/videos',
        LIKED_VIDEOS: '/users/videos/liked',
        
        // Channels
        CHANNELS: '/channels',
        CHANNEL_BY_HANDLE: '/channels/handle',
        USER_CHANNELS: '/users/channels',
        CREATE_CHANNEL: '/users/channels/new',
        UPDATE_CHANNEL: '/users/channels',
        DELETE_CHANNEL: '/users/channels',
        CHANNEL_ANALYTICS: '/users/channels',
        
        // Subscriptions
        SUBSCRIBE: '/subscriptions/subscribe',
        UNSUBSCRIBE: '/subscriptions/unsubscribe',
        USER_SUBSCRIPTIONS: '/subscriptions/user-subscriptions',
        CHANNEL_SUBSCRIBERS: '/subscriptions/channel-subscribers',
        SUBSCRIPTION_STATUS: '/subscriptions/status',
        SUBSCRIPTION_FEED: '/subscriptions/feed',
        
        // Search
        SEARCH_VIDEOS: '/search/videos',
        SEARCH_CHANNELS: '/search/channels',
        SEARCH_USERS: '/search/users',
        GLOBAL_SEARCH: '/search/global',
        
        // Likes
        TOGGLE_VIDEO_LIKE: '/videos',
        VIDEO_LIKES: '/videos',
        LIKE_STATUS: '/videos',
        
        // Comments
        VIDEO_COMMENTS: '/videos',
        ADD_COMMENT: '/videos',
        UPDATE_COMMENT: '/videos/comments',
        DELETE_COMMENT: '/videos/comments',
        TOGGLE_COMMENT_LIKE: '/videos/comments',
        ADD_REPLY: '/videos/comments',
        COMMENT_REPLIES: '/videos/comments',
        
        // Playlists
        CREATE_PLAYLIST: '/users/newPlaylist',
        GET_PLAYLISTS: '/users/playlists',
        USER_PLAYLISTS: '/users/playlists/user',
        PLAYLIST_VIDEOS: '/users/playlists',
        DELETE_PLAYLIST: '/users/playlists',
        ADD_TO_PLAYLIST: '/users/playlists',
        REMOVE_FROM_PLAYLIST: '/users/playlists',
        
        // User Management
        UPDATE_USER_INFO: '/users/updateUserInfo',
        CHANGE_PASSWORD: '/users/changePassword',
        UPDATE_AVATAR: '/users/updateUserAvatar',
        UPDATE_COVER: '/users/updateUserCoverImage',
        WATCH_HISTORY: '/users/watchedVideos',
        
        // Health Check
        HEALTH_CHECK: '/healthCheck'
    }
};

// App Configuration
const APP_CONFIG = {
    APP_NAME: 'VideoTube',
    VERSION: '1.0.0',
    DEFAULT_PAGE_SIZE: 12,
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    SUPPORTED_VIDEO_FORMATS: ['mp4', 'webm', 'ogg'],
    SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    VIDEO_CATEGORIES: [
        'Gaming',
        'Music',
        'Sports',
        'News',
        'Entertainment',
        'Education',
        'Technology',
        'Lifestyle',
        'Other'
    ],
    VISIBILITY_OPTIONS: [
        { value: 'public', label: 'Public' },
        { value: 'unlisted', label: 'Unlisted' },
        { value: 'private', label: 'Private' }
    ]
};

// Local Storage Keys
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'videotube_access_token',
    REFRESH_TOKEN: 'videotube_refresh_token',
    USER_DATA: 'videotube_user_data',
    THEME: 'videotube_theme',
    VOLUME: 'videotube_volume',
    PLAYBACK_SPEED: 'videotube_playback_speed'
};

// Utility Functions
const Utils = {
    // Format duration from seconds to MM:SS or HH:MM:SS
    formatDuration: (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Format view count (1234 -> 1.2K)
    formatViewCount: (count) => {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    },
    
    // Format date to relative time (2 days ago, 1 week ago, etc.)
    formatRelativeTime: (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ];
        
        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }
        
        return 'Just now';
    },
    
    // Validate file type and size
    validateFile: (file, type = 'video') => {
        const maxSize = APP_CONFIG.MAX_FILE_SIZE;
        const allowedFormats = type === 'video' 
            ? APP_CONFIG.SUPPORTED_VIDEO_FORMATS 
            : APP_CONFIG.SUPPORTED_IMAGE_FORMATS;
        
        if (file.size > maxSize) {
            return { valid: false, error: 'File size too large' };
        }
        
        const extension = file.name.split('.').pop().toLowerCase();
        if (!allowedFormats.includes(extension)) {
            return { valid: false, error: 'Unsupported file format' };
        }
        
        return { valid: true };
    },
    
    // Generate thumbnail from video file
    generateVideoThumbnail: (videoFile) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            video.addEventListener('loadedmetadata', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                video.currentTime = Math.min(5, video.duration / 2); // Seek to 5 seconds or middle
            });
            
            video.addEventListener('seeked', () => {
                ctx.drawImage(video, 0, 0);
                canvas.toBlob(resolve, 'image/jpeg', 0.8);
            });
            
            video.addEventListener('error', reject);
            video.src = URL.createObjectURL(videoFile);
        });
    },
    
    // Debounce function for search
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Copy text to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    },
    
    // Generate random ID
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    }
};

// Export for use in other modules
window.API_CONFIG = API_CONFIG;
window.APP_CONFIG = APP_CONFIG;
window.STORAGE_KEYS = STORAGE_KEYS;
window.Utils = Utils;
