// UI Module for VideoTube
class UIManager {
    constructor() {
        this.currentPage = 'home';
        this.currentVideo = null;
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupModals();
        this.setupSidebar();
    }

    // Setup event listeners
    setupEventListeners() {
        // Menu toggle
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Search
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => this.performSearch());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                const category = item.dataset.category;
                
                if (page) {
                    this.showPage(page);
                } else if (category) {
                    this.showCategoryVideos(category);
                }
            });
        });

        // User menu
        const userAvatar = document.getElementById('userAvatar');
        const userDropdown = document.getElementById('userDropdown');
        if (userAvatar && userDropdown) {
            userAvatar.addEventListener('click', () => {
                userDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
        }

        // Auth buttons
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showModal('loginModal'));
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.authManager.logout();
                this.showToast('Logged out successfully', 'success');
            });
        }

        // Upload button
        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                if (window.authManager.isAuthenticated()) {
                    this.showModal('uploadModal');
                } else {
                    this.showModal('loginModal');
                }
            });
        }
    }

    // Setup modals
    setupModals() {
        // Login modal
        this.setupLoginModal();
        
        // Register modal
        this.setupRegisterModal();
        
        // Upload modal
        this.setupUploadModal();

        // Close modals when clicking outside
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Close buttons
        const closeButtons = document.querySelectorAll('.close-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    // Setup login modal
    setupLoginModal() {
        const loginForm = document.getElementById('loginForm');
        const showRegisterModal = document.getElementById('showRegisterModal');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                
                try {
                    this.showLoading('Signing in...');
                    await window.authManager.login({ email, password });
                    this.hideModal('loginModal');
                    this.showToast('Logged in successfully!', 'success');
                    loginForm.reset();
                } catch (error) {
                    this.showToast(error.message, 'error');
                } finally {
                    this.hideLoading();
                }
            });
        }
        
        if (showRegisterModal) {
            showRegisterModal.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('loginModal');
                this.showModal('registerModal');
            });
        }
    }

    // Setup register modal
    setupRegisterModal() {
        const registerForm = document.getElementById('registerForm');
        const showLoginModal = document.getElementById('showLoginModal');
        
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = {
                    fullname: document.getElementById('registerFullName').value,
                    username: document.getElementById('registerUsername').value,
                    email: document.getElementById('registerEmail').value,
                    password: document.getElementById('registerPassword').value
                };
                
                const avatarFile = document.getElementById('registerAvatar').files[0];
                
                try {
                    this.showLoading('Creating account...');
                    await window.authManager.register(formData, avatarFile);
                    this.hideModal('registerModal');
                    this.showToast('Account created successfully!', 'success');
                    registerForm.reset();
                } catch (error) {
                    this.showToast(error.message, 'error');
                } finally {
                    this.hideLoading();
                }
            });
        }
        
        if (showLoginModal) {
            showLoginModal.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('registerModal');
                this.showModal('loginModal');
            });
        }
    }

    // Setup upload modal
    setupUploadModal() {
        const uploadForm = document.getElementById('uploadForm');
        
        if (uploadForm) {
            uploadForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const videoFile = document.getElementById('videoFile').files[0];
                const thumbnailFile = document.getElementById('thumbnailFile').files[0];
                
                if (!videoFile || !thumbnailFile) {
                    this.showToast('Please select both video and thumbnail files', 'error');
                    return;
                }
                
                const videoData = {
                    title: document.getElementById('videoTitle').value,
                    description: document.getElementById('videoDescription').value,
                    category: document.getElementById('videoCategory').value,
                    visibility: document.getElementById('videoVisibility').value,
                    tags: document.getElementById('videoTags').value,
                    channelId: document.getElementById('videoChannel').value
                };
                
                try {
                    this.showLoading('Uploading video...');
                    await window.apiClient.uploadVideo(videoData, videoFile, thumbnailFile);
                    this.hideModal('uploadModal');
                    this.showToast('Video uploaded successfully!', 'success');
                    uploadForm.reset();
                } catch (error) {
                    this.showToast(error.message, 'error');
                } finally {
                    this.hideLoading();
                }
            });
        }

        // Load user channels when modal opens
        const uploadModal = document.getElementById('uploadModal');
        if (uploadModal) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (uploadModal.classList.contains('show')) {
                            this.loadUserChannels();
                        }
                    }
                });
            });
            observer.observe(uploadModal, { attributes: true });
        }
    }

    // Setup sidebar
    setupSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        // Handle responsive sidebar
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
            } else {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('expanded');
            }
        };
        
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
    }

    // Toggle sidebar
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }

    // Show modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    // Hide modal
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // Show page
    showPage(pageId) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });
        
        // Show selected page
        const targetPage = document.getElementById(`${pageId}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
            targetPage.style.display = 'block';
        }
        
        // Update navigation
        this.updateNavigation(pageId);
        this.currentPage = pageId;
        
        // Load page content
        this.loadPageContent(pageId);
    }

    // Update navigation active state
    updateNavigation(activePageId) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === activePageId) {
                item.classList.add('active');
            }
        });
    }

    // Load page content
    async loadPageContent(pageId) {
        switch (pageId) {
            case 'home':
                await this.loadHomeVideos();
                break;
            case 'trending':
                await this.loadTrendingVideos();
                break;
            case 'subscriptions':
                await this.loadSubscriptionFeed();
                break;
            case 'history':
                await this.loadWatchHistory();
                break;
            case 'liked':
                await this.loadLikedVideos();
                break;
            case 'playlists':
                await this.loadUserPlaylists();
                break;
        }
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Show loading state
    showLoading(message = 'Loading...') {
        this.isLoading = true;
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'flex';
            const loadingText = loading.querySelector('span');
            if (loadingText) {
                loadingText.textContent = message;
            }
        }
    }

    // Hide loading state
    hideLoading() {
        this.isLoading = false;
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    // Placeholder methods for content loading (to be implemented)
    async loadHomeVideos() {
        // Will be implemented in video.js
        if (window.videoManager) {
            await window.videoManager.loadHomeVideos();
        }
    }

    async loadTrendingVideos() {
        // Will be implemented in video.js
        if (window.videoManager) {
            await window.videoManager.loadTrendingVideos();
        }
    }

    async loadSubscriptionFeed() {
        // Will be implemented in video.js
        if (window.videoManager) {
            await window.videoManager.loadSubscriptionFeed();
        }
    }

    async loadWatchHistory() {
        // Will be implemented in video.js
        if (window.videoManager) {
            await window.videoManager.loadWatchHistory();
        }
    }

    async loadLikedVideos() {
        // Will be implemented in video.js
        if (window.videoManager) {
            await window.videoManager.loadLikedVideos();
        }
    }

    async loadUserPlaylists() {
        // Will be implemented in video.js
        if (window.videoManager) {
            await window.videoManager.loadUserPlaylists();
        }
    }

    async loadUserChannels() {
        try {
            const response = await window.apiClient.getUserChannels();
            const channelSelect = document.getElementById('videoChannel');
            
            if (channelSelect && response.data) {
                channelSelect.innerHTML = '';
                response.data.forEach(channel => {
                    const option = document.createElement('option');
                    option.value = channel._id;
                    option.textContent = channel.name;
                    channelSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load user channels:', error);
        }
    }

    async performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();
        
        if (!query) return;
        
        // Show search page and perform search
        this.showPage('search');
        if (window.searchManager) {
            await window.searchManager.performSearch(query);
        }
    }

    async showCategoryVideos(category) {
        this.showPage('home');
        if (window.videoManager) {
            await window.videoManager.loadVideosByCategory(category);
        }
    }
}

// Initialize UI manager
window.uiManager = new UIManager();
