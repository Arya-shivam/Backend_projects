import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Channel } from "../models/channel.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import  jwt  from "jsonwebtoken";
import { options } from "../contants.js";
import mongoose from "mongoose";


const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;
  if (!req.body) {
    throw new ApiError(400, "Empty response")
  }

  if ([fullname, username, email, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) throw new ApiError(409, "User already exists");

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  let avatar = null;
  if (avatarLocalPath) {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  }

  let coverImg = null;
  if (coverLocalPath) {
    coverImg = await uploadOnCloudinary(coverLocalPath);
  }

  //   console.log(avatar,avatarLocalPath,coverImg,coverLocalPath)
  const user = await User.create({
    fullname,
    avatar: avatar?.url || "https://via.placeholder.com/150",
    coverImg: coverImg?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiResponse(500, "Something went wrong while registering User")
  }

  // Create default channel for the user
  try {
    const defaultChannel = await Channel.create({
      name: createdUser.fullname,
      handle: createdUser.username,
      description: `Welcome to ${createdUser.fullname}'s channel!`,
      owner: createdUser._id,
      isDefault: true,
      avatar: createdUser.avatar
    });
    console.log(`Default channel created for user: ${createdUser.username}`);
  } catch (error) {
    console.error("Error creating default channel:", error);
    // Don't fail registration if channel creation fails
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"))


});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(400, "User not found")
    // Generate access token
    const accesstoken = user.generateAccessToken();
    const refreshtoken = user.generateRefreshToken();

    user.refreshToken = refreshtoken;
    await user.save({ validateBeforeSave: false });
    return { accesstoken, refreshtoken }
  } catch (error) {
    console.error("Error in generateAccessAndRefreshToken:", error);
    throw new ApiError(400, "error generating tokens")
  }
}

const loginUser = asyncHandler(async (req, res) => {
  const { email, password} = req.body;

  const user = await User.findOne({ email })
  if (!user) { throw new ApiError(401, " user not found ") }

  //validate user
  const isValid = await user.isPasswordCorrect(password)
  if (!isValid) { throw new ApiError(402, "Invalid password") }

  const { accesstoken, refreshtoken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password")

  const option = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  }

  return res
    .status(200)
    .cookie("accesstoken", accesstoken, option)
    .cookie("refreshtoken", refreshtoken, option)
    .json(new ApiResponse(200, loggedInUser, "User logged In Successfully"))



})

const logoutUser = asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    // need to learn how to find user _id 
    // at 19/7/2025 coming back to this
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {new:true, runValidators:true}
  )
  return res
    .status(200)
    .cookie("accesstoken", "", { ...options})
    .cookie("refreshtoken", "", { ...options})
    .json(new ApiResponse(200, null, "User logged out successfully"))
})

const newRefreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshtoken || req.body.refreshtoken;
  if (!incomingRefreshToken) {
    throw new ApiError(402, "Refersh token not found") }

  const validRefreshToken = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  if (!validRefreshToken) {
    throw new ApiError(402, "Invalid refresh token") }

  const userId = User.findById(validRefreshToken?._id)
  if (incomingRefreshToken != User?.refreshToken) {
    throw new ApiError(402, "Invalid refresh token")
  }
  const { accesstoken, refreshtoken: newReftoken } = await generateAccessAndRefreshToken(userId);

  const option = {
    httpOnly:true,
    secure:process.env.NODE_ENV=="production"
  }

  return res
    .status(200)
    .cookie("accesstoken",accesstoken,option)
    .cookie("refreshtoken",newReftoken,option)
    .json(
      new ApiResponse(
        200,
        {
        accesstoken,
        refreshtoken:newReftoken,
      },
      "Access token refreshed !"
      )
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.status(200).json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old and new passwords are required");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isValid = await user.isPasswordCorrect(oldPassword);
  if (!isValid) {
    throw new ApiError(401, "Old password is incorrect");
  }
  user.password = newPassword;
  await user.save(); // triggers pre('save') and hashes password
  return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
})

const updateUserInfo = asyncHandler(async (req, res) => {
  const {fullname,username,email} = req.body;
  if (!fullname || !username || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { fullname, username: username.toLowerCase(), email },
    { new: true, runValidators: true }
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.status(200).json(new ApiResponse(200, user, "User information updated successfully"));
})


const updateUserAvatar = asyncHandler(async (req, res) => {
  const localAvatarPath = req.file?.path;
  if (!localAvatarPath) {
    throw new ApiError(400, "Avatar image is required");
  }
  const avatar = await uploadOnCloudinary(localAvatarPath);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatar.url },
    { new: true, runValidators: true }
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.status(200).json(new ApiResponse(200, user, "User avatar updated successfully"));  
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const localCoverImagePath = req.file?.path;
  if (!localCoverImagePath) {
    throw new ApiError(400, "Cover image is required");
  }
  const coverImage = await uploadOnCloudinary(localCoverImagePath);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { coverImg: coverImage.url },
    { new: true, runValidators: true }
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.status(200).json(new ApiResponse(200, user, "User cover image updated successfully"));
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
  const {username } = req.params;
  if(!username){
    throw new ApiError(400, "Username is required")
  }

  //using mongoDb aggregation pipeline to fetch info
  const channel = await User.aggregate(
    [
      {
        $match:{
          username:username?.toLowerCase()
        }
      },
      //subscriber list
      {
        $lookup:{
          from:"Subscription",
          localField:"_id",
          foreignField:"channel",
          as:"subscribers"
        }
      },
      // subscribed to list
      {
        $lookup:{
          from:"Subscription",
          localField:"_id",
          foreignField:"subscriber",
          as:"subscribedTo"
        }
      },
      {
        $addFields:{
          subscriberCount:{$size:"$subscribers"},
          subscribedToCount:{$size:"$subscribedTo"},
          isSubscribed:{
            $cond:{
              if:{$in:[req.user._id, "$subscribers.subscriber"]},
              then:true,
              else:false
            }
          }
        }
      },
      {
        $project:{
          username:1,
          fullname:1,
          avatar:1,
          coverImg:1,
          subscriberCount:1,
          subscribedToCount:1,
          isSubscribed:1
        }
      }
    ] 
  )

  if(!channel){
    throw new ApiError(404, "User not found")
  }
  return res.status(200).json(new ApiResponse(200, channel[0], "User channel profile fetched successfully"));
})

const getWatchedVideosList = asyncHandler(async (req,res)=>{

  const watchlist = await User.aggregate(
    [
      {
        $match:{
          _id:new mongoose.Types.ObjectId(req.user?._id)
        }
      },
      {
        $lookup:{
          from:"Video",
          localField:"watchHistory",
          foreignField:"_id",
          as:"watchHistory",
          pipeline:[
            {
              $lookup:{
                from:"User",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                  {
                    $project:{
                      fullname:1,
                      username:1,
                      avatar:1
                    }
                  }
                ]
              }
            },
            {
              $addFields:{
                owner:{
                  $first:"$owner"
                }
              }
            }
          ]
        }
      },
      {
        $project:{
          watchHistory:1
        }
      }
    ]
  )
  if(!watchlist){
    throw new ApiError(404, "Watchlist not found")
  }
  return res.status(200).json(new ApiResponse(200, watchlist[0], "Watchlist fetched successfully"))  


})




export { 
  registerUser, 
  loginUser, 
  newRefreshToken, 
  logoutUser, 
  getCurrentUser,
  changePassword,
  updateUserInfo,
  updateUserAvatar,
  updateUserCoverImage, 
  getUserChannelProfile,
  getWatchedVideosList
};