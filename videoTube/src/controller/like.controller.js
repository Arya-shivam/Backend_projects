import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Like } from '../models/like.model.js';
import { Video } from '../models/video.model.js';
import { Comment } from '../models/comment.model.js';

// Toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if user already liked this video
    const existingLike = await Like.findOne({
        video: videoId,
        likedby: userId
    });

    if (existingLike) {
        // Unlike: Remove the like
        await Like.findByIdAndDelete(existingLike._id);
        
        // Decrement like count in video
        video.likes = Math.max(0, video.likes - 1);
        await video.save();

        return res.status(200).json(new ApiResponse(200, {
            isLiked: false,
            likesCount: video.likes
        }, "Video unliked successfully"));
    } else {
        // Like: Create new like
        await Like.create({
            video: videoId,
            likedby: userId
        });

        // Increment like count in video
        video.likes += 1;
        await video.save();

        return res.status(200).json(new ApiResponse(200, {
            isLiked: true,
            likesCount: video.likes
        }, "Video liked successfully"));
    }
});

// Toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    // Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check if user already liked this comment
    const existingLike = await Like.findOne({
        comment: commentId,
        likedby: userId
    });

    if (existingLike) {
        // Unlike: Remove the like
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(new ApiResponse(200, {
            isLiked: false
        }, "Comment unliked successfully"));
    } else {
        // Like: Create new like
        await Like.create({
            comment: commentId,
            likedby: userId
        });

        return res.status(200).json(new ApiResponse(200, {
            isLiked: true
        }, "Comment liked successfully"));
    }
});

// Get video likes
const getVideoLikes = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const likes = await Like.find({ video: videoId })
        .populate('likedby', 'username fullname avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Like.countDocuments({ video: videoId });

    return res.status(200).json(new ApiResponse(200, {
        likes,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    }, "Video likes fetched successfully"));
});

// Check if user liked video
const checkVideoLikeStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    const like = await Like.findOne({
        video: videoId,
        likedby: userId
    });

    return res.status(200).json(new ApiResponse(200, {
        isLiked: !!like
    }, "Like status fetched successfully"));
});

// Get user's liked videos
const getUserLikedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const likes = await Like.find({ 
        likedby: userId,
        video: { $exists: true }
    })
        .populate({
            path: 'video',
            populate: {
                path: 'channel',
                select: 'name handle avatar'
            }
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Like.countDocuments({ 
        likedby: userId,
        video: { $exists: true }
    });

    const likedVideos = likes.map(like => like.video).filter(video => video);

    return res.status(200).json(new ApiResponse(200, {
        videos: likedVideos,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    }, "Liked videos fetched successfully"));
});

export {
    toggleVideoLike,
    toggleCommentLike,
    getVideoLikes,
    checkVideoLikeStatus,
    getUserLikedVideos
};
