// Main App Module for VideoTube
class VideoTubeApp {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showErrorState();
        }
    }

    async initializeApp() {
        try {
            // Initialize components in order
            await this.initializeAuth();
            this.initializeUI();
            this.initializeVideoPlayer();
            this.initializeSearch();
            this.setupGlobalEventListeners();
            this.setupKeyboardShortcuts();
            
            // Load initial content
            await this.loadInitialContent();
            
            // Setup periodic tasks
            this.setupPeriodicTasks();
            
            this.isInitialized = true;
            console.log('VideoTube app initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showErrorState();
        }
    }

    async initializeAuth() {
        // Auth manager is already initialized in auth.js
        // Just wait for it to complete initialization
        if (window.authManager) {
            await window.authManager.init();
        }
    }

    initializeUI() {
        // UI manager is already initialized in ui.js
        // Setup additional UI components
        this.setupVideoPlayerControls();
        this.setupCommentSystem();
        this.setupNotifications();
    }

    initializeVideoPlayer() {
        // Video manager is already initialized in video.js
        // Setup additional video player features
        this.setupVideoPlayerEvents();
        this.setupPlaybackControls();
    }

    initializeSearch() {
        // Search manager is already initialized in search.js
        // Setup search suggestions and autocomplete
        this.setupSearchSuggestions();
    }

    setupGlobalEventListeners() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            this.handleRouteChange(e.state);
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            window.uiManager.showToast('Connection restored', 'success');
        });

        window.addEventListener('offline', () => {
            window.uiManager.showToast('Connection lost', 'error');
        });

        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseVideoIfPlaying();
            }
        });

        // Handle errors
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.handleGlobalError(e.error);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.handleGlobalError(e.reason);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    this.toggleVideoPlayback();
                    break;
                case 'f':
                case 'F':
                    this.toggleFullscreen();
                    break;
                case 'm':
                case 'M':
                    this.toggleMute();
                    break;
                case 'ArrowLeft':
                    this.seekVideo(-10);
                    break;
                case 'ArrowRight':
                    this.seekVideo(10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.adjustVolume(0.1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.adjustVolume(-0.1);
                    break;
                case '/':
                    e.preventDefault();
                    this.focusSearchInput();
                    break;
                case 'Escape':
                    this.handleEscapeKey();
                    break;
            }
        });
    }

    setupVideoPlayerControls() {
        const likeBtn = document.getElementById('likeBtn');
        const shareBtn = document.getElementById('shareBtn');
        const saveBtn = document.getElementById('saveBtn');

        if (likeBtn) {
            likeBtn.addEventListener('click', () => {
                if (window.videoManager && window.videoManager.currentVideoId) {
                    window.videoManager.toggleVideoLike(window.videoManager.currentVideoId);
                }
            });
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareCurrentVideo();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.showSaveToPlaylistModal();
            });
        }
    }

    setupCommentSystem() {
        const commentInput = document.getElementById('commentInput');
        const submitCommentBtn = document.getElementById('submitCommentBtn');
        const cancelCommentBtn = document.getElementById('cancelCommentBtn');

        if (commentInput) {
            commentInput.addEventListener('focus', () => {
                if (!window.authManager.isAuthenticated()) {
                    commentInput.blur();
                    window.uiManager.showModal('loginModal');
                }
            });

            commentInput.addEventListener('input', () => {
                const hasContent = commentInput.value.trim().length > 0;
                if (submitCommentBtn) {
                    submitCommentBtn.disabled = !hasContent;
                }
            });
        }

        if (submitCommentBtn) {
            submitCommentBtn.addEventListener('click', () => {
                this.submitComment();
            });
        }

        if (cancelCommentBtn) {
            cancelCommentBtn.addEventListener('click', () => {
                if (commentInput) {
                    commentInput.value = '';
                    commentInput.blur();
                }
            });
        }
    }

    setupNotifications() {
        // Request notification permission if supported
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    setupVideoPlayerEvents() {
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            videoPlayer.addEventListener('ended', () => {
                this.onVideoEnded();
            });

            videoPlayer.addEventListener('timeupdate', () => {
                this.onVideoTimeUpdate();
            });

            videoPlayer.addEventListener('loadstart', () => {
                window.uiManager.showLoading('Loading video...');
            });

            videoPlayer.addEventListener('canplay', () => {
                window.uiManager.hideLoading();
            });
        }
    }

    setupPlaybackControls() {
        // Additional playback controls can be added here :
        // For now, using native video controls
    }

    setupSearchSuggestions() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            // Debounced search suggestions
            const debouncedSuggestions = Utils.debounce(async (query) => {
                if (query.length >= 2) {
                    await this.loadSearchSuggestions(query);
                }
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSuggestions(e.target.value);
            });
        }
    }

    async loadInitialContent() {
        // Load home page content by default
        window.uiManager.showPage('home');
    }

    setupPeriodicTasks() {
        // Refresh auth token periodically
        setInterval(() => {
            if (window.authManager.isAuthenticated()) {
                window.authManager.refreshAccessToken().catch(() => {
                    // Token refresh failed, user will be logged out automatically
                });
            }
        }, 15 * 60 * 1000); // Every 15 minutes

        // Check for app updates periodically
        setInterval(() => {
            this.checkForUpdates();
        }, 30 * 60 * 1000); // Every 30 minutes
    }

    // Video player control methods
    toggleVideoPlayback() {
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            if (videoPlayer.paused) {
                videoPlayer.play();
            } else {
                videoPlayer.pause();
            }
        }
    }

    toggleFullscreen() {
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                videoPlayer.requestFullscreen();
            }
        }
    }

    toggleMute() {
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            videoPlayer.muted = !videoPlayer.muted;
        }
    }

    seekVideo(seconds) {
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            videoPlayer.currentTime = Math.max(0, Math.min(videoPlayer.duration, videoPlayer.currentTime + seconds));
        }
    }

    adjustVolume(delta) {
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            videoPlayer.volume = Math.max(0, Math.min(1, videoPlayer.volume + delta));
        }
    }

    pauseVideoIfPlaying() {
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer && !videoPlayer.paused) {
            videoPlayer.pause();
        }
    }

    focusSearchInput() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    handleEscapeKey() {
        // Close any open modals
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            window.uiManager.hideModal(openModal.id);
            return;
        }

        // Exit fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen();
            return;
        }

        // Clear search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput && document.activeElement === searchInput) {
            searchInput.blur();
            return;
        }
    }

    // Event handlers
    onVideoEnded() {
        // Could implement autoplay next video here
        console.log('Video ended');
    }

    onVideoTimeUpdate() {
        // Could implement progress tracking here
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
            // Update progress bar if custom controls are implemented
        }
    }

    // Utility methods
    async shareCurrentVideo() {
        if (window.videoManager && window.videoManager.currentVideoId) {
            const videoUrl = `${window.location.origin}?v=${window.videoManager.currentVideoId}`;
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Check out this video on VideoTube',
                        url: videoUrl
                    });
                } catch (error) {
                    // User cancelled sharing
                }
            } else {
                // Fallback to clipboard
                try {
                    await Utils.copyToClipboard(videoUrl);
                    window.uiManager.showToast('Video link copied to clipboard!', 'success');
                } catch (error) {
                    window.uiManager.showToast('Failed to copy link', 'error');
                }
            }
        }
    }

    showSaveToPlaylistModal() {
        // Implement save to playlist functionality
        window.uiManager.showToast('Save to playlist feature coming soon!', 'info');
    }

    async submitComment() {
        const commentInput = document.getElementById('commentInput');
        if (!commentInput || !window.videoManager.currentVideoId) return;

        const content = commentInput.value.trim();
        if (!content) return;

        try {
            await window.apiClient.addComment(window.videoManager.currentVideoId, content);
            commentInput.value = '';
            window.uiManager.showToast('Comment added successfully!', 'success');
            
            // Reload comments
            await window.videoManager.loadVideoComments(window.videoManager.currentVideoId);
        } catch (error) {
            console.error('Failed to add comment:', error);
            window.uiManager.showToast('Failed to add comment', 'error');
        }
    }

    async loadSearchSuggestions(query) {
        // Implement search suggestions
        // For now, just a placeholder
        console.log('Loading search suggestions for:', query);
    }

    handleRouteChange(state) {
        // Handle browser navigation
        // For now, just a placeholder
        console.log('Route changed:', state);
    }

    handleGlobalError(error) {
        // Handle global errors gracefully
        console.error('Global error handled:', error);
        
        if (error.message && error.message.includes('Authentication')) {
            window.authManager.logout();
        }
    }

    async checkForUpdates() {
        // Check for app updates
        // For now, just a placeholder
        console.log('Checking for updates...');
    }

    showErrorState() {
        document.body.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: white; text-align: center;">
                <h1>Something went wrong</h1>
                <p>Please refresh the page to try again.</p>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #ff0000; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Refresh Page
                </button>
            </div>
        `;
    }

    // Public API methods
    showPage(pageId) {
        if (window.uiManager) {
            window.uiManager.showPage(pageId);
        }
    }

    playVideo(videoId) {
        if (window.videoManager) {
            window.videoManager.playVideo(videoId);
        }
    }

    search(query) {
        if (window.searchManager) {
            window.searchManager.performSearch(query);
        }
    }
}

// Initialize the app
window.app = new VideoTubeApp();

// Export app instance for global access
window.VideoTubeApp = VideoTubeApp;
