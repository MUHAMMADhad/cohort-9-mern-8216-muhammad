import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http"
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";

import logger from "./config/logger.js";

const app = express();
const API_PREFIX = "/api/v1";

// Security Middleware
app.use(helmet());  

// Enable CORS
app.use(cors());

// Parse JSON Request Body
app.use(express.json());

app.use(
    pinoHttp({
        logger,
    })
);

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/notes`, noteRoutes);

// Health Check Route (Testing)
app.get(`${API_PREFIX}/health`, (req, res)=>{
    res.status(200).json({
        success: true,
        message: "Notes API is running",
    });
});
// For testing that an api is running or not! 

export default app;