import mongoose, { Schema } from "mongoose";

const SubscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "Channel",
        required: true
    }
}, { timestamps: true });

// Add indexes for better performance
SubscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });
SubscriptionSchema.index({ channel: 1 });
SubscriptionSchema.index({ subscriber: 1 });

export const Subscription = mongoose.model("Subscription", SubscriptionSchema);