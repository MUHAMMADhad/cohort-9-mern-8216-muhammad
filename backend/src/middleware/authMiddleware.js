import jwt from "jsonwebtoken";
import env from "../config/env.js";

// JWT Middleware using Cookies
const authMiddleware = (req, res, next) => {
  try {
    // Read token from HTTP-only cookie
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

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
