import express from "express";
import { createNoteController, getNotesController, getNoteByIdController, updateNoteController, deleteNoteController } from "../controllers/noteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createNoteController);
router.get("/", getNotesController);
router.get("/:id", getNoteByIdController);
router.put("/:id", updateNoteController);
router.delete("/:id", deleteNoteController);

export default router;