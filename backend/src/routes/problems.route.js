import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.middleware.js";
import { checkAdmin } from "../middlewares/isAdminCheck.middleware.js";

// create router
const router = express.Router();

// import controllers
import { createProblem, deleteProblemById, getAllProblems, getAllSolvedProblemByUser, getProblemById, updateProblemById } from "../controllers/problem.controller.js";

// create routes
router.route("/create-problem").post(isLoggedIn, checkAdmin, createProblem);
router.route("/get-all-problems").get(isLoggedIn, getAllProblems);
router.route("/get-problem/:id").get(isLoggedIn, getProblemById);
router.route("/update-problems/:id").put(isLoggedIn, checkAdmin, updateProblemById);
router.route("/delete-problems/:id").delete(isLoggedIn, checkAdmin, deleteProblemById);
router.route("/get-solved-problems").get(isLoggedIn, getAllSolvedProblemByUser);

// export router
export default router;