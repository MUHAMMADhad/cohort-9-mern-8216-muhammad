import { createNote, getNotesByUserId, getNoteById, updateNote, deleteNote } from "../models/noteModel.js";

// Create a note 
export const createNoteController = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.userId;

        if (!title || !content){
            return res.status(400).json({
                success: false,
                message: "Title and content are required",
            });
        }

        const note = await createNote(userId, title, content);

        return res.status(201).json({
            success: true,
            message: "Note created successfully",
            data: note,
        });
    } catch (error) {
        console.error("Create note error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Get all notes for logged-in user
export const getNotesController = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notes = await getNotesByUserId(userId);

    return res.status(200).json({
        success: true,
        data: notes,
    });
  } catch (error) {
    console.error("Get notes error:", error);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
  }  
};

// Get single note
export const getNoteByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const note = await getNoteById(id, userId);

    if(!note){
        return res.status(404).json({
            success: false,
            message: "Note not found",
        });
    }

    return res.status(200).json({
        success: true,
        data: note,
    });
  } catch (error) {
    console.error("Get note error:", error);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
  }  
};

// Update a note
export const updateNoteController = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.userId;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required",
            });
        }

        const note = await updateNote(
            id,
            userId,
            title,
            content
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note updated successfully",
            data: note,
        });
    } catch (error) {
        console.error("Update note error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Delete a note
export const deleteNoteController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const deletedNote = await deleteNote(id, userId);

        if (!deletedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note deleted successfully",
        });
    } catch (error) {
        console.error("Delete note error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};