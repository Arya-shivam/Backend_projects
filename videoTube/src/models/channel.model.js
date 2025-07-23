import mongoose, { Schema } from "mongoose";

const ChannelSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    handle: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[a-zA-Z0-9_-]+$/,
        maxlength: 30
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    avatar: {
        type: String, // Cloudinary URL
        default: ""
    },
    banner: {
        type: String, // Cloudinary URL
        default: ""
    },
    subscribersCount: {
        type: Number,
        default: 0
    },
    videosCount: {
        type: Number,
        default: 0
    },
    totalViews: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        enum: ['Gaming', 'Music', 'Sports', 'News', 'Entertainment', 'Education', 'Technology', 'Lifestyle', 'Other'],
        default: 'Other'
    },
    socialLinks: {
        website: { type: String, default: "" },
        twitter: { type: String, default: "" },
        instagram: { type: String, default: "" },
        facebook: { type: String, default: "" }
    }
}, { timestamps: true });

// Index for better performance
ChannelSchema.index({ owner: 1 });
ChannelSchema.index({ handle: 1 });
ChannelSchema.index({ subscribersCount: -1 });

// Virtual for formatted subscriber count
ChannelSchema.virtual('formattedSubscribers').get(function() {
    if (this.subscribersCount >= 1000000) {
        return Math.floor(this.subscribersCount / 1000000) + 'M';
    } else if (this.subscribersCount >= 1000) {
        return Math.floor(this.subscribersCount / 1000) + 'K';
    }
    return this.subscribersCount.toString();
});

// Method to increment subscriber count
ChannelSchema.methods.incrementSubscribers = function() {
    this.subscribersCount += 1;
    return this.save();
};

// Method to decrement subscriber count
ChannelSchema.methods.decrementSubscribers = function() {
    if (this.subscribersCount > 0) {
        this.subscribersCount -= 1;
    }
    return this.save();
};

// Method to increment video count
ChannelSchema.methods.incrementVideos = function() {
    this.videosCount += 1;
    return this.save();
};

// Method to decrement video count
ChannelSchema.methods.decrementVideos = function() {
    if (this.videosCount > 0) {
        this.videosCount -= 1;
    }
    return this.save();
};

export const Channel = mongoose.model("Channel", ChannelSchema);
