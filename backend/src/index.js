// import dependencies
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import logger from "./logger/index.js";
import cors from "cors";

// import routes files
import authRoutes from "./routes/auth.route.js";
import problemsRoutes from "./routes/problems.route.js";
import executionRoutes from "./routes/execution.route.js";
import submissionRoutes from "./routes/submission.route.js";
import playlistRoutes from "./routes/playlist.route.js";

// configure dotenv
dotenv.config({
    path: ".env",
});

const app = express();
const port = process.env.PORT;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemsRoutes);
app.use("/api/v1/execute-code", executionRoutes);
app.use("/api/v1/submission", submissionRoutes);
app.use("/api/v1/playlist", playlistRoutes);

// Start server
app.listen(port, () => {
    logger.info(`Server is up and running on PORT ${port}`);
});
