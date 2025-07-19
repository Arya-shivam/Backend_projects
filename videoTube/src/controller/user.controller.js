import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { jwt } from "jsonwebtoken";
import { options } from "../contants.js";


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

  if (existedUser) throw new ApiResponse(401, "User already exists");

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  let coverImg = ""
  if (coverLocalPath) {
    coverImg = await uploadOnCloudinary(coverLocalPath);
  }

  //   console.log(avatar,avatarLocalPath,coverImg,coverLocalPath)
  const user = await User.create({
    fullname,
    avatar: avatar.url,
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
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"))


});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    User.findOne(userId)

    if (!User) throw new ApiError(400, "User not found")

    const accesstoken = User.generateAccessToken();
    const refreshtoken = User.generateRefreshtoken();

    User.refreshToken = refreshtoken;
    await User.save({ validateBeforeSave: false });
    return { accesstoken, refreshtoken }
  } catch (error) {
    throw new ApiError(400, "error generating tokens")
  }
}

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  const user = await User.findOne({ email })
  if (!user) { throw new ApiError(401, " user not found ") }

  //validate user
  const isValid = await User.isPasswordCorrect(password)
  if (!isValid) { throw new ApiError(402, "Invalid password") }

  const { accesstoken, refreshtoken } = generateAccessAndRefreshToken(user._id);

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
export { registerUser, loginUser, newRefreshToken,logoutUser };