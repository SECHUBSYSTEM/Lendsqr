// Jest setup file
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Set default timeout
jest.setTimeout(30000);

// Mock UUID to avoid ESM issues
jest.mock("uuid", () => ({
  v4: () => `test-uuid-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
}));
