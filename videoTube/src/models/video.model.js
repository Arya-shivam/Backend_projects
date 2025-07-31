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
        required: true
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
    channel:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"Channel"
    },
    tags: [{ type: String }],
    category: {
        type: String,
        enum: ['Gaming', 'Music', 'Sports', 'News', 'Entertainment', 'Education', 'Technology', 'Lifestyle', 'Other'],
        default: 'Other'
    },
    visibility: {
        type: String,
        enum: ['public', 'unlisted', 'private'],
        default: 'public'
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
},
{timestamps:true}
)

VideoSchema.plugin(mongooseAggregatePaginate)

// Add indexes for better search and query performance
VideoSchema.index({ title: 'text', description: 'text', tags: 'text' });
VideoSchema.index({ category: 1 });
VideoSchema.index({ visibility: 1 });
VideoSchema.index({ owner: 1 });
VideoSchema.index({ channel: 1 });
VideoSchema.index({ views: -1 });
VideoSchema.index({ createdAt: -1 });

export const Video = mongoose.model("Video",VideoSchema)