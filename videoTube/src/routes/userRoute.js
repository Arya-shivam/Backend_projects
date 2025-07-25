import { Router } from "express";
import {upload} from '../middlewares/multer.middleware.js'
import { loginUser,
        registerUser,
        logoutUser,
        newRefreshToken,
        getCurrentUser,
        changePassword,
        updateUserInfo,
        updateUserAvatar,
        updateUserCoverImage
   } from "../controller/user.controller.js";
import {
        createChannel,
        getUserChannels,
        updateChannel,
        updateChannelAvatar,
        updateChannelBanner,
        deleteChannel,
        getChannelAnalytics,
        getChannelVideos,
        getChannelVideosByHandle
   } from "../controller/channel.controller.js";
import {
        uploadVideo,
        updateVideo,
        deleteVideo
   } from "../controller/video.controller.js";
import {
        getUserLikedVideos
   } from "../controller/like.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)
// unsecured routes
router.route("/login").post(loginUser)
router.route("/refreshToken").post(newRefreshToken)

// Secured routes
router.route("/logout").post(verifyJwt,logoutUser)
router.route("/currentUser").get(verifyJwt, getCurrentUser)
router.route("/changePassword").put(verifyJwt, changePassword)
router.route("/updateUserInfo").put(verifyJwt, updateUserInfo)
router.route("/updateUserAvatar").put(verifyJwt, upload.single("avatar"), updateUserAvatar)
router.route("/updateUserCoverImage").put(verifyJwt, upload.single("coverImage"), updateUserCoverImage)

// Channel management routes (user-centric)
router.route("/channels").get(verifyJwt, getUserChannels)
router.route("/channels/new").post(verifyJwt, createChannel)
router.route("/channels/:channelId/update").put(verifyJwt, updateChannel)
router.route("/channels/:channelId/avatar").put(verifyJwt, upload.single("avatar"), updateChannelAvatar)
router.route("/channels/:channelId/banner").put(verifyJwt, upload.single("banner"), updateChannelBanner)
router.route("/channels/:channelId/delete").delete(verifyJwt, deleteChannel)
router.route("/channels/:channelId/analytics").get(verifyJwt, getChannelAnalytics)
router.route("/channels/:channelId/videos").get(verifyJwt, getChannelVideos)
router.route("/channel/:channelHandle/videos").get(verifyJwt, getChannelVideosByHandle)

// Video management routes (user-centric)
router.route("/videos/upload").post(
    verifyJwt,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    uploadVideo
);
router.route("/videos/:videoId/update").put(verifyJwt, updateVideo)
router.route("/videos/:videoId/delete").delete(verifyJwt, deleteVideo)
router.route("/videos/liked").get(verifyJwt, getUserLikedVideos)

export default router