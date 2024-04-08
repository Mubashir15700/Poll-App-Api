import jwt, { SignOptions } from "jsonwebtoken";

interface TokenPayload {
    userId: string;
    username: string;
}

async function generateToken(payload: TokenPayload): Promise<string> {
    const options: SignOptions = { expiresIn: "7d" };

    return await jwt.sign(payload, process.env.JWT_SECRET_KEY!, options);
}

export default generateToken;
