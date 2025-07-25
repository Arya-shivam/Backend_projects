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

export { createPlaylist, getAllPlaylists, getUserPlaylists, deletePlaylist }