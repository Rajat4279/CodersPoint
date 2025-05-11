import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.middleware.js";

// create router
const router = express.Router();

// import controllers
import { executeCode } from "../controllers/execution.controller.js";

// create routes
router.route("/").post(isLoggedIn, executeCode);

// export router
export default router;