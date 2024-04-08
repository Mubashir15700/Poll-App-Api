import mongoose, { Schema } from "mongoose";
const PollOptionSchema = new Schema({
    value: { type: String, required: true },
    numberOfPolls: { type: Number, default: 0 }
});
const PollSchema = new Schema({
    question: { type: String, required: true },
    options: [PollOptionSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
PollSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });
export default mongoose.model("Poll", PollSchema);
