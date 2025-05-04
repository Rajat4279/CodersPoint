// import dependencies
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser"
import logger from './logger/index.js';

// import routes files
import authRoutes from "./routes/auth.route.js";
import problemsRoutes from "./routes/problems.route.js";

// configure dotenv
dotenv.config({
    path: ".env",
});

const app = express();
const port = process.env.PORT;

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemsRoutes);

// Start server
app.listen(port, ()=>{
    logger.info(`Server is up and running on PORT ${port}`);
});