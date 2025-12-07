import bcrypt from "bcryptjs";
import db from "../config/database";
import { User, CreateUserDTO, toUserResponse, UserResponse } from "../models";
import { ConflictError, NotFoundError } from "../utils/errors";
import { karmaService } from "./karma.service";

/**
 * UserService - Handles user-related business logic
 * Including registration with blacklist check, login validation
 */
export class UserService {
  /**
   * Create a new user account with wallet
   * Checks Karma blacklist before creation
   */
  async createUser(
    data: CreateUserDTO
  ): Promise<{ user: UserResponse; walletId: number }> {
    // Check if user is blacklisted
    const isBlacklisted = await karmaService.isBlacklisted(data.email);
    if (isBlacklisted) {
      throw new ConflictError("User is blacklisted and cannot be onboarded");
    }

    // Check if email already exists
    const existingUser = await db("users").where("email", data.email).first();
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user and wallet in a transaction
    const result = await db.transaction(async (trx) => {
      const [userId] = await trx("users").insert({
        email: data.email,
        password: hashedPassword,
        first_name: data.firstName,
        last_name: data.lastName,
      });

      const [walletId] = await trx("wallets").insert({
        user_id: userId,
        balance: 0.0,
      });

      const user = await trx("users").where("id", userId).first();

      return { user: user as User, walletId: walletId as number };
    });

    return {
      user: toUserResponse(result.user),
      walletId: result.walletId,
    };
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return db("users").where("email", email).first();
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | undefined> {
    return db("users").where("id", id).first();
  }

  /**
   * Validate user credentials for login
   */
  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundError("Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new NotFoundError("Invalid email or password");
    }

    return user;
  }

  /**
   * Get user with wallet information
   */
  async getUserWithWallet(
    userId: number
  ): Promise<{
    user: UserResponse;
    wallet: { id: number; balance: number } | null;
  }> {
    const user = await db("users").where("id", userId).first();
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const wallet = await db("wallets").where("user_id", userId).first();

    return {
      user: toUserResponse(user as User),
      wallet: wallet
        ? {
            id: wallet.id,
            balance:
              typeof wallet.balance === "string"
                ? parseFloat(wallet.balance)
                : wallet.balance,
          }
        : null,
    };
  }
}

// Singleton instance
export const userService = new UserService();
