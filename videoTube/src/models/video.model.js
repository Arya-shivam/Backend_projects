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
        type:String,
        required:true,
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"User"
    }
},{timestamps:true}
)

VideoSchema.plugin(mongooseAggregatePaginate)

export const Video = new mongoose.model("Video",VideoSchema)