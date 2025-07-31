// API Module for VideoTube
class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Authenticated request method
    async authenticatedRequest(endpoint, options = {}) {
        if (!window.authManager.isAuthenticated()) {
            throw new Error('Authentication required');
        }

        const response = await window.authManager.makeAuthenticatedRequest(`${this.baseURL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    }

    // Video API methods
    async getVideos(page = 1, limit = 12, category = null) {
        let endpoint = `${API_CONFIG.ENDPOINTS.VIDEOS}?page=${page}&limit=${limit}`;
        if (category) {
            endpoint += `&category=${category}`;
        }
        return this.request(endpoint);
    }

    async getVideoById(videoId) {
        return this.request(`${API_CONFIG.ENDPOINTS.VIDEO_BY_ID}/${videoId}`);
    }

    async getVideosByCategory(category, page = 1, limit = 12) {
        return this.request(`${API_CONFIG.ENDPOINTS.VIDEOS_BY_CATEGORY}/${category}?page=${page}&limit=${limit}`);
    }

    async getUserVideos(userId, page = 1, limit = 12) {
        return this.request(`${API_CONFIG.ENDPOINTS.USER_VIDEOS}/${userId}?page=${page}&limit=${limit}`);
    }

    async incrementVideoViews(videoId) {
        return this.request(`${API_CONFIG.ENDPOINTS.INCREMENT_VIEWS}/${videoId}/view`, {
            method: 'POST'
        });
    }

    async uploadVideo(videoData, videoFile, thumbnailFile) {
        const formData = new FormData();
        formData.append('title', videoData.title);
        formData.append('description', videoData.description);
        formData.append('category', videoData.category);
        formData.append('visibility', videoData.visibility);
        formData.append('tags', videoData.tags);
        formData.append('channelId', videoData.channelId);
        formData.append('videoFile', videoFile);
        formData.append('thumbnail', thumbnailFile);

        return this.authenticatedRequest(API_CONFIG.ENDPOINTS.UPLOAD_VIDEO, {
            method: 'POST',
            headers: {}, // Remove Content-Type to let browser set it for FormData
            body: formData
        });
    }

    async updateVideo(videoId, updateData) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.UPDATE_VIDEO}/${videoId}/update`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    async deleteVideo(videoId) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.DELETE_VIDEO}/${videoId}/delete`, {
            method: 'DELETE'
        });
    }

    async getLikedVideos(page = 1, limit = 12) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.LIKED_VIDEOS}?page=${page}&limit=${limit}`);
    }

    // Channel API methods
    async getChannelById(channelId) {
        return this.request(`${API_CONFIG.ENDPOINTS.CHANNELS}/${channelId}`);
    }

    async getChannelByHandle(handle) {
        return this.request(`${API_CONFIG.ENDPOINTS.CHANNEL_BY_HANDLE}/${handle}`);
    }

    async getUserChannels() {
        return this.authenticatedRequest(API_CONFIG.ENDPOINTS.USER_CHANNELS);
    }

    async createChannel(channelData) {
        return this.authenticatedRequest(API_CONFIG.ENDPOINTS.CREATE_CHANNEL, {
            method: 'POST',
            body: JSON.stringify(channelData)
        });
    }

    async updateChannel(channelId, updateData) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.UPDATE_CHANNEL}/${channelId}/update`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    async deleteChannel(channelId) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.DELETE_CHANNEL}/${channelId}/delete`, {
            method: 'DELETE'
        });
    }

    async getChannelAnalytics(channelId) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.CHANNEL_ANALYTICS}/${channelId}/analytics`);
    }

    // Subscription API methods
    async subscribeToChannel(channelId) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.SUBSCRIBE}/${channelId}`, {
            method: 'POST'
        });
    }

    async unsubscribeFromChannel(channelId) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.UNSUBSCRIBE}/${channelId}`, {
            method: 'DELETE'
        });
    }

    async getUserSubscriptions(page = 1, limit = 12) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.USER_SUBSCRIPTIONS}?page=${page}&limit=${limit}`);
    }

    async getChannelSubscribers(channelId, page = 1, limit = 12) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.CHANNEL_SUBSCRIBERS}/${channelId}?page=${page}&limit=${limit}`);
    }

    async checkSubscriptionStatus(channelId) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.SUBSCRIPTION_STATUS}/${channelId}`);
    }

    async getSubscriptionFeed(page = 1, limit = 12) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.SUBSCRIPTION_FEED}?page=${page}&limit=${limit}`);
    }

    // Search API methods
    async searchVideos(query, page = 1, limit = 12, category = null, sortBy = 'relevance') {
        let endpoint = `${API_CONFIG.ENDPOINTS.SEARCH_VIDEOS}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}&sortBy=${sortBy}`;
        if (category) {
            endpoint += `&category=${category}`;
        }
        return this.request(endpoint);
    }

    async searchChannels(query, page = 1, limit = 12) {
        return this.request(`${API_CONFIG.ENDPOINTS.SEARCH_CHANNELS}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    }

    async searchUsers(query, page = 1, limit = 12) {
        return this.request(`${API_CONFIG.ENDPOINTS.SEARCH_USERS}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    }

    async globalSearch(query, page = 1, limit = 5) {
        return this.request(`${API_CONFIG.ENDPOINTS.GLOBAL_SEARCH}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    }

    // Like API methods
    async toggleVideoLike(videoId) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.TOGGLE_VIDEO_LIKE}/${videoId}/like`, {
            method: 'POST'
        });
    }

    async getVideoLikes(videoId, page = 1, limit = 20) {
        return this.request(`${API_CONFIG.ENDPOINTS.VIDEO_LIKES}/${videoId}/likes?page=${page}&limit=${limit}`);
    }

    async checkVideoLikeStatus(videoId) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.LIKE_STATUS}/${videoId}/like-status`);
    }

    // Comment API methods
    async getVideoComments(videoId, page = 1, limit = 10) {
        return this.request(`${API_CONFIG.ENDPOINTS.VIDEO_COMMENTS}/${videoId}/comments?page=${page}&limit=${limit}`);
    }

    async addComment(videoId, content) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.ADD_COMMENT}/${videoId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }

    async updateComment(commentId, content) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.UPDATE_COMMENT}/${commentId}/update`, {
            method: 'PUT',
            body: JSON.stringify({ content })
        });
    }

    async deleteComment(commentId) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.DELETE_COMMENT}/${commentId}/delete`, {
            method: 'DELETE'
        });
    }

    async toggleCommentLike(commentId) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.TOGGLE_COMMENT_LIKE}/${commentId}/like`, {
            method: 'POST'
        });
    }

    async addReply(commentId, content) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.ADD_REPLY}/${commentId}/reply`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }

    async getCommentReplies(commentId, page = 1, limit = 5) {
        return this.request(`${API_CONFIG.ENDPOINTS.COMMENT_REPLIES}/${commentId}/replies?page=${page}&limit=${limit}`);
    }

    // Playlist API methods
    async createPlaylist(name, description, isPublic = true) {
        return this.authenticatedRequest(API_CONFIG.ENDPOINTS.CREATE_PLAYLIST, {
            method: 'POST',
            body: JSON.stringify({ name, description, isPublic })
        });
    }

    async getPlaylists(page = 1, limit = 12) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.GET_PLAYLISTS}?page=${page}&limit=${limit}`);
    }

    async getUserPlaylists(userId, page = 1, limit = 12) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.USER_PLAYLISTS}/${userId}?page=${page}&limit=${limit}`);
    }

    async getPlaylistVideos(playlistId, page = 1, limit = 12) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.PLAYLIST_VIDEOS}/${playlistId}?page=${page}&limit=${limit}`);
    }

    async deletePlaylist(playlistId) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.DELETE_PLAYLIST}/${playlistId}/delete`, {
            method: 'DELETE'
        });
    }

    async addVideoToPlaylist(playlistId, videoId) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.ADD_TO_PLAYLIST}/${playlistId}/add-video`, {
            method: 'POST',
            body: JSON.stringify({ videoId })
        });
    }

    async removeVideoFromPlaylist(playlistId, videoId) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.REMOVE_FROM_PLAYLIST}/${playlistId}/remove-video/${videoId}`, {
            method: 'DELETE'
        });
    }

    // User management API methods
    async updateUserInfo(updateData) {
        return this.authenticatedRequest(API_CONFIG.ENDPOINTS.UPDATE_USER_INFO, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    async changePassword(currentPassword, newPassword) {
        return this.authenticatedRequest(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    async updateUserAvatar(avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        return this.authenticatedRequest(API_CONFIG.ENDPOINTS.UPDATE_AVATAR, {
            method: 'PUT',
            headers: {}, // Remove Content-Type for FormData
            body: formData
        });
    }

    async getWatchHistory(page = 1, limit = 12) {
        return this.authenticatedRequest(`${API_CONFIG.ENDPOINTS.WATCH_HISTORY}?page=${page}&limit=${limit}`);
    }

    // Health check
    async healthCheck() {
        return this.request(API_CONFIG.ENDPOINTS.HEALTH_CHECK);
    }
}

// Initialize API client
window.apiClient = new APIClient();
