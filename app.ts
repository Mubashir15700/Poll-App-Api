import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToDatabase from "./src/config/dbConnection.js";
import router from "./src/routes/routes.js";

// Call the function to establish MongoDB connection
connectToDatabase();

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN, // Allow requests from this origin
    methods: "GET,POST,DELETE", // Allow only specified HTTP methods
    credentials: true,
    allowedHeaders: "Content-Type,Authorization", // Allow only specified headers
}));
app.use(cookieParser());

app.use("/", router);

// Global error handler middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

const port = process.env.PORT;

app.listen(port, () => {
    console.log("Server up");
});
