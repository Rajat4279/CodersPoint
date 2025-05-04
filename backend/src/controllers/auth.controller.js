// import dependencies
import bcrypt from "bcryptjs";
import {db} from "../lib/db.js";
import ApiError from "../lib/api-error.js";
import ApiResponse from "../lib/api-response.js";
import { UserRole } from "../generated/prisma/index.js";
import logger from "../logger/index.js";
import { generateJwtToken } from "../lib/generate-jwt.js";

export const register = async(req, res) =>{
    const {email, password, name} = req.body;

    if(!name || !email || !password) {
        logger.error("Please provide all the fields.");
        const error = new ApiError(400, "Please provide all the fields.");
        return res.status(error.statusCode).json(error);
    }

    try {
        const existingUser = await db.user.findUnique({
            where:{email},
        });
    
        if(existingUser){
            const error = new ApiError(406, "Email already exists.");
            return res.status(error.statusCode).json(error);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                role: UserRole.USER,
            },
            select:{
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        const token = generateJwtToken(user.id);

        const cookieOptions = {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "production",
            maxAge: 24*60*60*1000
        };

        res.cookie("JWT", token, cookieOptions);

        return res.status(201).json(
            new ApiResponse(201, "User created successfully.", user)
        );
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error in registering user.");
        res.status(500).json(error);
    }
};
export const login = async(req, res) =>{
    const {email, password} = req.body;

    if(!email || !password) {
        logger.error("Please provide all the fields.");
        const error = new ApiError(400, "Please provide all the fields.");
        return res.status(error.statusCode).json(error);
    }

    try {
        const user = await db.user.findUnique({
            where:{email},
        });

        if(!user){
            const error = new ApiError(404, "Invalid email or password.");
            return res.status(error.statusCode).json(error);
        }

        const isMatched = await bcrypt.compare(password, user.password);

        if(!isMatched){
            const error = new ApiError(404, "Invalid email or password.");
            return res.status(error.statusCode).json(error);
        }

        const token = generateJwtToken(user.id);

        const cookieOptions = {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "production",
            maxAge: 24*60*60*1000
        };

        res.cookie("JWT", token, cookieOptions);

        const data = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }

        return res.status(200).json(
            new ApiResponse(200, "User logged in successfully.", data)
        );
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error in logging in user.");
        res.status(500).json(error);
    }
} 
export const logout = async(_, res) =>{
    try {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "production",
            maxAge: 0,
            sameSite: "strict"
        }
        res.cookie("JWT", "", cookieOptions);
        // res.clearCookie("JWT", cookieOptions);

        return res.status(200).json(
            new ApiResponse(200, "User logged out successfully.")
        );
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error in logging out user.");
        res.status(500).json(error);
    }
} 
export const check = async(req, res) =>{
    const user = req.user;

    const data = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
    return res.status(200).json(
        new ApiResponse(200, "User logged in successfully.", data)
    );
} 