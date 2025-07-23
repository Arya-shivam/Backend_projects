import { Router } from "express";
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJwt } from "../middlewares/auth.middleware.js"
import { uploadVideo,updateVideo,deleteVideo } from "../controller/video.controller.js";

const router = Router();

router.route("/uploadVideo").post(
    upload.fields([
            {
                name:"videoFile",
                maxCount:1
            },
            {
                name:"thumbnail",
                maxCount:1
            }
        ]),
    verifyJwt,
    uploadVideo
)
router.route("/updateVideo/:videoId").put(verifyJwt, updateVideo)
router.route("/deleteVideo/:videoId").delete(verifyJwt, deleteVideo)
// router.route("/getAllVideos").get(getAllVideos)
// router.route("/getVideosByCategory/:category").get(getVideosByCategory)

export default router