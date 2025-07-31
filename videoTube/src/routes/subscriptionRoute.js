import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    subscribeToChannel,
    unsubscribeFromChannel,
    getUserSubscriptions,
    getChannelSubscribers,
    checkSubscriptionStatus,
    getSubscriptionFeed
} from "../controller/subscription.controller.js";

const router = Router();

// All subscription routes require authentication
router.use(verifyJwt);

// Subscribe/Unsubscribe to channels
router.route("/subscribe/:channelId").post(subscribeToChannel);
router.route("/unsubscribe/:channelId").delete(unsubscribeFromChannel);

// Get user's subscriptions
router.route("/user-subscriptions").get(getUserSubscriptions);

// Get channel's subscribers
router.route("/channel-subscribers/:channelId").get(getChannelSubscribers);

// Check if user is subscribed to a channel
router.route("/status/:channelId").get(checkSubscriptionStatus);

// Get subscription feed
router.route("/feed").get(getSubscriptionFeed);

export default router;
