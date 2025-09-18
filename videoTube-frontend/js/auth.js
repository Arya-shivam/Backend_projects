// Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        this.refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        this.init();
    }

    async init() {
        if (this.accessToken) {
            try {
                await this.getCurrentUser();
                this.updateUI();
            } catch (error) {
                console.error('Failed to get current user:', error);
                this.logout();
            }
        } else {
            this.updateUI();
        }
    }

    // Get authentication headers
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
        };
    }

    // Register new user
    async register(userData, avatarFile = null, coverFile = null) {
        try {
            const formData = new FormData();
            formData.append('fullname', userData.fullname);
            formData.append('username', userData.username);
            formData.append('email', userData.email);
            formData.append('password', userData.password);
            
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }
            if (coverFile) {
                formData.append('coverImage', coverFile);
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Auto-login after successful registration
            await this.login({ email: userData.email, password: userData.password });
            
            return data.Data || data.data || data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Login user
    async login(credentials) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store tokens and user data
            console.log('Login response:', data); // Debug log

            // Handle different response structures
            const userData = data.Data || data.data || data;

            // Tokens are in HTTP-only cookies, so we extract them or use from response
            this.accessToken = userData.accesstoken || this.extractTokenFromCookies('accesstoken');
            this.refreshToken = userData.refreshtoken || userData.refreshToken || this.extractTokenFromCookies('refreshtoken');
            this.currentUser = userData;

            if (this.accessToken) {
                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, this.accessToken);
            }
            if (this.refreshToken) {
                localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken);
            }
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(this.currentUser));

            this.updateUI();
            return userData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Logout user
    async logout() {
        try {
            if (this.accessToken) {
                await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    credentials: 'include'
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage and reset state
            this.accessToken = null;
            this.refreshToken = null;
            this.currentUser = null;
            
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            
            this.updateUI();
            
            // Redirect to home page
            if (window.app) {
                window.app.showPage('home');
            }
        }
    }

    // Get current user data
    async getCurrentUser() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CURRENT_USER}`, {
                headers: this.getAuthHeaders(),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get user data');
            }

            // Handle different response structures
            const userData = data.Data || data.data || data;
            this.currentUser = userData;
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(this.currentUser));

            return userData;
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    }

    // Refresh access token
    async refreshAccessToken() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH_TOKEN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken
                }),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Token refresh failed');
            }

            // Handle different response structures
            const tokenData = data.Data || data.data || data;
            this.accessToken = tokenData.accesstoken;
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, this.accessToken);
            
            return this.accessToken;
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            throw error;
        }
    }

    // Extract token from cookies (fallback)
    extractTokenFromCookies(tokenName) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === tokenName) {
                return value;
            }
        }
        return null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.accessToken && !!this.currentUser;
    }

    // Update UI based on authentication state
    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const userInfo = document.getElementById('userInfo');
        const userFullName = document.getElementById('userFullName');
        const userEmail = document.getElementById('userEmail');
        const userAvatarImg = document.getElementById('userAvatarImg');
        const uploadBtn = document.getElementById('uploadBtn');
        const addCommentSection = document.getElementById('addCommentSection');

        if (this.isAuthenticated()) {
            // Show authenticated UI
            if (loginBtn) loginBtn.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            if (uploadBtn) uploadBtn.style.display = 'block';
            if (addCommentSection) addCommentSection.style.display = 'block';
            
            // Update user info
            if (userInfo && this.currentUser) {
                userInfo.style.display = 'block';
                if (userFullName) userFullName.textContent = this.currentUser.fullname || '';
                if (userEmail) userEmail.textContent = this.currentUser.email || '';
                if (userAvatarImg && this.currentUser.avatar) {
                    userAvatarImg.src = this.currentUser.avatar;
                    userAvatarImg.style.display = 'block';
                }
            }
        } else {
            // Show unauthenticated UI
            if (loginBtn) loginBtn.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
            if (uploadBtn) uploadBtn.style.display = 'none';
            if (addCommentSection) addCommentSection.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
        }
    }

    // Make authenticated API request with automatic token refresh
    async makeAuthenticatedRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getAuthHeaders(),
                    ...options.headers
                },
                credentials: 'include'
            });

            // If token expired, try to refresh
            if (response.status === 401 && this.refreshToken) {
                await this.refreshAccessToken();
                
                // Retry the request with new token
                return fetch(url, {
                    ...options,
                    headers: {
                        ...this.getAuthHeaders(),
                        ...options.headers
                    },
                    credentials: 'include'
                });
            }

            return response;
        } catch (error) {
            console.error('Authenticated request error:', error);
            throw error;
        }
    }
}

// Initialize auth manager
window.authManager = new AuthManager();
