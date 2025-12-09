import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares";
import { walletService } from "../services";
import { successResponse } from "../utils/response";
import { BadRequestError } from "../utils/errors";

/**
 * WalletController - Handles all wallet operation endpoints
 */
export class WalletController {
  /**
   * Get wallet balance
   * GET /api/wallets/balance
   */
  async getBalance(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const balance = await walletService.getBalance(userId);

      successResponse(res, "Balance retrieved successfully", { balance });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fund wallet
   * POST /api/wallets/fund
   */
  async fund(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { amount, description } = req.body;

      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new BadRequestError(
          "Amount is required and must be a positive number"
        );
      }

      const transaction = await walletService.fund(
        userId,
        numericAmount,
        description
      );

      successResponse(res, "Wallet funded successfully", { transaction });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Transfer funds to another user
   * POST /api/wallets/transfer
   */
  async transfer(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { recipientEmail, amount, description } = req.body;

      const numericAmount = Number(amount);
      if (
        !recipientEmail ||
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        throw new BadRequestError(
          "Recipient email and a positive amount are required"
        );
      }

      const transaction = await walletService.transfer(
        userId,
        recipientEmail,
        numericAmount,
        description
      );

      successResponse(res, "Transfer successful", { transaction });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Withdraw funds from wallet
   * POST /api/wallets/withdraw
   */
  async withdraw(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { amount, description } = req.body;

      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new BadRequestError(
          "Amount is required and must be a positive number"
        );
      }

      const transaction = await walletService.withdraw(
        userId,
        numericAmount,
        description
      );

      successResponse(res, "Withdrawal successful", { transaction });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transaction history
   * GET /api/wallets/transactions
   */
  async getTransactions(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit as string, 10) || 20)
      );
      const offset = Math.max(0, parseInt(req.query.offset as string, 10) || 0);

      const transactions = await walletService.getTransactions(
        userId,
        limit,
        offset
      );

      successResponse(res, "Transactions retrieved successfully", {
        transactions,
      });
    } catch (error) {
      next(error);
    }
  }
}

// Singleton instance
export const walletController = new WalletController();
