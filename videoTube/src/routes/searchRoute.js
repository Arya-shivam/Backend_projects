import { Router } from "express";
import {
    searchVideos,
    searchChannels,
    searchUsers,
    globalSearch
} from "../controller/search.controller.js";

const router = Router();

// All search routes are public (no authentication required)
router.route("/videos").get(searchVideos);
router.route("/channels").get(searchChannels);
router.route("/users").get(searchUsers);
router.route("/global").get(globalSearch);

export default router;
