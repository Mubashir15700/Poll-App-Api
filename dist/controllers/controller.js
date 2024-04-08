var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import passport from "passport";
import generateToken from "../utils/generateToken.js";
import setCookie from "../utils/setCookie.js";
export const handleGoogleLoginCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    passport.authenticate("google", (err, user, info) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.log("err: ", err);
            // Handle authentication error
            return res.redirect(`${process.env.CORS_ORIGIN}?error=${encodeURIComponent(err.message)}`);
        }
        if (!user) {
            // Handle authentication failure
            return res.redirect(`${process.env.CORS_ORIGIN}?error=Authentication failed`);
        }
        console.log("dfdsfsdfs");
        // Generate JWT token
        const token = yield generateToken(user._id);
        // Set JWT token in response cookie
        setCookie(res, "jwt", token);
        console.log("xcvxvxcv");
        // Redirect user to success page
        return res.redirect(`${process.env.CORS_ORIGIN}`);
    }))(req, res);
});
