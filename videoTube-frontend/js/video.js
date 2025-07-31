// Video Module for VideoTube
class VideoManager {
    constructor() {
        this.currentVideos = [];
        this.currentPage = 1;
        this.hasMoreVideos = true;
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupVideoPlayer();
        this.setupInfiniteScroll();
    }

    // Setup video player
    setupVideoPlayer() {
        const videoPlayer = document.getElementById('videoPlayer');
        if (videoPlayer) {
            videoPlayer.addEventListener('loadedmetadata', () => {
                // Video loaded, can add additional controls here
            });
            
            videoPlayer.addEventListener('play', () => {
                // Track video play
                if (this.currentVideoId) {
                    this.incrementVideoViews(this.currentVideoId);
                }
            });
        }
    }

    // Setup infinite scroll
    setupInfiniteScroll() {
        window.addEventListener('scroll', Utils.debounce(() => {
            if (this.shouldLoadMore()) {
                this.loadMoreVideos();
            }
        }, 200));
    }

    // Check if should load more videos
    shouldLoadMore() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        return (scrollTop + windowHeight >= documentHeight - 1000) && 
               this.hasMoreVideos && 
               !this.isLoading &&
               window.uiManager.currentPage === 'home';
    }

    // Load home videos
    async loadHomeVideos() {
        try {
            this.currentPage = 1;
            this.hasMoreVideos = true;
            window.uiManager.showLoading('Loading videos...');
            
            const response = await window.apiClient.getVideos(this.currentPage, APP_CONFIG.DEFAULT_PAGE_SIZE);
            this.currentVideos = response.data.videos || [];
            
            this.renderVideoGrid(this.currentVideos);
            this.hasMoreVideos = this.currentPage < response.data.totalPages;
            
        } catch (error) {
            console.error('Failed to load home videos:', error);
            window.uiManager.showToast('Failed to load videos', 'error');
        } finally {
            window.uiManager.hideLoading();
        }
    }

    // Load trending videos
    async loadTrendingVideos() {
        try {
            window.uiManager.showLoading('Loading trending videos...');
            
            // For now, load videos sorted by views (trending)
            const response = await window.apiClient.getVideos(1, APP_CONFIG.DEFAULT_PAGE_SIZE);
            this.currentVideos = response.data.videos || [];
            
            // Sort by views for trending effect
            this.currentVideos.sort((a, b) => (b.views || 0) - (a.views || 0));
            
            this.renderVideoGrid(this.currentVideos);
            
        } catch (error) {
            console.error('Failed to load trending videos:', error);
            window.uiManager.showToast('Failed to load trending videos', 'error');
        } finally {
            window.uiManager.hideLoading();
        }
    }

    // Load subscription feed
    async loadSubscriptionFeed() {
        if (!window.authManager.isAuthenticated()) {
            this.renderEmptyState('Please sign in to see your subscription feed');
            return;
        }

        try {
            window.uiManager.showLoading('Loading subscription feed...');
            
            const response = await window.apiClient.getSubscriptionFeed(1, APP_CONFIG.DEFAULT_PAGE_SIZE);
            this.currentVideos = response.data.videos || [];
            
            if (this.currentVideos.length === 0) {
                this.renderEmptyState('No videos from your subscriptions. Subscribe to channels to see their latest videos here!');
            } else {
                this.renderVideoGrid(this.currentVideos);
            }
            
        } catch (error) {
            console.error('Failed to load subscription feed:', error);
            window.uiManager.showToast('Failed to load subscription feed', 'error');
        } finally {
            window.uiManager.hideLoading();
        }
    }

    // Load watch history
    async loadWatchHistory() {
        if (!window.authManager.isAuthenticated()) {
            this.renderEmptyState('Please sign in to see your watch history');
            return;
        }

        try {
            window.uiManager.showLoading('Loading watch history...');
            
            const response = await window.apiClient.getWatchHistory(1, APP_CONFIG.DEFAULT_PAGE_SIZE);
            this.currentVideos = response.data.videos || [];
            
            if (this.currentVideos.length === 0) {
                this.renderEmptyState('No watch history yet. Start watching videos to see them here!');
            } else {
                this.renderVideoGrid(this.currentVideos);
            }
            
        } catch (error) {
            console.error('Failed to load watch history:', error);
            window.uiManager.showToast('Failed to load watch history', 'error');
        } finally {
            window.uiManager.hideLoading();
        }
    }

    // Load liked videos
    async loadLikedVideos() {
        if (!window.authManager.isAuthenticated()) {
            this.renderEmptyState('Please sign in to see your liked videos');
            return;
        }

        try {
            window.uiManager.showLoading('Loading liked videos...');
            
            const response = await window.apiClient.getLikedVideos(1, APP_CONFIG.DEFAULT_PAGE_SIZE);
            this.currentVideos = response.data.videos || [];
            
            if (this.currentVideos.length === 0) {
                this.renderEmptyState('No liked videos yet. Like videos to see them here!');
            } else {
                this.renderVideoGrid(this.currentVideos);
            }
            
        } catch (error) {
            console.error('Failed to load liked videos:', error);
            window.uiManager.showToast('Failed to load liked videos', 'error');
        } finally {
            window.uiManager.hideLoading();
        }
    }

    // Load videos by category
    async loadVideosByCategory(category) {
        try {
            this.currentPage = 1;
            this.hasMoreVideos = true;
            window.uiManager.showLoading(`Loading ${category} videos...`);
            
            const response = await window.apiClient.getVideosByCategory(category, this.currentPage, APP_CONFIG.DEFAULT_PAGE_SIZE);
            this.currentVideos = response.data.videos || [];
            
            this.renderVideoGrid(this.currentVideos);
            this.hasMoreVideos = this.currentPage < response.data.totalPages;
            
        } catch (error) {
            console.error(`Failed to load ${category} videos:`, error);
            window.uiManager.showToast(`Failed to load ${category} videos`, 'error');
        } finally {
            window.uiManager.hideLoading();
        }
    }

    // Load more videos (for infinite scroll)
    async loadMoreVideos() {
        if (this.isLoading || !this.hasMoreVideos) return;
        
        try {
            this.isLoading = true;
            this.currentPage++;
            
            const response = await window.apiClient.getVideos(this.currentPage, APP_CONFIG.DEFAULT_PAGE_SIZE);
            const newVideos = response.data.videos || [];
            
            this.currentVideos = [...this.currentVideos, ...newVideos];
            this.appendVideosToGrid(newVideos);
            
            this.hasMoreVideos = this.currentPage < response.data.totalPages;
            
        } catch (error) {
            console.error('Failed to load more videos:', error);
            this.currentPage--; // Revert page increment
        } finally {
            this.isLoading = false;
        }
    }

    // Render video grid
    renderVideoGrid(videos) {
        const videoGrid = document.getElementById('videoGrid');
        if (!videoGrid) return;
        
        videoGrid.innerHTML = '';
        
        videos.forEach(video => {
            const videoCard = this.createVideoCard(video);
            videoGrid.appendChild(videoCard);
        });
    }

    // Append videos to existing grid
    appendVideosToGrid(videos) {
        const videoGrid = document.getElementById('videoGrid');
        if (!videoGrid) return;
        
        videos.forEach(video => {
            const videoCard = this.createVideoCard(video);
            videoGrid.appendChild(videoCard);
        });
    }

    // Create video card element
    createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.addEventListener('click', () => this.playVideo(video._id));
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${video.thumbnail || '/assets/images/default-thumbnail.jpg'}" alt="${video.title}">
                <span class="video-duration">${Utils.formatDuration(video.duration || 0)}</span>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-channel">${video.channel?.name || video.owner?.username || 'Unknown Channel'}</p>
                <div class="video-meta">
                    <span>${Utils.formatViewCount(video.views || 0)} views</span>
                    <span>•</span>
                    <span>${Utils.formatRelativeTime(video.createdAt)}</span>
                </div>
            </div>
        `;
        
        return card;
    }

    // Play video
    async playVideo(videoId) {
        try {
            window.uiManager.showLoading('Loading video...');
            
            const response = await window.apiClient.getVideoById(videoId);
            const video = response.data;
            
            this.currentVideoId = videoId;
            this.renderVideoPlayer(video);
            window.uiManager.showPage('videoPlayer');
            
            // Load comments
            await this.loadVideoComments(videoId);
            
            // Check like status if authenticated
            if (window.authManager.isAuthenticated()) {
                await this.checkVideoLikeStatus(videoId);
                await this.checkSubscriptionStatus(video.channel?._id);
            }
            
        } catch (error) {
            console.error('Failed to load video:', error);
            window.uiManager.showToast('Failed to load video', 'error');
        } finally {
            window.uiManager.hideLoading();
        }
    }

    // Render video player
    renderVideoPlayer(video) {
        // Update video player
        const videoPlayer = document.getElementById('videoPlayer');
        const videoTitle = document.getElementById('videoTitle');
        const videoViews = document.getElementById('videoViews');
        const videoDate = document.getElementById('videoDate');
        const videoDescription = document.getElementById('videoDescription');
        const channelName = document.getElementById('channelName');
        const channelAvatar = document.getElementById('channelAvatar');
        const channelSubscribers = document.getElementById('channelSubscribers');
        
        if (videoPlayer) {
            videoPlayer.src = video.videoFile;
            videoPlayer.load();
        }
        
        if (videoTitle) videoTitle.textContent = video.title;
        if (videoViews) videoViews.textContent = `${Utils.formatViewCount(video.views || 0)} views`;
        if (videoDate) videoDate.textContent = Utils.formatRelativeTime(video.createdAt);
        if (videoDescription) videoDescription.textContent = video.description || '';
        if (channelName) channelName.textContent = video.channel?.name || video.owner?.username || 'Unknown Channel';
        if (channelAvatar) channelAvatar.src = video.channel?.avatar || video.owner?.avatar || '/assets/images/default-avatar.jpg';
        if (channelSubscribers) channelSubscribers.textContent = `${Utils.formatViewCount(video.channel?.subscribersCount || 0)} subscribers`;
    }

    // Increment video views
    async incrementVideoViews(videoId) {
        try {
            await window.apiClient.incrementVideoViews(videoId);
        } catch (error) {
            console.error('Failed to increment video views:', error);
        }
    }

    // Load video comments
    async loadVideoComments(videoId) {
        try {
            const response = await window.apiClient.getVideoComments(videoId, 1, 20);
            const comments = response.data.comments || [];
            
            this.renderComments(comments);
            
            const commentCount = document.getElementById('commentCount');
            if (commentCount) {
                commentCount.textContent = response.data.total || 0;
            }
            
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    }

    // Render comments
    renderComments(comments) {
        const commentsList = document.getElementById('commentsList');
        if (!commentsList) return;
        
        commentsList.innerHTML = '';
        
        comments.forEach(comment => {
            const commentElement = this.createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
    }

    // Create comment element
    createCommentElement(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        
        commentDiv.innerHTML = `
            <div class="comment-avatar">
                <img src="${comment.owner?.avatar || '/assets/images/default-avatar.jpg'}" alt="${comment.owner?.username}">
            </div>
            <div class="comment-content">
                <div class="comment-author">${comment.owner?.username || 'Anonymous'}</div>
                <div class="comment-text">${comment.content}</div>
                <div class="comment-actions-bar">
                    <button class="comment-action" onclick="videoManager.toggleCommentLike('${comment._id}')">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${comment.likesCount || 0}</span>
                    </button>
                    <button class="comment-action">
                        <i class="fas fa-reply"></i>
                        Reply
                    </button>
                </div>
            </div>
        `;
        
        return commentDiv;
    }

    // Check video like status
    async checkVideoLikeStatus(videoId) {
        try {
            const response = await window.apiClient.checkVideoLikeStatus(videoId);
            const isLiked = response.data.isLiked;
            
            const likeBtn = document.getElementById('likeBtn');
            if (likeBtn) {
                if (isLiked) {
                    likeBtn.classList.add('active');
                } else {
                    likeBtn.classList.remove('active');
                }
            }
            
        } catch (error) {
            console.error('Failed to check like status:', error);
        }
    }

    // Check subscription status
    async checkSubscriptionStatus(channelId) {
        if (!channelId) return;
        
        try {
            const response = await window.apiClient.checkSubscriptionStatus(channelId);
            const isSubscribed = response.data.isSubscribed;
            
            const subscribeBtn = document.getElementById('subscribeBtn');
            if (subscribeBtn) {
                if (isSubscribed) {
                    subscribeBtn.textContent = 'Subscribed';
                    subscribeBtn.classList.add('subscribed');
                } else {
                    subscribeBtn.textContent = 'Subscribe';
                    subscribeBtn.classList.remove('subscribed');
                }
                
                // Update click handler
                subscribeBtn.onclick = () => this.toggleSubscription(channelId, !isSubscribed);
            }
            
        } catch (error) {
            console.error('Failed to check subscription status:', error);
        }
    }

    // Toggle video like
    async toggleVideoLike(videoId) {
        if (!window.authManager.isAuthenticated()) {
            window.uiManager.showModal('loginModal');
            return;
        }
        
        try {
            await window.apiClient.toggleVideoLike(videoId);
            await this.checkVideoLikeStatus(videoId);
        } catch (error) {
            console.error('Failed to toggle like:', error);
            window.uiManager.showToast('Failed to update like', 'error');
        }
    }

    // Toggle subscription
    async toggleSubscription(channelId, subscribe) {
        if (!window.authManager.isAuthenticated()) {
            window.uiManager.showModal('loginModal');
            return;
        }
        
        try {
            if (subscribe) {
                await window.apiClient.subscribeToChannel(channelId);
                window.uiManager.showToast('Subscribed successfully!', 'success');
            } else {
                await window.apiClient.unsubscribeFromChannel(channelId);
                window.uiManager.showToast('Unsubscribed successfully!', 'success');
            }
            
            await this.checkSubscriptionStatus(channelId);
        } catch (error) {
            console.error('Failed to toggle subscription:', error);
            window.uiManager.showToast('Failed to update subscription', 'error');
        }
    }

    // Toggle comment like
    async toggleCommentLike(commentId) {
        if (!window.authManager.isAuthenticated()) {
            window.uiManager.showModal('loginModal');
            return;
        }
        
        try {
            await window.apiClient.toggleCommentLike(commentId);
            // Reload comments to update like count
            if (this.currentVideoId) {
                await this.loadVideoComments(this.currentVideoId);
            }
        } catch (error) {
            console.error('Failed to toggle comment like:', error);
            window.uiManager.showToast('Failed to update comment like', 'error');
        }
    }

    // Render empty state
    renderEmptyState(message) {
        const videoGrid = document.getElementById('videoGrid');
        if (!videoGrid) return;
        
        videoGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-video fa-3x"></i>
                <h3>No Videos Found</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // Load user playlists (placeholder)
    async loadUserPlaylists() {
        if (!window.authManager.isAuthenticated()) {
            this.renderEmptyState('Please sign in to see your playlists');
            return;
        }

        try {
            window.uiManager.showLoading('Loading playlists...');
            
            const response = await window.apiClient.getPlaylists(1, APP_CONFIG.DEFAULT_PAGE_SIZE);
            const playlists = response.data.playlists || [];
            
            if (playlists.length === 0) {
                this.renderEmptyState('No playlists yet. Create playlists to organize your videos!');
            } else {
                // Render playlists (implement playlist rendering)
                console.log('Playlists:', playlists);
            }
            
        } catch (error) {
            console.error('Failed to load playlists:', error);
            window.uiManager.showToast('Failed to load playlists', 'error');
        } finally {
            window.uiManager.hideLoading();
        }
    }
}

// Initialize video manager
window.videoManager = new VideoManager();
