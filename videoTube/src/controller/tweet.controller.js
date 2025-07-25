import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Tweet } from "../models/tweet.model";
import { User } from "../models/user.model";

// Add tweet
const addTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body;
    const userId = req.user._id;

    if(!content || content.trim() === ''){
        throw new ApiError(400,"Tweet content is required")
    }

    const tweet = await Tweet.create({
        content:content.trim(),
        owner:userId
    })

    const populatedTweet = await Tweet.findById(tweet._id)
        .populate('owner','username fullname')

    return res.status(201).json(new ApiResponse(201,populatedTweet,"Tweet added successfully"))
})

// Get all tweets
const getAllTweets = asyncHandler(async (req,res)=>{
    const {page=1,limit=10}=req.query;

    const tweets = await Tweet.find()
        .populate('owner','username fullname')
        .sort({createdAt:-1})
        .limit(limit*1)
        .skip((page-1)*limit);

    const total = await Tweet.countDocuments();

    return res.status(200).json(new ApiResponse(200,{
        tweets,
        totalPages:Math.ceil(total/limit),
        currentPage:page,
        total
    },"Tweets fetched successfully"))   
})

const getTweetsByUser = asyncHandler(async (req,res)=>{
    const {userId} = req.params;
    const {page=1,limit=10} = req.query;

    const tweets = await Tweet.find({owner:userId})
        .populate('owner','username fullname')
        .sort({createdAt:-1})
        .limit(limit*1)
        .skip((page-1)*limit);

    const total = await Tweet.countDocuments({owner:userId});

    return res.status(200).json(new ApiResponse(200,{
        tweets,
        totalPages:Math.ceil(total/limit),
        currentPage:page,
        total
    },"Tweets fetched successfully"))
})

//delete a tweet

const deleteTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    const userId = req.user._id;

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"Tweet not found");
    }
    if(tweet.owner.toString() !== userId.toString()){
        throw new ApiError(403,"You can only delete your own tweets");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(new ApiResponse(200,null,"Tweet deleted successfully"))
})


export {
    addTweet,
    getAllTweets,
    getTweetsByUser,
    deleteTweet
}
