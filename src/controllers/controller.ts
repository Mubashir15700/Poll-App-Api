import { Request, Response } from "express";
import mongoose from "mongoose";
import passport from "passport";
import generateToken from "../utils/generateToken.js";
import setCookie from "../utils/setCookie.js";
import PollModal from "../models/poll.js";

export const handleGoogleLoginCallback = async (req: Request, res: Response) => {
    passport.authenticate("google", async (err: Error | null, user: any, info: any) => {
        if (err) {
            // Handle authentication error
            return res.redirect(`${process.env.CORS_ORIGIN}?error=${encodeURIComponent(err.message)}`);
        }

        if (!user) {
            // Handle authentication failure
            return res.redirect(`${process.env.CORS_ORIGIN}?error=Authentication failed`);
        }

        // Generate JWT token
        const token = await generateToken({ userId: user._id, username: user.username });

        // Set JWT token in response cookie
        setCookie(res, "jwt", token);

        // Redirect user to success page
        return res.redirect(`${process.env.CORS_ORIGIN}/home`);
    })(req, res);
};

export const logout = (req: Request, res: Response) => {
    // Clear the JWT cookie
    res.clearCookie("jwt");

    // Send a success response with status code 200
    res.status(200).send("Cookie cleared successfully");
};

export const getCurrentUser = (req: Request, res: Response) => {
    const user = req.user;

    res.status(200).send(user);
};

const getPolls = async (creatorId: string | null = null) => {
    // Define the aggregation pipeline stages
    const pipeline: any[] = [
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
                creator: new mongoose.Types.ObjectId(creatorId) // Assuming you're using mongoose and creatorId is a string
            }
        });
    }

    // Execute the aggregation pipeline
    return await PollModal.aggregate(pipeline);
};

export const getAllPolls = async (req: Request, res: Response) => {
    const polls = await getPolls();

    res.status(200).send(polls);
};

export const getCreatedPolls = async (req: Request, res: Response) => {
    const creatorId = req.query.creatorId;

    const polls = await getPolls(creatorId as string | null);

    // Send the response
    res.status(200).send(polls);
};

export const createNewPoll = async (req: Request, res: Response) => {
    // Extract data from the request body
    const { question, userId } = req.body;

    // Map the options array to the required format
    const formattedOptions = question.options.map((option: string) => ({
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
    await newPoll.save();

    return res.status(201).json({ message: "Poll created successfully", poll: newPoll });
};

export const deletePoll = async (req: Request, res: Response) => {
    const pollId = req.params.id;
    // Find the poll by its ID and delete it
    const deletedPoll = await PollModal.findByIdAndDelete(pollId);

    if (!deletedPoll) {
        // If no poll with the given ID was found, return a 404 error
        return res.status(404).json({ message: "Poll not found" });
    }

    // If the poll was successfully deleted, return a success response
    return res.status(200).json({ message: "Poll deleted successfully" });
};

export const votePoll = async (req: Request, res: Response) => {
    const { userId, pollId, selectedOption } = req.body;

    // Find the poll in the database
    const poll = await PollModal.findById(pollId);

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
    await poll.save();

    return res.status(200).json({ message: "Vote recorded successfully" });
};
