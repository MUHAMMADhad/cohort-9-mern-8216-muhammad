import pino from "pino";
import env from "./env.js"

const logger = pino({
    level: "info",

    redact: ["req.headers.authorization", "req.headers.cookie",],

    ...(env.NODE_ENV === "development" && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
            },
        },
    }),
});

export default logger;