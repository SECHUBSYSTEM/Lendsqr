import { v4 as uuidv4 } from "uuid";
import db from "../config/database";
import { toTransactionResponse, TransactionResponse } from "../models";
import { BadRequestError, NotFoundError } from "../utils/errors";

/**
 * WalletService - Handles all wallet operations
 * All financial operations use database transactions for atomicity
 */
export class WalletService {
  /**
   * Get wallet by user ID
   */
  async getWalletByUserId(userId: number) {
    return db("wallets").where("user_id", userId).first();
  }

  /**
   * Get wallet balance
   */
  async getBalance(userId: number): Promise<number> {
    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }
    return typeof wallet.balance === "string"
      ? parseFloat(wallet.balance)
      : wallet.balance;
  }

  /**
   * Fund wallet - add money to account
   * Uses transaction scoping for atomicity
   */
  async fund(
    userId: number,
    amount: number,
    description?: string
  ): Promise<TransactionResponse> {
    if (amount <= 0) {
      throw new BadRequestError("Amount must be greater than zero");
    }

    const transaction = await db.transaction(async (trx) => {
      const wallet = await trx("wallets").where("user_id", userId).first();
      if (!wallet) {
        throw new NotFoundError("Wallet not found");
      }

      // Increment balance
      await trx("wallets").where("id", wallet.id).increment("balance", amount);

      // Create transaction record
      const [transactionId] = await trx("transactions").insert({
        wallet_id: wallet.id,
        type: "fund",
        amount,
        reference: uuidv4(),
        description: description || "Wallet funding",
        status: "completed",
      });

      return trx("transactions").where("id", transactionId).first();
    });

    return toTransactionResponse(transaction);
  }

  /**
   * Transfer funds to another user
   * Uses transaction scoping - both debit and credit happen atomically
   */
  async transfer(
    senderId: number,
    recipientEmail: string,
    amount: number,
    description?: string
  ): Promise<TransactionResponse> {
    if (amount <= 0) {
      throw new BadRequestError("Amount must be greater than zero");
    }

    const transaction = await db.transaction(async (trx) => {
      // Get sender's wallet
      const senderWallet = await trx("wallets")
        .where("user_id", senderId)
        .first();
      if (!senderWallet) {
        throw new NotFoundError("Sender wallet not found");
      }

      // Check sufficient balance
      const currentBalance =
        typeof senderWallet.balance === "string"
          ? parseFloat(senderWallet.balance)
          : senderWallet.balance;

      if (currentBalance < amount) {
        throw new BadRequestError("Insufficient funds");
      }

      // Get recipient
      const recipient = await trx("users")
        .where("email", recipientEmail)
        .first();
      if (!recipient) {
        throw new NotFoundError("Recipient not found");
      }

      // Prevent self-transfer
      if (recipient.id === senderId) {
        throw new BadRequestError("Cannot transfer to yourself");
      }

      // Get recipient's wallet
      const recipientWallet = await trx("wallets")
        .where("user_id", recipient.id)
        .first();
      if (!recipientWallet) {
        throw new NotFoundError("Recipient wallet not found");
      }

      const reference = uuidv4();

      // Debit sender
      await trx("wallets")
        .where("id", senderWallet.id)
        .decrement("balance", amount);

      // Credit recipient
      await trx("wallets")
        .where("id", recipientWallet.id)
        .increment("balance", amount);

      // Create transaction record
      const [transactionId] = await trx("transactions").insert({
        wallet_id: senderWallet.id,
        type: "transfer",
        amount,
        reference,
        recipient_wallet_id: recipientWallet.id,
        description: description || `Transfer to ${recipientEmail}`,
        status: "completed",
      });

      return trx("transactions").where("id", transactionId).first();
    });

    return toTransactionResponse(transaction);
  }

  /**
   * Withdraw funds from wallet
   * Uses transaction scoping for atomicity
   */
  async withdraw(
    userId: number,
    amount: number,
    description?: string
  ): Promise<TransactionResponse> {
    if (amount <= 0) {
      throw new BadRequestError("Amount must be greater than zero");
    }

    const transaction = await db.transaction(async (trx) => {
      const wallet = await trx("wallets").where("user_id", userId).first();
      if (!wallet) {
        throw new NotFoundError("Wallet not found");
      }

      // Check sufficient balance
      const currentBalance =
        typeof wallet.balance === "string"
          ? parseFloat(wallet.balance)
          : wallet.balance;

      if (currentBalance < amount) {
        throw new BadRequestError("Insufficient funds");
      }

      // Decrement balance
      await trx("wallets").where("id", wallet.id).decrement("balance", amount);

      // Create transaction record
      const [transactionId] = await trx("transactions").insert({
        wallet_id: wallet.id,
        type: "withdrawal",
        amount,
        reference: uuidv4(),
        description: description || "Wallet withdrawal",
        status: "completed",
      });

      return trx("transactions").where("id", transactionId).first();
    });

    return toTransactionResponse(transaction);
  }

  /**
   * Get wallet transaction history
   */
  async getTransactions(
    userId: number,
    limit = 20,
    offset = 0
  ): Promise<TransactionResponse[]> {
    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }

    const transactions = await db("transactions")
      .where("wallet_id", wallet.id)
      .orWhere("recipient_wallet_id", wallet.id)
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    return transactions.map(toTransactionResponse);
  }
}

// Singleton instance
export const walletService = new WalletService();
