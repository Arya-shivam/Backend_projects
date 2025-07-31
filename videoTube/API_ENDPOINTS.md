# VideoTube Backend API Endpoints

## Base URL: `http://localhost:8001/api/v1`

## 🔐 Authentication
- **POST** `/users/register` - Register new user
- **POST** `/users/login` - Login user
- **POST** `/users/logout` - Logout user (🔒)
- **POST** `/users/refreshToken` - Refresh access token

## 👤 User Management
- **GET** `/users/currentUser` - Get current user (🔒)
- **PUT** `/users/changePassword` - Change password (🔒)
- **PUT** `/users/updateUserInfo` - Update user info (🔒)
- **PUT** `/users/updateUserAvatar` - Update avatar (🔒)
- **PUT** `/users/updateUserCoverImage` - Update cover image (🔒)
- **GET** `/users/watchedVideos` - Get watch history (🔒)

## 📺 Channel Management
- **GET** `/users/channels` - Get user's channels (🔒)
- **POST** `/users/channels/new` - Create new channel (🔒)
- **PUT** `/users/channels/:channelId/update` - Update channel (🔒)
- **PUT** `/users/channels/:channelId/avatar` - Update channel avatar (🔒)
- **PUT** `/users/channels/:channelId/banner` - Update channel banner (🔒)
- **DELETE** `/users/channels/:channelId/delete` - Delete channel (🔒)
- **GET** `/users/channels/:channelId/analytics` - Get channel analytics (🔒)

## 🎬 Video Management
- **POST** `/users/videos/upload` - Upload video (🔒)
- **PUT** `/users/videos/:videoId/update` - Update video (🔒)
- **DELETE** `/users/videos/:videoId/delete` - Delete video (🔒)
- **GET** `/users/videos/liked` - Get liked videos (🔒)

## 🎥 Video Discovery & Viewing
- **GET** `/videos/` - Get all videos (public)
- **GET** `/videos/:videoId` - Get video by ID (public)
- **GET** `/videos/category/:category` - Get videos by category (public)
- **GET** `/videos/user/:userId` - Get user's videos (public)
- **POST** `/videos/:videoId/view` - Increment video views (public)

## 👍 Likes & Interactions
- **POST** `/videos/:videoId/like` - Toggle video like (🔒)
- **GET** `/videos/:videoId/likes` - Get video likes (public)
- **GET** `/videos/:videoId/like-status` - Check like status (🔒)

## 💬 Comments
- **GET** `/videos/:videoId/comments` - Get video comments (public)
- **POST** `/videos/:videoId/comments` - Add comment (🔒)
- **PUT** `/videos/comments/:commentId/update` - Update comment (🔒)
- **DELETE** `/videos/comments/:commentId/delete` - Delete comment (🔒)
- **POST** `/videos/comments/:commentId/like` - Toggle comment like (🔒)
- **POST** `/videos/comments/:commentId/reply` - Add reply (🔒)
- **GET** `/videos/comments/:commentId/replies` - Get comment replies (public)

## 🔔 Subscriptions
- **POST** `/subscriptions/subscribe/:channelId` - Subscribe to channel (🔒)
- **DELETE** `/subscriptions/unsubscribe/:channelId` - Unsubscribe (🔒)
- **GET** `/subscriptions/user-subscriptions` - Get user subscriptions (🔒)
- **GET** `/subscriptions/channel-subscribers/:channelId` - Get channel subscribers (🔒)
- **GET** `/subscriptions/status/:channelId` - Check subscription status (🔒)
- **GET** `/subscriptions/feed` - Get subscription feed (🔒)

## 🔍 Search
- **GET** `/search/videos?q=query` - Search videos (public)
- **GET** `/search/channels?q=query` - Search channels (public)
- **GET** `/search/users?q=query` - Search users (public)
- **GET** `/search/global?q=query` - Global search (public)

## 📋 Playlists
- **POST** `/users/newPlaylist` - Create playlist (🔒)
- **GET** `/users/playlists` - Get all playlists (🔒)
- **GET** `/users/playlists/user/:userId` - Get user playlists (🔒)
- **GET** `/users/playlists/:playlistId` - Get playlist videos (🔒)
- **DELETE** `/users/playlists/:playlistId/delete` - Delete playlist (🔒)
- **POST** `/users/playlists/:playlistId/add-video` - Add video to playlist (🔒)
- **DELETE** `/users/playlists/:playlistId/remove-video/:videoId` - Remove video (🔒)

## 🐦 Tweets (Social Feature)
- **POST** `/users/tweets/add` - Add tweet (🔒)
- **GET** `/users/tweets` - Get all tweets (🔒)
- **GET** `/users/tweets/user/:userId` - Get user tweets (🔒)
- **DELETE** `/users/tweets/:tweetId/delete` - Delete tweet (🔒)

## 📺 Channel Discovery
- **GET** `/channels/handle/:handle` - Get channel by handle (public)
- **GET** `/channels/:channelId` - Get channel by ID (public)
- **GET** `/channels/:channelId/videos` - Get channel videos (public)

## 🏥 Health Check
- **GET** `/healthCheck/` - Health check endpoint

---

**Legend:**
- 🔒 = Requires authentication
- (public) = No authentication required

**Query Parameters:**
- Most list endpoints support: `?page=1&limit=10`
- Search endpoints support: `?q=query&page=1&limit=10`
- Video search supports: `?q=query&category=Gaming&sortBy=views`
