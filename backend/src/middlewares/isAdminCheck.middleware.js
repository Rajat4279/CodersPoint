// import dependencies
import { UserRole } from "../generated/prisma/index.js";
import ApiError from "../lib/api-error.js";
import { db } from "../lib/db.js";

export const checkAdmin = async(req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await db.user.findUnique({
            where:{id: userId},
        });

        if(!user || user.role !== UserRole.ADMIN){
            const error = new ApiError(403, "Access denied. Admin privileges are required.");
            return res.status(403).json({ error: error.message });
        }

        next();
    } catch (err) {
        logger.error(err);
        const error = new ApiError(500, "Error in checking admin role: ", err);
        res.status(500).json(error);
    }
}