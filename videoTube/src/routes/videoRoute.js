import { Router } from "express";
import {
    getAllVideos,
    getVideoById,
    getUserVideos,
    getVideosByCategory
} from "../controller/video.controller.js";

const router = Router();

// Public routes (video discovery and viewing)
router.route("/").get(getAllVideos);
router.route("/:videoId").get(getVideoById);
router.route("/category/:category").get(getVideosByCategory);
router.route("/user/:userId").get(getUserVideos);

export default router;
