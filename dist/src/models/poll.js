import mongoose, { Schema } from "mongoose";
const PollOptionSchema = new Schema({
    value: { type: String, required: true },
    votedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }]
});
const PollSchema = new Schema({
    question: { type: String, required: true },
    options: [PollOptionSchema],
    createdAt: { type: Date, default: Date.now },
    creator: { type: Schema.Types.ObjectId, ref: "User" }
});
PollSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });
export default mongoose.model("Poll", PollSchema);
