import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-paginate-v2";

const VideoSchema = new Schema({
    videoFile:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    views:{
        type:Number,
        default:0
    },
    duration:{
        type: Number,
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    tags: [{ type: String }],           // Video tags/categories
    category: { type: String },         // Video category
    visibility: { 
        type: String, 
        enum: ['public', 'unlisted', 'private'], 
        default: 'public' 
    },
},
{timestamps:true}
)

VideoSchema.plugin(mongooseAggregatePaginate)

export const Video = new mongoose.model("Video",VideoSchema)