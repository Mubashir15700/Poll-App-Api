import mongoose, { Schema, Document } from "mongoose";

// Define the user schema
export interface User extends Document {
    username: string;
    email: string;
}

// Define the user schema
const UserSchema: Schema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

// Create and export the User model
export default mongoose.model<User>("User", UserSchema);
