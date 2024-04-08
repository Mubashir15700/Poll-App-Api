import express from "express";
import passport from "../config/passport.js";
import { handleGoogleLoginCallback } from "../controllers/controller.js";
const router = express.Router();
// initial google oauth login
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
// Handle Google authentication callback
router.get("/auth/google/callback", handleGoogleLoginCallback);
export default router;
