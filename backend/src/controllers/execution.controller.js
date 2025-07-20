import { db } from "../lib/db.js";
import {
    getJudge0LanguageName,
    poolBatchResults,
    submitBatch,
} from "../lib/judge0.js";
import ApiResponse from "../lib/api-response.js";
import ApiError from "../lib/api-error.js";
import logger from "../logger/index.js";

export const executeCode = async (req, res) => {
    try {
        const { source_code, language_id, stdin, expected_outputs, problemId } =
            req.body;

        const userId = req.user.id;

        // validate test cases
        if (
            !Array.isArray(stdin) ||
            stdin.length == 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length
        ) {
            const error = new ApiError(400, `Invalid or missing test cases.`);
            return res.status(404).json(error);
        }

        // prepare each test cases for judge0 batch submission
        const submissions = stdin.map((input) => ({
            source_code,
            language_id,
            stdin: input,
        }));

        // send it to judge0 and get tokens
        const submissionTokens = await submitBatch(submissions);

        // generate tokens from submissionTokens
        const tokens = submissionTokens.map((res) => res.token);

        // start pooling judge0
        const results = await poolBatchResults(tokens);

        // check if the expected output is same as we got in result after executing user's source_code
        let allPassed = true;
        const detailedResult = results.map((result, i) => {
            const stdout = result.stdout?.trim();
            const expected_output = expected_outputs[i]?.trim();
            const passed = stdout === expected_output;

            if (!passed) allPassed = false;

            return {
                testcase: i + 1,
                passed,
                stdout,
                expected: expected_output,
                stderr: result.stderr || null,
                compiledOutput: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory} KB` : undefined,
                time: result.time ? `${result.time} s` : undefined,
            };
        });

        // store submission
        const submission = await db.submission.create({
            data: {
                user: { connect: { id: userId } },
                problem: { connect: { id: problemId } },
                sourceCode: source_code,
                language: getJudge0LanguageName(language_id),
                stdin: stdin.join("\n"),
                stdout: JSON.stringify(
                    detailedResult.map((result) => result.stdout)
                ),
                stderr: detailedResult.some((result) => result.stderr)
                    ? JSON.stringify(
                          detailedResult.map((result) => result.stderr)
                      )
                    : null,
                compileOutput: detailedResult.some(
                    (result) => result.compiledOutput
                )
                    ? JSON.stringify(
                          detailedResult.map((result) => result.compiledOutput)
                      )
                    : "",
                status: allPassed ? "Accepted" : "Wrong Answer",
                memory: detailedResult.some((result) => result.memory)
                    ? JSON.stringify(
                          detailedResult.map((result) => result.memory)
                      )
                    : null,
                time: detailedResult.some((result) => result.time)
                    ? JSON.stringify(
                          detailedResult.map((result) => result.time)
                      )
                    : null,
            },
        });

        // All testcases accepted then mark problem from thar user as true
        if (allPassed) {
            await db.problemSolved.upsert({
                where: { userId_problemId: { userId, problemId } }, // reason of userId_problemId is @@unique([userId, problemId]) first userId then problemId
                update: {},
                create: {
                    userId,
                    problemId,
                },
            });
        }

        // Save individual test case result using detailedResult
        const testCaseResult = detailedResult.map((result) => ({
            submissionId: submission.id,
            testCase: result.testcase,
            passed: result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr: result.stderr,
            compiledOutput: result.compiledOutput,
            status: result.status,
            memory: result.memory,
            time: result.time,
        }));

        await db.testCaseResult.createMany({
            data: testCaseResult,
        });

        // Add testcase result in submission db
        const submissionWithTestCase = await db.submission.findUnique({
            where: { id: submission.id },
            include: {
                testcases: true,
            },
        });

        return res
            .status(200)
            .json(
                new ApiResponse(200, "Code executed!.", submissionWithTestCase)
            );
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error in executing problem.");
        res.status(500).json(error);
    }
};
