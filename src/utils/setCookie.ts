import { Response } from "express";

interface CookieOptions {
    maxAge?: number;
    httpOnly?: boolean;
}

const setCookie = (res: Response, cookieName: string, token: string, options: CookieOptions = {}) => {
    const defaultOptions: CookieOptions = {
        maxAge: 60000 * 60 * 24 * 7,
        httpOnly: true,
    };

    const mergedOptions: CookieOptions = { ...defaultOptions, ...options };

    res.cookie(cookieName, token, mergedOptions);
};

export default setCookie;
