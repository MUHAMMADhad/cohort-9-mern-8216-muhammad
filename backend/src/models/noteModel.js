import pool from "../config/db.js";

// Create a note
export const createNote = async (userId, title, content) => {
    const result = await pool.query(
        `INSERT INTO notes(user_id, title, content)
        VALUES($1, $2, $3)
        RETURNING id, user_id, title, content, created_at, updated_at`,
        [userId, title, content]
    );
    return result.rows[0];
};

// Get all notes belonging to a user
export const getNotesByUserId = async (userId) => {
    const result = await pool.query(
        `SELECT id, user_id, title, content, created_at, updated_at
        FROM notes
        WHERE user_id = $1
        ORDER BY created_at DESC`,
        [userId]
    );
    return result.rows;
};

// Get a single note belonging to a user
export const getNoteById = async (noteId, userId) => {
    const result = await pool.query(
        `SELECT id, user_id, title, content, created_at, updated_at
        FROM notes
        WHERE id = $1 AND user_id = $2`,
        [noteId, userId]
    );
    return result.rows[0];
};

// Update a note belonging to a user
export const updateNote = async (noteId, userId, title, content) => {
    const result = await pool.query(
        `UPDATE notes
        SET title = $1,
        content = $2,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND user_id = $4
        RETURNING id, user_id, title, content, created_at, updated_at`,
        [title, content, noteId, userId]
    );
    return result.rows[0];
};

// Delete a note belonging to a user
export const deleteNote = async (noteId, userId) => {
    const result = await pool.query(
        `DELETE FROM notes
        WHERE id = $1 AND user_id = $2
        RETURNING id`,
        [noteId, userId]
    );
    return result.rows[0];
};