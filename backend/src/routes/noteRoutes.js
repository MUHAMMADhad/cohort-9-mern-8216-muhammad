import express from "express";
import { createNoteController, getNotesController, getNoteByIdController, updateNoteController, deleteNoteController } from "../controllers/noteController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { csrfProtection } from "../controllers/authController.js";
import env from "../config/env.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
	"/",
	...(env.COOKIE_SAME_SITE === "none" ? [csrfProtection] : []),
	createNoteController,
);
router.get("/", getNotesController);
router.get("/:id", getNoteByIdController);
router.put(
	"/:id",
	...(env.COOKIE_SAME_SITE === "none" ? [csrfProtection] : []),
	updateNoteController,
);
router.delete(
	"/:id",
	...(env.COOKIE_SAME_SITE === "none" ? [csrfProtection] : []),
	deleteNoteController,
);

export default router;