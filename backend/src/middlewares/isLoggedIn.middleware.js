// import dependencies
import jwt from "jsonwebtoken";
import { db } from "../lib/db.js";
import ApiError from "../lib/api-error.js";
import logger from "../logger/index.js ";

export const isLoggedIn = async(req, res, next) => {
    try {
        const token = req.cookies.JWT || req.headers.authorization?.split(" ")[1];
        if (!token) {
            const error = new ApiError(401, "Unauthorized: No token provided.");
            return res.status(401).json(error);
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            const error = new ApiError(401, "Unauthorized: Token invalid.");
            return res.status(401).json(error);
        }

        const user = await db.user.findUnique({
            where: {
                id: decodedToken.id,
            },
            select:{
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                problem: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            const error = new ApiError(404, "User not found.");
            return res.status(404).json(error);
        }

        req.user = user;

        next();
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error occurred while verifying the logged-in user.");
        res.status(500).json(error);
    }
}