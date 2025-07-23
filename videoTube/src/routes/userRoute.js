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

//secured routes
router.route("/logout").post(verifyJwt,logoutUser)
router.route("/currentUser").get(verifyJwt, getCurrentUser)
router.route("/changePassword").put(verifyJwt, changePassword)
router.route("/updateUserInfo").put(verifyJwt, updateUserInfo)
router.route("/updateUserAvatar").put(verifyJwt, upload.single("avatar"), updateUserAvatar)
router.route("/updateUserCoverImage").put(verifyJwt, upload.single("coverImage"), updateUserCoverImage)

export default router