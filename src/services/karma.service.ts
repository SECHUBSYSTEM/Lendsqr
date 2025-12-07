import axios, { AxiosError } from "axios";
import { config } from "../config";

/**
 * KarmaService - Handles integration with Lendsqr Adjutor Karma blacklist API
 * Used to verify users are not blacklisted before onboarding
 */
export class KarmaService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = config.adjutor.baseUrl;
    this.apiKey = config.adjutor.apiKey;
  }

  /**
   * Check if a user identity is blacklisted in Lendsqr Karma
   * @param identity - The identity to check (email, phone number, or BVN)
   * @returns true if blacklisted, false otherwise
   */
  async isBlacklisted(identity: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/verification/karma/${encodeURIComponent(identity)}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      // If the API returns data with success status, user is in blacklist
      return response.data?.status === "success" && !!response.data?.data;
    } catch (error: unknown) {
      // Handle Axios errors specifically
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        // 404 means user not found in blacklist (which is good)
        if (axiosError.response?.status === 404) {
          return false;
        }
        console.error(
          "Karma API error:",
          axiosError.response?.data || axiosError.message
        );
      } else if (error instanceof Error) {
        console.error("Karma API error:", error.message);
      }

      // Fail open for demo purposes - in production, consider failing closed
      return false;
    }
  }
}

// Singleton instance
export const karmaService = new KarmaService();
