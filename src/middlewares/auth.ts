import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Define a custom interface for the decoded token payload
interface UserPayload extends JwtPayload {
    userId: string;
    username: string;
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    // Get the token from request headers, query parameters, or cookies
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Token not provided" });
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as UserPayload;

        // If token is valid, save decoded token payload for later use
        req.user = decoded;
        next();
    } catch (error) {
        // Clear the token from the cookie
        res.clearCookie("jwt");

        // If verification fails, respond with an error
        return res.status(403).json({ message: "Forbidden: Invalid token", error });
    }
};

export default verifyToken;
