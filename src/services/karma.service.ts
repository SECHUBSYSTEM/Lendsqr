import axios from 'axios';
import { config } from '../config';

export class KarmaService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = config.adjutor.baseUrl;
    this.apiKey = config.adjutor.apiKey;
  }

  /**
   * Check if a user identity is blacklisted in the Lendsqr Karma system
   * @param identity - Email or other identifier to check
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

      // If the API returns data, the user is in the blacklist
      return response.data?.status === 'success' && !!response.data?.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // 404 means user is NOT in blacklist - this is good
        if (error.response?.status === 404) {
          return false;
        }
        console.error('Karma API error:', error.message);
      }
      // For demo purposes, fail open (allow user)
      // In production, you might want to fail closed (block user) for security
      return false;
    }
  }
}

export const karmaService = new KarmaService();
