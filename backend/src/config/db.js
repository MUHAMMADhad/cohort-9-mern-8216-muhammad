import { Pool } from "pg";
import env from "./env.js";
import logger from "./logger.js";

const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
});

export const connectDB = async () => {
    try {
        const client = await pool.connect();

        logger.info("PostgreSQL connected successfully.");
        // Connection started and connected.

        client.release();
        // Then without closing the Postgresql, we return the connection back to the pool.
    } catch (error) {
        logger.error(error, "Database connection failed.");
        process.exit(1);
    }
};

export default pool;