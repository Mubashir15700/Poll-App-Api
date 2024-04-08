import mongoose, { Schema, Document } from "mongoose";

interface PollOption {
    value: string;
    votedUsers: mongoose.Types.ObjectId[];
}

interface Poll extends Document {
    question: string;
    creator: mongoose.Types.ObjectId;
    options: PollOption[];
    createdAt: Date;
}

const PollOptionSchema: Schema = new Schema({
    value: { type: String, required: true },
    votedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }]
});

const PollSchema: Schema = new Schema({
    question: { type: String, required: true },
    options: [PollOptionSchema],
    createdAt: { type: Date, default: Date.now },
    creator: { type: Schema.Types.ObjectId, ref: "User" }
});

PollSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model<Poll>("Poll", PollSchema);
