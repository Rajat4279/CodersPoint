import { getJudge0LanguageId, poolBatchResults } from "../lib/judge0.js";
import ApiResponse from "../lib/api-response.js"

export const createProblem = async(req, res) =>{
    try {
        // get all data from the req.body
        const {title, description, difficulty, tags, examples, constraints, testcases, codeSnippet, referenceSolution} = req.body;

        // check user role 
        if(req.user.role !== "ADMIN"){
            const error = new ApiError(403, "Access denied. Admin privileges are required.");
            return res.status(403).json({ error: error.message });
        }

        // collect all the errors
        let errors = []

        // loop through each reference solution
        for(const [language, solutionCode] of Object.entries(referenceSolution)){
            const languageId = getJudge0LanguageId(language);

            if(!languageId){
                const error = new ApiError(404, `Language ${language} is not supported.`);
                errors.push(error);
                continue;
                // return res.status(404).json({ error: error.message });
            }

            // generate array of submission for each test case
            const submissions = testcases.map(({input, output})=>({
                    source_code: solutionCode,
                    language_id: languageId,
                    stdin: input,
                    expected_output: output
            }));

            // send a batch to get all the tokens from Judge0 for each test case
            const submissionResults = await submitBatch(submissions);

            // generate token array
            const submissionTokens = submissionResults.map((res)=> res.token);

            // pool the judge0 end point to check whether
            const results = await poolBatchResults(submissionTokens);

            // check if all the testcases passed and accepted
            for(let i = 0 ; i < results.length ; i++){
                const result = results[i];

                if(result.status.id !== 3){
                    const error = new ApiError(400, `Testcase ${i+1} failed for language ${language} with the status id ${result.status.id}`);
                    errors.push(error);
                    continue;
                    // return res.status(400).json(error);
                }
            }
        }

        if(errors.length > 0){
            return res.status(400).json(errors)
        }

        // save the problem in the DB
         const newProblem = await db.problem.create({
            data:{
                title, description, difficulty, tags, examples, constraints, testcases, codeSnippet, referenceSolution, userId: req.user.id
            }
        });

        return res.status(201).json(new ApiResponse(201, "Problem created successfully.", newProblem))
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error in creating problem.");
        res.status(500).json(error);
    }
}
export const getAllProblems = async(req, res) =>{}

export const getProblemById = async(req, res) =>{}

export const updateProblemById = async(req, res) =>{}

export const deleteProblemById = async(req, res) =>{}

export const getAllSolvedProblemByUser = async(req, res) =>{}