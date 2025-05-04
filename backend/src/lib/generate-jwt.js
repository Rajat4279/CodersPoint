// install dependencies
import jwt from "jsonwebtoken";

export const generateJwtToken = (userId) => {
    const token = jwt.sign({id: userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1d"});
    return token;
}