import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { Channel } from "../models/channel.model.js";

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

export {
    subscribeToChannel,
    unsubscribeFromChannel
};