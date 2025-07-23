import { Router } from "express";
import {
    getChannelByHandle,
    getChannelById,
    getChannelVideos
} from "../controller/channel.controller.js";

const router = Router();

// Public routes only (channel discovery and viewing)
router.route("/handle/:handle").get(getChannelByHandle);
router.route("/:channelId").get(getChannelById);
router.route("/:channelId/videos").get(getChannelVideos);

export default router;
