import express from "express";
import { register, login, logout } from "../controllers/authController.js";

// Auth routing (register, login)
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
// router.get("/me", authMiddleware, (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: "Authentication successful",
//         user: req.user,
//     });
// });

export default router;