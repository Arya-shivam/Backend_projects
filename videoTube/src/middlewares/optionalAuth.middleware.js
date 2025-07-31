import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

// Optional authentication - doesn't throw error if no token
export const optionalAuth = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies.accesstoken || req.headers["authorization"]?.replace("Bearer ", "");
        
        if (token) {
            const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const user = await User.findById(decodedToken._id).select("-password");
            
            if (user) {
                req.user = user;
            }
        }
    } catch (error) {
        // Silently ignore authentication errors for optional auth
        console.log("Optional auth failed:", error.message);
    }
    
    next();
});
