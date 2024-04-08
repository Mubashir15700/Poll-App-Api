import express from "express";
import verifyToken from "../middlewares/auth.js";
import catchAsync from "../utils/catchAsync.js";
import passport from "../config/passport.js";
import { handleGoogleLoginCallback, logout, getCurrentUser, getAllPolls, getCreatedPolls, createNewPoll, deletePoll, votePoll } from "../controllers/controller.js";
const router = express.Router();
// initial google oauth login
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
// Handle Google authentication callback
router.get("/auth/google/callback", handleGoogleLoginCallback);
router.post("/auth/logout", catchAsync(logout));
router.get("/auth/verify-token", verifyToken, catchAsync(getCurrentUser));
router.get("/polls", verifyToken, catchAsync(getAllPolls));
router.get("/polls/created", verifyToken, catchAsync(getCreatedPolls));
router.post("/polls/new", verifyToken, catchAsync(createNewPoll));
router.delete("/polls/:id", verifyToken, catchAsync(deletePoll));
router.post("/polls/vote", verifyToken, catchAsync(votePoll));
export default router;
