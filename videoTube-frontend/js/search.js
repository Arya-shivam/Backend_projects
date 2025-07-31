// Search Module for VideoTube
class SearchManager {
    constructor() {
        this.currentQuery = '';
        this.currentFilter = 'all';
        this.currentPage = 1;
        this.hasMoreResults = true;
        this.isLoading = false;
        this.searchResults = {
            videos: [],
            channels: [],
            users: []
        };
        this.init();
    }

    init() {
        this.setupSearchFilters();
        this.setupInfiniteScroll();
    }

    // Setup search filters
    setupSearchFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active filter
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentFilter = btn.dataset.type;
                this.currentPage = 1;
                this.hasMoreResults = true;
                
                // Perform search with new filter
                if (this.currentQuery) {
                    this.performSearch(this.currentQuery);
                }
            });
        });
    }

    // Setup infinite scroll for search results
    setupInfiniteScroll() {
        window.addEventListener('scroll', Utils.debounce(() => {
            if (this.shouldLoadMoreResults()) {
                this.loadMoreResults();
            }
        }, 200));
    }

    // Check if should load more search results
    shouldLoadMoreResults() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        return (scrollTop + windowHeight >= documentHeight - 1000) && 
               this.hasMoreResults && 
               !this.isLoading &&
               window.uiManager.currentPage === 'search' &&
               this.currentQuery;
    }

    // Perform search
    async performSearch(query) {
        if (!query.trim()) return;
        
        this.currentQuery = query.trim();
        this.currentPage = 1;
        this.hasMoreResults = true;
        
        try {
            window.uiManager.showLoading('Searching...');
            
            let response;
            
            switch (this.currentFilter) {
                case 'videos':
                    response = await window.apiClient.searchVideos(this.currentQuery, this.currentPage, 12);
                    this.searchResults.videos = response.data.videos || [];
                    this.renderVideoResults(this.searchResults.videos);
                    this.hasMoreResults = this.currentPage < response.data.totalPages;
                    break;
                    
                case 'channels':
                    response = await window.apiClient.searchChannels(this.currentQuery, this.currentPage, 12);
                    this.searchResults.channels = response.data.channels || [];
                    this.renderChannelResults(this.searchResults.channels);
                    this.hasMoreResults = this.currentPage < response.data.totalPages;
                    break;
                    
                case 'users':
                    response = await window.apiClient.searchUsers(this.currentQuery, this.currentPage, 12);
                    this.searchResults.users = response.data.users || [];
                    this.renderUserResults(this.searchResults.users);
                    this.hasMoreResults = this.currentPage < response.data.totalPages;
                    break;
                    
                case 'all':
                default:
                    response = await window.apiClient.globalSearch(this.currentQuery, this.currentPage, 5);
                    this.searchResults = {
                        videos: response.data.videos || [],
                        channels: response.data.channels || [],
                        users: response.data.users || []
                    };
                    this.renderAllResults(this.searchResults);
                    this.hasMoreResults = false; // Global search doesn't support pagination
                    break;
            }
            
        } catch (error) {
            console.error('Search failed:', error);
            window.uiManager.showToast('Search failed', 'error');
            this.renderEmptyResults();
        } finally {
            window.uiManager.hideLoading();
        }
    }

    // Load more search results
    async loadMoreResults() {
        if (this.isLoading || !this.hasMoreResults || this.currentFilter === 'all') return;
        
        try {
            this.isLoading = true;
            this.currentPage++;
            
            let response;
            
            switch (this.currentFilter) {
                case 'videos':
                    response = await window.apiClient.searchVideos(this.currentQuery, this.currentPage, 12);
                    const newVideos = response.data.videos || [];
                    this.searchResults.videos = [...this.searchResults.videos, ...newVideos];
                    this.appendVideoResults(newVideos);
                    this.hasMoreResults = this.currentPage < response.data.totalPages;
                    break;
                    
                case 'channels':
                    response = await window.apiClient.searchChannels(this.currentQuery, this.currentPage, 12);
                    const newChannels = response.data.channels || [];
                    this.searchResults.channels = [...this.searchResults.channels, ...newChannels];
                    this.appendChannelResults(newChannels);
                    this.hasMoreResults = this.currentPage < response.data.totalPages;
                    break;
                    
                case 'users':
                    response = await window.apiClient.searchUsers(this.currentQuery, this.currentPage, 12);
                    const newUsers = response.data.users || [];
                    this.searchResults.users = [...this.searchResults.users, ...newUsers];
                    this.appendUserResults(newUsers);
                    this.hasMoreResults = this.currentPage < response.data.totalPages;
                    break;
            }
            
        } catch (error) {
            console.error('Failed to load more results:', error);
            this.currentPage--; // Revert page increment
        } finally {
            this.isLoading = false;
        }
    }

    // Render all search results (global search)
    renderAllResults(results) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        searchResults.innerHTML = '';
        
        // Add videos section
        if (results.videos.length > 0) {
            const videosSection = this.createResultsSection('Videos', results.videos, 'video');
            searchResults.appendChild(videosSection);
        }
        
        // Add channels section
        if (results.channels.length > 0) {
            const channelsSection = this.createResultsSection('Channels', results.channels, 'channel');
            searchResults.appendChild(channelsSection);
        }
        
        // Add users section
        if (results.users.length > 0) {
            const usersSection = this.createResultsSection('Users', results.users, 'user');
            searchResults.appendChild(usersSection);
        }
        
        // Show empty state if no results
        if (results.videos.length === 0 && results.channels.length === 0 && results.users.length === 0) {
            this.renderEmptyResults();
        }
    }

    // Create results section
    createResultsSection(title, items, type) {
        const section = document.createElement('div');
        section.className = 'search-section';
        
        const header = document.createElement('h3');
        header.textContent = title;
        header.style.marginBottom = '16px';
        header.style.color = '#ffffff';
        section.appendChild(header);
        
        items.forEach(item => {
            let resultElement;
            switch (type) {
                case 'video':
                    resultElement = this.createVideoResult(item);
                    break;
                case 'channel':
                    resultElement = this.createChannelResult(item);
                    break;
                case 'user':
                    resultElement = this.createUserResult(item);
                    break;
            }
            if (resultElement) {
                section.appendChild(resultElement);
            }
        });
        
        return section;
    }

    // Render video results
    renderVideoResults(videos) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        searchResults.innerHTML = '';
        
        if (videos.length === 0) {
            this.renderEmptyResults();
            return;
        }
        
        videos.forEach(video => {
            const videoResult = this.createVideoResult(video);
            searchResults.appendChild(videoResult);
        });
    }

    // Append video results
    appendVideoResults(videos) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        videos.forEach(video => {
            const videoResult = this.createVideoResult(video);
            searchResults.appendChild(videoResult);
        });
    }

    // Create video result element
    createVideoResult(video) {
        const result = document.createElement('div');
        result.className = 'search-result-item';
        result.addEventListener('click', () => {
            if (window.videoManager) {
                window.videoManager.playVideo(video._id);
            }
        });
        
        result.innerHTML = `
            <div class="search-result-thumbnail">
                <img src="${video.thumbnail || '/assets/images/default-thumbnail.jpg'}" alt="${video.title}">
            </div>
            <div class="search-result-info">
                <h3 class="search-result-title">${video.title}</h3>
                <p class="search-result-channel">${video.channel?.name || video.owner?.username || 'Unknown Channel'}</p>
                <div class="search-result-meta">
                    <span>${Utils.formatViewCount(video.views || 0)} views</span>
                    <span>•</span>
                    <span>${Utils.formatRelativeTime(video.createdAt)}</span>
                </div>
                <p class="search-result-description">${(video.description || '').substring(0, 150)}${video.description && video.description.length > 150 ? '...' : ''}</p>
            </div>
        `;
        
        return result;
    }

    // Render channel results
    renderChannelResults(channels) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        searchResults.innerHTML = '';
        
        if (channels.length === 0) {
            this.renderEmptyResults();
            return;
        }
        
        channels.forEach(channel => {
            const channelResult = this.createChannelResult(channel);
            searchResults.appendChild(channelResult);
        });
    }

    // Append channel results
    appendChannelResults(channels) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        channels.forEach(channel => {
            const channelResult = this.createChannelResult(channel);
            searchResults.appendChild(channelResult);
        });
    }

    // Create channel result element
    createChannelResult(channel) {
        const result = document.createElement('div');
        result.className = 'search-result-item';
        
        result.innerHTML = `
            <div class="search-result-thumbnail">
                <img src="${channel.avatar || '/assets/images/default-avatar.jpg'}" alt="${channel.name}" style="border-radius: 50%;">
            </div>
            <div class="search-result-info">
                <h3 class="search-result-title">${channel.name}</h3>
                <p class="search-result-channel">@${channel.handle}</p>
                <div class="search-result-meta">
                    <span>${Utils.formatViewCount(channel.subscribersCount || 0)} subscribers</span>
                    <span>•</span>
                    <span>${channel.videosCount || 0} videos</span>
                </div>
                <p class="search-result-description">${(channel.description || '').substring(0, 150)}${channel.description && channel.description.length > 150 ? '...' : ''}</p>
            </div>
        `;
        
        return result;
    }

    // Render user results
    renderUserResults(users) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        searchResults.innerHTML = '';
        
        if (users.length === 0) {
            this.renderEmptyResults();
            return;
        }
        
        users.forEach(user => {
            const userResult = this.createUserResult(user);
            searchResults.appendChild(userResult);
        });
    }

    // Append user results
    appendUserResults(users) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        users.forEach(user => {
            const userResult = this.createUserResult(user);
            searchResults.appendChild(userResult);
        });
    }

    // Create user result element
    createUserResult(user) {
        const result = document.createElement('div');
        result.className = 'search-result-item';
        
        result.innerHTML = `
            <div class="search-result-thumbnail">
                <img src="${user.avatar || '/assets/images/default-avatar.jpg'}" alt="${user.fullname}" style="border-radius: 50%;">
            </div>
            <div class="search-result-info">
                <h3 class="search-result-title">${user.fullname}</h3>
                <p class="search-result-channel">@${user.username}</p>
                <div class="search-result-meta">
                    <span>User</span>
                </div>
            </div>
        `;
        
        return result;
    }

    // Render empty results
    renderEmptyResults() {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        searchResults.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search fa-3x"></i>
                <h3>No Results Found</h3>
                <p>Try different keywords or check your spelling</p>
            </div>
        `;
    }
}

// Initialize search manager
window.searchManager = new SearchManager();
