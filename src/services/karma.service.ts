import axios, { AxiosError } from "axios";
import { config } from "../config";

interface KarmaServiceOptions {
  baseUrl: string;
  apiKey: string;
  mockBlacklist: boolean;
  mockListedIdentities: string[];
}

/**
 * KarmaService - Handles integration with Lendsqr Adjutor Karma blacklist API
 * Used to verify users are not blacklisted before onboarding
 */
export class KarmaService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly mockBlacklist: boolean;
  private readonly mockListedIdentities: string[];

  constructor(options?: Partial<KarmaServiceOptions>) {
    this.baseUrl = options?.baseUrl || config.adjutor.baseUrl;
    this.apiKey = options?.apiKey ?? config.adjutor.apiKey;
    this.mockBlacklist = options?.mockBlacklist ?? config.adjutor.mockBlacklist;
    this.mockListedIdentities = (
      options?.mockListedIdentities || config.adjutor.mockListedIdentities
    ).map((id) => id.toLowerCase());
  }

  /**
   * Check if a user identity is blacklisted in Lendsqr Karma
   * @param identity - The identity to check (email, phone number, or BVN)
   * @returns true if blacklisted, false otherwise
   */
  async isBlacklisted(identity: string): Promise<boolean> {
    const normalizedIdentity = identity.trim().toLowerCase();

    if (this.mockBlacklist) {
      return this.isMockBlacklisted(normalizedIdentity);
    }

    if (!this.apiKey) {
      // Without an API key we cannot perform a real lookup; fail closed to protect onboarding.
      return true;
    }

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

      // Fail closed to avoid onboarding without a definitive blacklist response
      return true;
    }
  }

  /**
   * Deterministic mock blacklist rule for local/testing flows.
   * - Matches explicit identities from env ADJUTOR_MOCK_BLACKLIST_IDENTITIES
   * - Or any identity containing the word "blacklisted"
   */
  private isMockBlacklisted(identity: string): boolean {
    if (this.mockListedIdentities.includes(identity)) {
      return true;
    }

    return identity.includes("blacklisted");
  }
}

// Singleton instance
export const karmaService = new KarmaService();
