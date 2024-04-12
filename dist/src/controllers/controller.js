var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import passport from "passport";
import generateToken from "../utils/generateToken.js";
import setCookie from "../utils/setCookie.js";
import PollModal from "../models/poll.js";
export const handleGoogleLoginCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    passport.authenticate("google", (err, user, info) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            // Handle authentication error
            return res.redirect(`${process.env.CORS_ORIGIN}?error=${encodeURIComponent(err.message)}`);
        }
        if (!user) {
            // Handle authentication failure
            return res.redirect(`${process.env.CORS_ORIGIN}?error=Authentication failed`);
        }
        // Generate JWT token
        const token = yield generateToken({ userId: user._id, username: user.username });
        // Set JWT token in response cookie
        setCookie(res, "jwt", token);
        // Redirect user to success page
        return res.redirect(`${process.env.CORS_ORIGIN}/home`);
    }))(req, res);
});
export const logout = (req, res) => {
    // Clear the JWT cookie
    res.clearCookie("jwt");
    // Send a success response with status code 200
    res.status(200).send("Cookie cleared successfully");
};
export const getCurrentUser = (req, res) => {
    const user = req.user;
    res.status(200).send(user);
};
const getPolls = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (creatorId = null, pollId = null) {
    // Define the aggregation pipeline stages
    const pipeline = [
        {
            $lookup: {
                from: "users", // Assuming users collection name is "users"
                localField: "creator",
                foreignField: "_id",
                as: "creatorInfo"
            }
        },
        {
            $unwind: "$creatorInfo"
        },
        {
            $project: {
                question: 1,
                options: {
                    $map: {
                        input: "$options",
                        as: "option",
                        in: {
                            value: "$$option.value",
                            votedUsers: "$$option.votedUsers",
                            voteCount: { $size: "$$option.votedUsers" }
                        }
                    }
                },
                creatorInfo: "$creatorInfo"
            }
        },
        {
            $addFields: {
                totalVotes: {
                    $sum: "$options.voteCount"
                }
            }
        },
        {
            $project: {
                question: 1,
                options: {
                    $map: {
                        input: "$options",
                        as: "option",
                        in: {
                            value: "$$option.value",
                            votedUsers: "$$option.votedUsers",
                            voteCount: "$$option.voteCount",
                            percentage: {
                                $cond: [
                                    { $eq: ["$totalVotes", 0] }, // Check if totalVotes is zero
                                    0, // If true (totalVotes is zero), set percentage to 0
                                    {
                                        $multiply: [
                                            { $divide: ["$$option.voteCount", "$totalVotes"] },
                                            100
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                },
                creatorInfo: 1
            }
        }
    ];
    // If creatorId is provided, add a $match stage to filter polls by creatorId
    if (creatorId) {
        pipeline.unshift({
            $match: {
                creator: new mongoose.Types.ObjectId(creatorId)
            }
        });
    }
    // If pollId is provided, add a $match stage to filter polls by pollId
    if (pollId) {
        pipeline.unshift({
            $match: {
                _id: new mongoose.Types.ObjectId(pollId)
            }
        });
    }
    // Execute the aggregation pipeline
    return yield PollModal.aggregate(pipeline);
});
export const getAllPolls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const polls = yield getPolls();
    res.status(200).send(polls);
});
export const getCreatedPolls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const creatorId = req.query.creatorId;
    const polls = yield getPolls(creatorId);
    // Send the response
    res.status(200).send(polls);
});
export const createNewPoll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract data from the request body
    const { question, userId } = req.body;
    // Map the options array to the required format
    const formattedOptions = question.options.map((option) => ({
        value: option,
        votedUsers: []
    }));
    // Create a new poll object
    const newPoll = new PollModal({
        question: question.text,
        options: formattedOptions,
        creator: userId // Assuming userId is the ID of the creator
    });
    // Save the new poll to the database
    yield newPoll.save();
    return res.status(201).json({ message: "Poll created successfully", poll: newPoll });
});
export const deletePoll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const pollId = req.params.id;
    const poll = yield PollModal.findById(pollId);
    if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
    }
    if (poll.creator.toString() !== userId) {
        // If the logged-in user is not the creator, return a 403 forbidden error
        return res.status(403).json({ message: "You are not authorized to delete this poll" });
    }
    yield PollModal.findByIdAndDelete(pollId);
    return res.status(200).json({ message: "Poll deleted successfully" });
});
export const votePoll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, pollId, selectedOption } = req.body;
    // Find the poll in the database
    const poll = yield PollModal.findById(pollId);
    if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
    }
    // Check if the user has already voted in any other option
    const hasVoted = poll.options.some(option => option.votedUsers.includes(userId));
    if (hasVoted) {
        return res.status(400).json({ message: "You have already voted in this poll" });
    }
    // Find the selected option in the poll options
    const option = poll.options.find(option => option.value === selectedOption);
    if (!option) {
        return res.status(400).json({ message: "Invalid option" });
    }
    // Add the user"s ID to the votedUsers array for the selected option
    option.votedUsers.push(userId);
    // Save the updated poll to the database
    yield poll.save();
    // Fetch the updated poll from the database
    const updatedPoll = yield getPolls(null, pollId);
    if (!updatedPoll) {
        return res.status(404).json({ message: "Updated poll not found" });
    }
    return res.status(200).json({ message: "Vote recorded successfully", poll: updatedPoll[0] });
});
