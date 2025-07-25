import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    getAllVideos,
    getVideoById,
    getUserVideos,
    getVideosByCategory
} from "../controller/video.controller.js";
import {
    toggleVideoLike,
    toggleCommentLike,
    getVideoLikes,
    checkVideoLikeStatus
} from "../controller/like.controller.js";
import {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment,
    addReply,
    getCommentReplies
} from "../controller/comment.controller.js";

const router = Router();

// Public routes (video discovery and viewing)
router.route("/").get(getAllVideos);
router.route("/:videoId").get(getVideoById);
router.route("/category/:category").get(getVideosByCategory);
router.route("/user/:userId").get(getUserVideos);

// Video interaction routes (require authentication)
// Like routes
router.route("/:videoId/like").post(verifyJwt, toggleVideoLike);
router.route("/:videoId/likes").get(getVideoLikes);
router.route("/:videoId/like-status").get(verifyJwt, checkVideoLikeStatus);

// Comment routes
router.route("/:videoId/comments").get(getVideoComments);
router.route("/:videoId/comments").post(verifyJwt, addComment);
router.route("/comments/:commentId/update").put(verifyJwt, updateComment);
router.route("/comments/:commentId/delete").delete(verifyJwt, deleteComment);
router.route("/comments/:commentId/like").post(verifyJwt, toggleCommentLike);
router.route("/comments/:commentId/reply").post(verifyJwt, addReply);
router.route("/comments/:commentId/replies").get(getCommentReplies);

export default router;
