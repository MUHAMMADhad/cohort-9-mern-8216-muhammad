// Model (Database Logic)
import pool from "../config/db.js";

// Creation of User
export const createUser = async (name, email, password) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at, updated_at`,
        [name, email, password]
    );   
    return result.rows[0];
}

// Find user by email
export const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT id, name, email, password, created_at, updated_at
        FROM users
        WHERE email = $1`,
        [email]
    );
    return result.rows[0];
}