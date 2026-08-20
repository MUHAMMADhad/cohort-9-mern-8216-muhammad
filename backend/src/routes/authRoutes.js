import express from "express";
import { register, login } from "../controllers/authController.js";
import  authMiddleware  from "../middleware/authMiddleware.js";

// Auth routing (register, login)
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
// router.get("/me", authMiddleware, (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: "Authentication successful",
//         user: req.user,
//     });
// });

export default router;