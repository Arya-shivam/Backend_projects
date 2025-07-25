import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Comment } from '../models/comment.model.js';
import { Video } from '../models/video.model.js';
import { Like } from '../models/like.model.js';

// Add comment to video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === '') {
        throw new ApiError(400, "Comment content is required");
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: userId
    });

    const populatedComment = await Comment.findById(comment._id)
        .populate('owner', 'username fullname avatar');

    return res.status(201).json(new ApiResponse(201, populatedComment, "Comment added successfully"));
});

// Get video comments
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const comments = await Comment.find({ 
        video: videoId,
        replies: { $size: 0 } // Only get top-level comments (not replies)
    })
        .populate('owner', 'username fullname avatar')
        .populate({
            path: 'replies',
            populate: {
                path: 'owner',
                select: 'username fullname avatar'
            }
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ 
        video: videoId,
        replies: { $size: 0 }
    });

    // Add like count and user's like status for each comment
    const commentsWithLikes = await Promise.all(
        comments.map(async (comment) => {
            const likeCount = await Like.countDocuments({ comment: comment._id });
            const userLiked = await Like.findOne({ 
                comment: comment._id, 
                likedby: req.user?._id 
            });

            return {
                ...comment.toObject(),
                likesCount: likeCount,
                isLikedByUser: !!userLiked
            };
        })
    );

    return res.status(200).json(new ApiResponse(200, {
        comments: commentsWithLikes,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    }, "Video comments fetched successfully"));
});

// Update comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === '') {
        throw new ApiError(400, "Comment content is required");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check if user owns the comment
    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only update your own comments");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content: content.trim() },
        { new: true, runValidators: true }
    ).populate('owner', 'username fullname avatar');

    return res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

// Delete comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check if user owns the comment
    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only delete your own comments");
    }

    // Delete all likes on this comment
    await Like.deleteMany({ comment: commentId });

    // Delete all replies to this comment
    await Comment.deleteMany({ _id: { $in: comment.replies } });

    // Delete the comment itself
    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
});

// Add reply to comment
const addReply = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === '') {
        throw new ApiError(400, "Reply content is required");
    }

    // Check if parent comment exists
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
        throw new ApiError(404, "Comment not found");
    }

    // Create reply
    const reply = await Comment.create({
        content: content.trim(),
        video: parentComment.video,
        owner: userId
    });

    // Add reply to parent comment's replies array
    parentComment.replies.push(reply._id);
    await parentComment.save();

    const populatedReply = await Comment.findById(reply._id)
        .populate('owner', 'username fullname avatar');

    return res.status(201).json(new ApiResponse(201, populatedReply, "Reply added successfully"));
});

// Get comment replies
const getCommentReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { page = 1, limit = 5 } = req.query;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const replies = await Comment.find({ 
        _id: { $in: comment.replies }
    })
        .populate('owner', 'username fullname avatar')
        .sort({ createdAt: 1 }) // Replies in chronological order
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = comment.replies.length;

    // Add like count and user's like status for each reply
    const repliesWithLikes = await Promise.all(
        replies.map(async (reply) => {
            const likeCount = await Like.countDocuments({ comment: reply._id });
            const userLiked = await Like.findOne({ 
                comment: reply._id, 
                likedby: req.user?._id 
            });

            return {
                ...reply.toObject(),
                likesCount: likeCount,
                isLikedByUser: !!userLiked
            };
        })
    );

    return res.status(200).json(new ApiResponse(200, {
        replies: repliesWithLikes,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    }, "Comment replies fetched successfully"));
});

export {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment,
    addReply,
    getCommentReplies
};
