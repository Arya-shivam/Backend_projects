import { Router } from "express";
import { upload } from '../middlewares/multer.middleware.js';
import { loginUser,
        registerUser,
        logoutUser,
        newRefreshToken,
        getCurrentUser
   } from "../controller/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

// Basic routes for testing
router.route("/test").get((req, res) => {
    res.json({ message: "User routes are working!", timestamp: new Date().toISOString() });
});

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)
router.route("/refreshToken").post(newRefreshToken)

// Secured routes
router.route("/logout").post(verifyJwt,logoutUser)
router.route("/currentUser").get(verifyJwt, getCurrentUser)

export default router