import { Router, IRouter } from "express";
import { walletController } from "../controllers";
import { authMiddleware } from "../middlewares";

const router: IRouter = Router();

// All wallet routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/wallets/balance
 * @desc    Get wallet balance
 * @access  Private
 */
router.get("/balance", walletController.getBalance.bind(walletController));

/**
 * @route   POST /api/wallets/fund
 * @desc    Fund wallet
 * @access  Private
 */
router.post("/fund", walletController.fund.bind(walletController));

/**
 * @route   POST /api/wallets/transfer
 * @desc    Transfer funds to another user
 * @access  Private
 */
router.post("/transfer", walletController.transfer.bind(walletController));

/**
 * @route   POST /api/wallets/withdraw
 * @desc    Withdraw funds from wallet
 * @access  Private
 */
router.post("/withdraw", walletController.withdraw.bind(walletController));

/**
 * @route   GET /api/wallets/transactions
 * @desc    Get transaction history
 * @access  Private
 */
router.get(
  "/transactions",
  walletController.getTransactions.bind(walletController)
);

export default router;
