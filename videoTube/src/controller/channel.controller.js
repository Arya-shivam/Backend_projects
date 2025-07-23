import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { Channel } from '../models/channel.model.js';
import { Video } from '../models/video.model.js';
import { User } from '../models/user.model.js';

// Create a new channel
const createChannel = asyncHandler(async (req, res) => {
    const { name, handle, description, category } = req.body;
    
    if (!name || !handle) {
        throw new ApiError(400, "Channel name and handle are required");
    }
    
    // Check if handle already exists
    const existingChannel = await Channel.findOne({ handle: handle.toLowerCase() });
    if (existingChannel) {
        throw new ApiError(409, "Channel handle already exists");
    }
    
    // Check if user already has 3 channels (limit)
    const userChannelCount = await Channel.countDocuments({ owner: req.user._id });
    if (userChannelCount >= 3) {
        throw new ApiError(400, "Maximum 3 channels allowed per user");
    }
    
    const channel = await Channel.create({
        name,
        handle: handle.toLowerCase(),
        description: description || "",
        category: category || 'Other',
        owner: req.user._id
    });
    
    return res.status(201).json(new ApiResponse(201, channel, "Channel created successfully"));
});

// Get user's channels
const getUserChannels = asyncHandler(async (req, res) => {
    const channels = await Channel.find({ owner: req.user._id })
        .sort({ isDefault: -1, createdAt: -1 });
    
    return res.status(200).json(new ApiResponse(200, channels, "User channels fetched successfully"));
});

// Get channel by handle
const getChannelByHandle = asyncHandler(async (req, res) => {
    const { handle } = req.params;
    
    const channel = await Channel.findOne({ handle: handle.toLowerCase() })
        .populate('owner', 'username fullname');
    
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    
    return res.status(200).json(new ApiResponse(200, channel, "Channel fetched successfully"));
});

// Get channel by ID
const getChannelById = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    
    const channel = await Channel.findById(channelId)
        .populate('owner', 'username fullname');
    
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    
    return res.status(200).json(new ApiResponse(200, channel, "Channel fetched successfully"));
});

// Update channel
const updateChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { name, description, category, socialLinks } = req.body;
    
    const channel = await Channel.findById(channelId);
    
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    
    // Check ownership
    if (channel.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own channels");
    }
    
    const updatedChannel = await Channel.findByIdAndUpdate(
        channelId,
        {
            name: name || channel.name,
            description: description || channel.description,
            category: category || channel.category,
            socialLinks: socialLinks || channel.socialLinks
        },
        { new: true, runValidators: true }
    );
    
    return res.status(200).json(new ApiResponse(200, updatedChannel, "Channel updated successfully"));
});

// Update channel avatar
const updateChannelAvatar = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const localAvatarPath = req.file?.path;
    
    if (!localAvatarPath) {
        throw new ApiError(400, "Avatar image is required");
    }
    
    const channel = await Channel.findById(channelId);
    
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    
    // Check ownership
    if (channel.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own channels");
    }
    
    const avatar = await uploadOnCloudinary(localAvatarPath);
    
    const updatedChannel = await Channel.findByIdAndUpdate(
        channelId,
        { avatar: avatar.url },
        { new: true }
    );
    
    return res.status(200).json(new ApiResponse(200, updatedChannel, "Channel avatar updated successfully"));
});

// Update channel banner
const updateChannelBanner = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const localBannerPath = req.file?.path;
    
    if (!localBannerPath) {
        throw new ApiError(400, "Banner image is required");
    }
    
    const channel = await Channel.findById(channelId);
    
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    
    // Check ownership
    if (channel.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own channels");
    }
    
    const banner = await uploadOnCloudinary(localBannerPath);
    
    const updatedChannel = await Channel.findByIdAndUpdate(
        channelId,
        { banner: banner.url },
        { new: true }
    );
    
    return res.status(200).json(new ApiResponse(200, updatedChannel, "Channel banner updated successfully"));
});

// Delete channel
const deleteChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    
    const channel = await Channel.findById(channelId);
    
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    
    // Check ownership
    if (channel.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own channels");
    }
    
    // Cannot delete default channel
    if (channel.isDefault) {
        throw new ApiError(400, "Cannot delete default channel");
    }
    
    // Check if channel has videos
    const videoCount = await Video.countDocuments({ channel: channelId });
    if (videoCount > 0) {
        throw new ApiError(400, "Cannot delete channel with existing videos. Please delete all videos first.");
    }
    
    await Channel.findByIdAndDelete(channelId);
    
    return res.status(200).json(new ApiResponse(200, null, "Channel deleted successfully"));
});

// Get channel videos
const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 10, visibility = 'public' } = req.query;
    
    const channel = await Channel.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    
    const filter = { channel: channelId };
    
    // If not the channel owner, only show public videos
    if (channel.owner.toString() !== req.user?._id?.toString()) {
        filter.visibility = 'public';
    } else if (visibility !== 'all') {
        filter.visibility = visibility;
    }
    
    const videos = await Video.find(filter)
        .populate('channel', 'name handle avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    
    const total = await Video.countDocuments(filter);
    
    return res.status(200).json(new ApiResponse(200, {
        videos,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    }, "Channel videos fetched successfully"));
});

// Get channel analytics (for channel owner)
const getChannelAnalytics = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    
    const channel = await Channel.findById(channelId);
    
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    
    // Check ownership
    if (channel.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only view analytics for your own channels");
    }
    
    // Get video statistics
    const videoStats = await Video.aggregate([
        { $match: { channel: channel._id } },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: "$likes" },
                avgViews: { $avg: "$views" }
            }
        }
    ]);
    
    const analytics = {
        channel: {
            name: channel.name,
            subscribersCount: channel.subscribersCount,
            videosCount: channel.videosCount,
            totalViews: channel.totalViews
        },
        videos: videoStats[0] || {
            totalVideos: 0,
            totalViews: 0,
            totalLikes: 0,
            avgViews: 0
        }
    };
    
    return res.status(200).json(new ApiResponse(200, analytics, "Channel analytics fetched successfully"));
});

// Get channel videos by handle (for user routes)
const getChannelVideosByHandle = asyncHandler(async (req, res) => {
    const { channelHandle } = req.params;
    const { page = 1, limit = 10, visibility = 'public' } = req.query;

    // Find channel by handle
    const channel = await Channel.findOne({ handle: channelHandle.toLowerCase() });
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const filter = { channel: channel._id };

    // If not the channel owner, only show public videos
    if (channel.owner.toString() !== req.user?._id?.toString()) {
        filter.visibility = 'public';
    } else if (visibility !== 'all') {
        filter.visibility = visibility;
    }

    const videos = await Video.find(filter)
        .populate('channel', 'name handle avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Video.countDocuments(filter);

    return res.status(200).json(new ApiResponse(200, {
        channel: {
            name: channel.name,
            handle: channel.handle,
            avatar: channel.avatar,
            subscribersCount: channel.subscribersCount
        },
        videos,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    }, "Channel videos fetched successfully"));
});

export {
    createChannel,
    getUserChannels,
    getChannelByHandle,
    getChannelById,
    updateChannel,
    updateChannelAvatar,
    updateChannelBanner,
    deleteChannel,
    getChannelVideos,
    getChannelVideosByHandle,
    getChannelAnalytics
};
