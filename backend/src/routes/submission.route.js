import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.middleware.js";

// create router
const router = express.Router();

// import controllers
import { getAllSubmission, getSubmissionById, getSubmissionCount } from "../controllers/submission.controller.js";

// create routes
router.route("/get-all-submissions").get(isLoggedIn, getAllSubmission);
router.route("/get-submission/:problemId").get(isLoggedIn, getSubmissionById);
router.route("/get-submission-count/:problemId").get(isLoggedIn, getSubmissionCount);

// export router
export default router;