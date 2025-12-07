import { Router, IRouter } from "express";
import { userController } from "../controllers";
import { authMiddleware } from "../middlewares";

const router: IRouter = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile with wallet
 * @access  Private
 */
router.get(
  "/me",
  authMiddleware,
  userController.getProfile.bind(userController)
);

export default router;
