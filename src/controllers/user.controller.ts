import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares';
import { userService } from '../services';
import { successResponse } from '../utils/response';

/**
 * UserController - Handles user profile endpoints
 */
export class UserController {
  /**
   * Get current user profile with wallet
   * GET /api/users/me
   */
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = await userService.getUserWithWallet(userId);

      successResponse(res, 'Profile retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }
}

// Singleton instance
export const userController = new UserController();
