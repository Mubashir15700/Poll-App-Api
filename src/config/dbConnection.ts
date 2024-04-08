import mongoose from "mongoose";

// Define MongoDB connection URL
const mongoDBUrl: string = process.env.DB_URI!;

// Function to establish MongoDB connection
export function connectToDatabase(): void {
    // Connect to MongoDB
    mongoose.connect(mongoDBUrl);

    // Get Mongoose connection
    const db = mongoose.connection;

    // Handle connection events
    db.on("error", (error) => {
        console.error("MongoDB connection error:", error);
    });

    db.once("open", () => {
        console.log("Connected to MongoDB successfully!");
    });
}

export default connectToDatabase;
