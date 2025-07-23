import  jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyJwt = asyncHandler(async(req, _,next)=>{
    const token = req.cookies.accesstoken || req.body("Authorization")?.replace("Bearer ","");

    const decodedToken = jwt.verify(token,process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decodedToken._id).select("-password");

    if(!user) throw new ApiError("User not found",404);

    req.user = user;
    next();
})
