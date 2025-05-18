import {
    getJudge0LanguageId,
    poolBatchResults,
    submitBatch,
} from "../lib/judge0.js";
import ApiResponse from "../lib/api-response.js";
import ApiError from "../lib/api-error.js";
import logger from "../logger/index.js";
import { db } from "../lib/db.js";

export const createProblem = async (req, res) => {
    try {
        // get all data from the req.body
        const {
            title,
            description,
            difficulty,
            tags,
            examples,
            constraints,
            testcases,
            codeSnippets,
            referenceSolutions,
        } = req.body;

        // check user role
        if (req.user.role !== "ADMIN") {
            const error = new ApiError(
                403,
                "Access denied. Admin privileges are required."
            );
            return res.status(403).json(error);
        }

        // collect all the errors
        let errors = [];

        if (!referenceSolutions || typeof referenceSolutions !== "object") {
            const error = new ApiError(
                400,
                "Invalid referenceSolution provided."
            );
            return res.status(400).json(error);
        }

        // loop through each reference solution
        for (const [language, solutionCode] of Object.entries(
            referenceSolutions
        )) {
            const languageId = getJudge0LanguageId(language);

            if (!languageId) {
                const error = new ApiError(
                    404,
                    `Language ${language} is not supported.`
                );
                errors.push(error);
                continue;
            }

            // generate array of submission for each test case
            const submissions = testcases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }));

            // send a batch to get all the tokens from Judge0 for each test case
            const submissionResults = await submitBatch(submissions);

            // generate token array
            const submissionTokens = submissionResults.map((res) => res.token);

            // pool the judge0 end point to check whether
            const results = await poolBatchResults(submissionTokens);

            // check if all the testcases passed and accepted
            for (let i = 0; i < results.length; i++) {
                const result = results[i];

                if (result.status.id !== 3) {
                    const error = new ApiError(
                        400,
                        `Testcase ${
                            i + 1
                        } failed for language ${language} with the status id ${
                            result.status.id
                        }`
                    );
                    errors.push(error);
                    continue;
                }
            }
        }

        if (errors.length > 0) {
            return res.status(400).json(errors);
        }

        // save the problem in the DB
        const newProblem = await db.problem.create({
            data: {
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testcases,
                codeSnippets,
                referenceSolutions,
                userId: req.user.id,
            },
        });

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    "Problem created successfully.",
                    newProblem
                )
            );
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error in creating problem.");
        res.status(500).json(error);
    }
};
export const getAllProblems = async (req, res) => {
    try {
        const problems = await db.problem.findMany({
            include: {
                solvedBy: {
                    where: {
                        userId: req.user.id,
                    },
                },
            },
        });

        if (!problems) {
            const error = new ApiError(404, `Problems not found.`);
            return res.status(404).json(error);
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, "Problem fetched successfully.", problems)
            );
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error in fetching problems.");
        res.status(500).json(error);
    }
};

export const getProblemById = async (req, res) => {
    const { id } = req.params;
    try {
        const problem = await db.problem.findUnique({
            where: { id },
        });

        if (!problem) {
            const error = new ApiError(404, `Problem not found.`);
            return res.status(404).json(error);
        }

        console.log(problem);

        return res
            .status(200)
            .json(
                new ApiResponse(200, "Problem fetched successfully.", problem)
            );
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error in fetching problem.");
        res.status(500).json(error);
    }
};

export const updateProblemById = async (req, res) => {
    const { id } = req.params;

    try {
        // get all data from the req.body
        const {
            title,
            description,
            difficulty,
            tags,
            examples,
            constraints,
            testcases,
            codeSnippets,
            referenceSolutions,
        } = req.body;

        // check user role
        if (req.user.role !== "ADMIN") {
            const error = new ApiError(
                403,
                "Access denied. Admin privileges are required."
            );
            return res.status(403).json(error);
        }

        // collect all the errors
        let errors = [];

        if (!referenceSolutions || typeof referenceSolutions !== "object") {
            const error = new ApiError(
                400,
                "Invalid referenceSolution provided."
            );
            return res.status(400).json(error);
        }

        // loop through each reference solution
        for (const [language, solutionCode] of Object.entries(
            referenceSolutions
        )) {
            const languageId = getJudge0LanguageId(language);

            if (!languageId) {
                const error = new ApiError(
                    404,
                    `Language ${language} is not supported.`
                );
                errors.push(error);
                continue;
            }

            // generate array of submission for each test case
            const submissions = testcases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }));

            // send a batch to get all the tokens from Judge0 for each test case
            const submissionResults = await submitBatch(submissions);

            // generate token array
            const submissionTokens = submissionResults.map((res) => res.token);

            // pool the judge0 end point to check whether
            const results = await poolBatchResults(submissionTokens);

            console.log(results);
            // check if all the testcases passed and accepted
            for (let i = 0; i < results.length; i++) {
                const result = results[i];

                if (result.status.id !== 3) {
                    const error = new ApiError(
                        400,
                        `Testcase ${
                            i + 1
                        } failed for language ${language} with the status id ${
                            result.status.id
                        }`
                    );
                    errors.push(error);
                    continue;
                }
            }
        }

        if (errors.length > 0) {
            return res.status(400).json(errors);
        }

        // save the problem in the DB
        await db.problem.update({
            where: { id: id },
            data: {
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testcases,
                codeSnippets,
                referenceSolutions,
                userId: req.user.id,
            },
        });

        return res
            .status(201)
            .json(new ApiResponse(201, "Problem updated successfully."));
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error in updating problem.");
        res.status(500).json(error);
    }
};

export const deleteProblemById = async (req, res) => {
    const { id } = req.params;

    try {
        const problem = await db.problem.findUnique({
            where: { id: id },
        });

        if (!problem) {
            const error = new ApiError(404, `Problem not found.`);
            return res.status(404).json(error);
        }

        await db.problem.delete({
            where: { id: id },
        });

        return res
            .status(200)
            .json(new ApiResponse(200, "Problem deleted successfully."));
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error in deleting problem.");
        res.status(500).json(error);
    }
};

export const getAllSolvedProblemByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const problems = await db.problem.findMany({
            where: {
                solvedBy: {
                    some: {
                        userId,
                    },
                },
            },

            include: {
                solvedBy: {
                    where: {
                        userId,
                    },
                },
            },
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Problems solved by user fetched successfully.",
                    problems
                )
            );
    } catch (err) {
        logger.error(err);
        const error = new ApiError(
            500,
            "Error in fetching problems solved by user."
        );
        res.status(500).json(error);
    }
};
