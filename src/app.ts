import express, { Request, Response, Express } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import { errorMiddleware, notFoundMiddleware } from "./middlewares";

// Load environment variables
dotenv.config();

const app: Express = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Demo Credit API is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api", routes);

// 404 handler - must be after all routes
app.use(notFoundMiddleware);

// Global error handler - must be last
app.use(errorMiddleware);

export default app;
