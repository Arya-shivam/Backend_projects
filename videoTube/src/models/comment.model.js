import mongoose, { Schema } from "mongoose";

const CommentSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    replies: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
}, { timestamps: true });

export const Comment = mongoose.model("Comment", CommentSchema);