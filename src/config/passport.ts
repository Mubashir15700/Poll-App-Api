import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-google-oauth2";
import UserModal from "../models/user.js";

interface User {
    _id: string;
    username: string;
    email: string;
}

passport.use(
    new OAuth2Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "http://localhost:8080/auth/google/callback",
        scope: ["profile", "email"]
    },
        async (accessToken: string, refreshToken: string, profile: any, done: (err: Error | null, user?: User | null) => void) => {
            try {
                const foundUser = await UserModal.findOne({ email: profile.email! });

                if (!foundUser) {
                    await UserModal.create({
                        username: profile.displayName!,
                        email: profile.email!
                    });
                }

                const signedInUser = await UserModal.findOne({ email: profile.email! });

                return done(null, signedInUser);
            } catch (error: any) {
                return done(error, null);
            }
        })
);

passport.serializeUser((user: any, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});

export default passport;
