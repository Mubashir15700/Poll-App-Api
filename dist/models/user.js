import mongoose, { Schema } from "mongoose";
// Define the user schema
const UserSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});
// Create and export the User model
export default mongoose.model("User", UserSchema);
