import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { Channel } from "../models/channel.model.js";
import { Video } from "../models/video.model.js";

// Subscribe to a channel
const subscribeToChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });
    
    if (existingSubscription) {
        throw new ApiError(400, "Already subscribed to this channel");
    }
    
    const subscription = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    });
    
    // Increment channel subscribers count
    await Channel.findByIdAndUpdate(channelId, { $inc: { subscribersCount: 1 } });
    
    return res.status(200).json(new ApiResponse(200, subscription, "Subscribed to channel successfully"));
});

// Unsubscribe from a channel
const unsubscribeFromChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    
    const subscription = await Subscription.findOneAndDelete({
        subscriber: req.user._id,
        channel: channelId
    });
    
    if (!subscription) {
        throw new ApiError(400, "Not subscribed to this channel");
    }
    
    // Decrement channel subscribers count
    await Channel.findByIdAndUpdate(channelId, { $inc: { subscribersCount: -1 } });
    
    return res.status(200).json(new ApiResponse(200, null, "Unsubscribed from channel successfully"));
});

// Get user's subscriptions
const getUserSubscriptions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const subscriptions = await Subscription.find({ subscriber: req.user._id })
        .populate('channel', 'name handle avatar subscribersCount')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Subscription.countDocuments({ subscriber: req.user._id });

    return res.status(200).json(new ApiResponse(200, {
        subscriptions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    }, "User subscriptions fetched successfully"));
});

// Get channel's subscribers
const getChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const subscribers = await Subscription.find({ channel: channelId })
        .populate('subscriber', 'username fullname avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Subscription.countDocuments({ channel: channelId });

    return res.status(200).json(new ApiResponse(200, {
        subscribers,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    }, "Channel subscribers fetched successfully"));
});

// Check subscription status
const checkSubscriptionStatus = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const subscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    return res.status(200).json(new ApiResponse(200, {
        isSubscribed: !!subscription,
        subscriptionId: subscription?._id || null
    }, "Subscription status checked successfully"));
});

// Get subscription feed (videos from subscribed channels)
const getSubscriptionFeed = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    // Get user's subscribed channels
    const subscriptions = await Subscription.find({ subscriber: userId })
        .select('channel');

    const subscribedChannelIds = subscriptions.map(sub => sub.channel);

    if (subscribedChannelIds.length === 0) {
        return res.status(200).json(new ApiResponse(200, {
            videos: [],
            totalPages: 0,
            currentPage: page,
            total: 0
        }, "No subscriptions found"));
    }

    // Get videos from subscribed channels
    const videos = await Video.find({
        channel: { $in: subscribedChannelIds },
        visibility: 'public'
    })
        .populate('owner', 'username fullname avatar')
        .populate('channel', 'name handle avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Video.countDocuments({
        channel: { $in: subscribedChannelIds },
        visibility: 'public'
    });

    return res.status(200).json(new ApiResponse(200, {
        videos,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    }, "Subscription feed fetched successfully"));
});

export {
    subscribeToChannel,
    unsubscribeFromChannel,
    getUserSubscriptions,
    getChannelSubscribers,
    checkSubscriptionStatus,
    getSubscriptionFeed
};