import dotenv from "dotenv";

dotenv.config()

const requiredEnv = (name) => {
    const value = process.env[name];

    if (!value || !value.trim()) {
        throw new Error(`${name} is required`);
    }

    return value;
};

const env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",

    DB_HOST: process.env.DB_HOST,
    DB_PORT: Number(process.env.DB_PORT),
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    
    JWT_SECRET: requiredEnv("JWT_SECRET"),
};

export default env;