import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Channel } from "../models/channel.model.js";
import { User } from "../models/user.model.js";

// Search videos
const searchVideos = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10, category, sortBy = 'relevance' } = req.query;
    
    if (!q || q.trim() === '') {
        throw new ApiError(400, "Search query is required");
    }
    
    const searchQuery = q.trim();
    const filter = {
        visibility: 'public',
        $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
            { tags: { $in: [new RegExp(searchQuery, 'i')] } }
        ]
    };
    
    if (category && category !== 'all') {
        filter.category = category;
    }
    
    let sortOptions = {};
    switch (sortBy) {
        case 'views':
            sortOptions = { views: -1 };
            break;
        case 'date':
            sortOptions = { createdAt: -1 };
            break;
        case 'relevance':
        default:
            sortOptions = { createdAt: -1 }; 
            break;
    }
    
    const videos = await Video.find(filter)
        .populate('owner', 'username fullname avatar')
        .populate('channel', 'name handle avatar')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);
    
    const total = await Video.countDocuments(filter);
    
    return res.status(200).json(new ApiResponse(200, {
        videos,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
        query: searchQuery
    }, "Videos search completed successfully"));
});

// Search channels
const searchChannels = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
        throw new ApiError(400, "Search query is required");
    }
    
    const searchQuery = q.trim();
    const filter = {
        $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { handle: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } }
        ]
    };
    
    const channels = await Channel.find(filter)
        .populate('owner', 'username fullname')
        .sort({ subscribersCount: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    
    const total = await Channel.countDocuments(filter);
    
    return res.status(200).json(new ApiResponse(200, {
        channels,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
        query: searchQuery
    }, "Channels search completed successfully"));
});

// Search users
const searchUsers = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
        throw new ApiError(400, "Search query is required");
    }
    
    const searchQuery = q.trim();
    const filter = {
        $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { fullname: { $regex: searchQuery, $options: 'i' } }
        ]
    };
    
    const users = await User.find(filter)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    
    const total = await User.countDocuments(filter);
    
    return res.status(200).json(new ApiResponse(200, {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
        query: searchQuery
    }, "Users search completed successfully"));
});

// Global search (all content types)
const globalSearch = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 5 } = req.query;
    
    if (!q || q.trim() === '') {
        throw new ApiError(400, "Search query is required");
    }
    
    const searchQuery = q.trim();
    
    // Search videos
    const videoFilter = {
        visibility: 'public',
        $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
            { tags: { $in: [new RegExp(searchQuery, 'i')] } }
        ]
    };
    
    const videos = await Video.find(videoFilter)
        .populate('owner', 'username fullname avatar')
        .populate('channel', 'name handle avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1);
    
    // Search channels
    const channelFilter = {
        $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { handle: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } }
        ]
    };
    
    const channels = await Channel.find(channelFilter)
        .populate('owner', 'username fullname')
        .sort({ subscribersCount: -1 })
        .limit(limit * 1);
    
    // Search users
    const userFilter = {
        $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { fullname: { $regex: searchQuery, $options: 'i' } }
        ]
    };
    
    const users = await User.find(userFilter)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .limit(limit * 1);
    
    return res.status(200).json(new ApiResponse(200, {
        videos,
        channels,
        users,
        query: searchQuery
    }, "Global search completed successfully"));
});

export {
    searchVideos,
    searchChannels,
    searchUsers,
    globalSearch
};
