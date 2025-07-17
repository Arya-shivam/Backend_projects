import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;
  if(!req.body){
    throw new ApiError(400,"Empty response")
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
  let coverImg =""
  if(coverLocalPath){
    coverImg = await uploadOnCloudinary(coverLocalPath);
  }

//   console.log(avatar,avatarLocalPath,coverImg,coverLocalPath)
  const user = await User.create({
    fullname,
    avatar:avatar.url,
    coverImg:coverImg?.url || "",
    email,
    password,
    username:username.toLowerCase()
  })
  
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiResponse(500,"Something went wrong while registering User")
  }
  return res
    .status(201)
    .json(new ApiResponse(200,createdUser,"User Registered Successfully"))
  

});

export { registerUser };