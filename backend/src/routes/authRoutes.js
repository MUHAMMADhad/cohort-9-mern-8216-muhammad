import express from "express";
import {
	register,
	login,
	logout,
	csrfProtection,
} from "../controllers/authController.js";
import env from "../config/env.js";

// Auth routing (register, login)
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post(
	"/logout",
	...(env.COOKIE_SAME_SITE === "none" ? [csrfProtection] : []),
	logout,
);
// router.get("/me", authMiddleware, (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: "Authentication successful",
//         user: req.user,
//     });
// });

export default router;