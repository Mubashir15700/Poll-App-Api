import { Request, Response, NextFunction } from "express";

// Define a wrapper function to catch async errors
const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default catchAsync;
