import { Request, Response, NextFunction } from "express";
import db from "../config/database";
import { UnauthorizedError } from "../utils/errors";

/**
 * Extended Request interface with authenticated user
 */
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

/**
 * Faux token authentication middleware
 * Token format: Base64 encoded JSON { userId: number }
 *
 * Note: This is a simplified authentication for demo purposes.
 * In production, use JWT or similar secure token mechanism.
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];

    // Decode faux token (Base64 encoded JSON)
    let decoded: { userId: number };
    try {
      decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    } catch {
      throw new UnauthorizedError("Invalid token format");
    }

    if (!decoded.userId) {
      throw new UnauthorizedError("Invalid token payload");
    }

    // Verify user exists in database
    const user = await db("users").where("id", decoded.userId).first();

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Attach user to request object
    (req as AuthRequest).user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({
        status: "error",
        message: error.message,
      });
    } else {
      res.status(401).json({
        status: "error",
        message: "Authentication failed",
      });
    }
  }
};

/**
 * Generate a faux authentication token
 * @param userId - The user ID to encode
 * @returns Base64 encoded token
 */
export const generateToken = (userId: number): string => {
  return Buffer.from(JSON.stringify({ userId })).toString("base64");
};
