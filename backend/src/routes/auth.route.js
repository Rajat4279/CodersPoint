import express from "express";

// create router
const router = express.Router();

// import controllers
import { register, login, logout, check } from "../controllers/auth.controller.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.middleware.js";

// create routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(isLoggedIn, logout);
router.route("/check").get(isLoggedIn, check);

// export router
export default router;