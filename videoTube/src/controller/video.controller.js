import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { Video } from '../models/video.model.js';
import { Channel } from '../models/channel.model.js';
import { User } from '../models/user.model.js';

// Uploading new video
const uploadVideo = asyncHandler( async(req,res)=>{
    const {title, description, tags, category, visibility, channelId} = req.body;
    if(!title || ! description){
        throw new ApiError(400,"Title and description are required")
    }
    if(!channelId){
        throw new ApiError(400,"Channel ID is required")
    }

    // Verify channel exists and user owns it
    const channel = await Channel.findById(channelId);
    if(!channel){
        throw new ApiError(404,"Channel not found")
    }
    if(channel.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You can only upload videos to your own channels")
    }

    const owner = req.user._id;
    const videoFile = req.files?.videoFile?.[0]?.path;
    const thumbnail = req.files?.thumbnail?.[0]?.path;

    if(!videoFile || !thumbnail){
        throw new ApiError(400,"Video and thumbnail are required")
    }
    const uploadedVideo = await uploadOnCloudinary(videoFile);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnail);

    const duration = uploadedVideo.duration; // Duration in seconds

    const video = await Video.create({
        title,
        description,
        videoFile: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        duration,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        category: category || 'Other',
        visibility: visibility || 'public',
        owner,
        channel: channelId
    })

    // Increment channel video count
    await channel.incrementVideos();

    if(!video){
        throw new ApiError(500,"Something went wrong while uploading video")
    }

    // Populate channel info in response
    const populatedVideo = await Video.findById(video._id)
        .populate('channel', 'name handle avatar')
        .populate('owner', 'username fullname');

    return res.status(201).json(new ApiResponse(201, populatedVideo, "Video uploaded successfully"))
})

// Get all videos with pagination and filtering
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, visibility = 'public' } = req.query;

    const filter = { visibility };
    if (category && category !== 'all') {
        filter.category = category;
    }

    const videos = await Video.find(filter)
        .populate('owner', 'username fullname avatar')
        .populate('channel', 'name handle avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Video.countDocuments(filter);

    return res.status(200).json(new ApiResponse(200, {
        videos,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    }, "Videos fetched successfully"));
});

// Get video by ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId)
        .populate('owner', 'username fullname avatar')
        .populate('channel', 'name handle avatar');

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Increment views
    video.views += 1;
    await video.save();

    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

// Update video info
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, tags, category, visibility } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if user owns the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own videos");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            title: title || video.title,
            description: description || video.description,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : video.tags,
            category: category || video.category,
            visibility: visibility || video.visibility
        },
        { new: true, runValidators: true }
    ).populate('owner', 'username fullname avatar');

    return res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// Delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if user owns the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own videos");
    }

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
});

// Get all videos by a user
const getUserVideos = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const videos = await Video.find({ owner: userId })
        .populate('owner', 'username fullname avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Video.countDocuments({ owner: userId });

    return res.status(200).json(new ApiResponse(200, {
        videos,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    }, "User videos fetched successfully"));
});

// Get videos by category
const getVideosByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const videos = await Video.find({ category, visibility: 'public' })
        .populate('owner', 'username fullname avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Video.countDocuments({ category, visibility: 'public' });

    return res.status(200).json(new ApiResponse(200, {
        videos,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    }, "Category videos fetched successfully"));
});

export {
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    getUserVideos,
    getVideosByCategory
}