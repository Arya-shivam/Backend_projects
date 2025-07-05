import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-paginate-v2";

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
    owner: {
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

CommentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", CommentSchema);