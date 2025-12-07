import { Request, Response, NextFunction } from "express";
import { userService } from "../services";
import { generateToken } from "../middlewares";
import { successResponse, createdResponse } from "../utils/response";
import { BadRequestError } from "../utils/errors";

/**
 * AuthController - Handles authentication endpoints
 */
export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        throw new BadRequestError(
          "All fields are required: email, password, firstName, lastName"
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestError("Invalid email format");
      }

      // Validate password length
      if (password.length < 6) {
        throw new BadRequestError("Password must be at least 6 characters");
      }

      const result = await userService.createUser({
        email,
        password,
        firstName,
        lastName,
      });

      const token = generateToken(result.user.id);

      createdResponse(res, "User registered successfully", {
        user: result.user,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new BadRequestError("Email and password are required");
      }

      const user = await userService.validateCredentials(email, password);
      const token = generateToken(user.id);

      successResponse(res, "Login successful", {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }
}

// Singleton instance
export const authController = new AuthController();
