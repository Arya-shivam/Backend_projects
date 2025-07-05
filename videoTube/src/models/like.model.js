import mongoose, { Schema } from "mongoose";

const LikeSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    }
}, { timestamps: true });

export const Like = mongoose.model("Like", LikeSchema);