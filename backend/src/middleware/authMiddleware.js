import jwt from "jsonwebtoken";
import env from "../config/env.js";

// JWT Middleware
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if Authorization exists
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                success: false,
                message: "Authentication token is required",
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, env.JWT_SECRET);

        // Attach decoded user information to request
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export default authMiddleware;