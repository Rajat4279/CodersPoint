import { db } from "../lib/db.js";
import ApiResponse from "../lib/api-response.js";

export const getAllSubmission = async (req, res) => {
    try {
        const userId = req.user.id;

        const submissions = await db.submission.findMany({
            where: { userId },
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Successfully fetched all submissions.",
                    submissions
                )
            );
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error in fetching all submission.");
        res.status(500).json(error);
    }
};

export const getSubmissionById = async (req, res) => {
    try {
        const userId = req.user.id;
        const problemId = req.params.problemId;
        const submissions = await db.submission.findMany({
            where: { userId, problemId },
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Successfully fetched submissions.",
                    submissions
                )
            );
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error in fetching submissions.");
        res.status(500).json(error);
    }
};

export const getSubmissionCount = async (req, res) => {
    try {
        const problemId = req.params.problemId;

        const submissionCount = await db.submission.count({
            where: {
                problemId,
            },
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Successfully fetched submission count.",
                    submissionCount
                )
            );
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error in fetching submission count.");
        res.status(500).json(error);
    }
};
