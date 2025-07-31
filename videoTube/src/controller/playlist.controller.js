import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Playlist } from '../models/playlist.model.js';
import { Video } from '../models/video.model.js';
import { User } from '../models/user.model.js';

// Create a playlist
const createPlaylist = asyncHandler(async(req,res)=>{
    const {name,description} = req.body;
    const userId = req.user._id;

    if(!name || name.trim() === ''){
        throw new ApiError(400,"Playlist name is required")
    }

    const playlist = await Playlist.create({
        name:name.trim(),
        description:description || "",
        owner:userId
    })

    return res.status(201).json(new ApiResponse(201,playlist,"Playlist created successfully"))
})

// Get all playlists
const getAllPlaylists = asyncHandler(async(req,res)=>{
    const {page=1,limit=10} = req.query;

    const playlists = await Playlist.find()
        .populate('owner','username fullname')
        .sort({createdAt:-1})
        .limit(limit*1)
        .skip((page-1)*limit);

    const total = await Playlist.countDocuments();

    return res.status(200).json(new ApiResponse(200,{
        playlists,
        totalPages:Math.ceil(total/limit),
        currentPage:page,
        total
    },"Playlists fetched successfully"))
})

// Get user's playlists
const getUserPlaylists = asyncHandler(async(req,res)=>{
    const {userId} = req.params;
    const {page=1,limit=10} = req.query;

    const playlists = await Playlist.find({owner:userId})
        .populate('owner','username fullname')
        .sort({createdAt:-1})
        .limit(limit*1)
        .skip((page-1)*limit);

    const total = await Playlist.countDocuments({owner:userId});

    return res.status(200).json(new ApiResponse(200,{
        playlists,
        totalPages:Math.ceil(total/limit),
        currentPage:page,
        total
    },"Playlists fetched successfully"))
})

// delete playlist 
const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;
    const userId = req.user._id;

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist not found");
    }
    if(playlist.owner.toString() !== userId.toString()){
        throw new ApiError(403,"You can only delete your own playlists");
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json(new ApiResponse(200,null,"Playlist deleted successfully"))  
})

// Add video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { videoId } = req.body;
    const userId = req.user._id;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only modify your own playlists");
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if video is already in playlist
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlistId)
        .populate('owner', 'username fullname')
        .populate('videos', 'title thumbnail duration views');

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"));
});

// Remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    const userId = req.user._id;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only modify your own playlists");
    }

    playlist.videos = playlist.videos.filter(id => id.toString() !== videoId);
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlistId)
        .populate('owner', 'username fullname')
        .populate('videos', 'title thumbnail duration views');

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"));
});

// Get playlist videos
const getPlaylistVideos = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const playlist = await Playlist.findById(playlistId)
        .populate('owner', 'username fullname');

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check if playlist is public or user owns it
    if (!playlist.isPublic && playlist.owner._id.toString() !== req.user?._id?.toString()) {
        throw new ApiError(403, "This playlist is private");
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const videoIds = playlist.videos.slice(startIndex, endIndex);

    const videos = await Video.find({ _id: { $in: videoIds } })
        .populate('owner', 'username fullname avatar')
        .populate('channel', 'name handle avatar');

    // Maintain the order from playlist
    const orderedVideos = videoIds.map(id =>
        videos.find(video => video._id.toString() === id.toString())
    ).filter(Boolean);

    return res.status(200).json(new ApiResponse(200, {
        playlist: {
            _id: playlist._id,
            name: playlist.name,
            description: playlist.description,
            owner: playlist.owner,
            isPublic: playlist.isPublic,
            totalVideos: playlist.videos.length
        },
        videos: orderedVideos,
        totalPages: Math.ceil(playlist.videos.length / limit),
        currentPage: page,
        total: playlist.videos.length
    }, "Playlist videos fetched successfully"));
});

export {
    createPlaylist,
    getAllPlaylists,
    getUserPlaylists,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getPlaylistVideos
}