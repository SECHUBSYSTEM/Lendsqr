import axios from "axios";
import { KarmaService } from "../../../src/services/karma.service";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("KarmaService Unit Tests", () => {
  let karmaService: KarmaService;

  beforeEach(() => {
    karmaService = new KarmaService();
    jest.clearAllMocks();
  });

  it("should return true if user is blacklisted", async () => {
    // Mock successful response with data (indicating blacklist hit)
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: "success",
        message: "Identity found in karma",
        data: {
          identity: "test@example.com",
          reason: "Loan default",
        },
      },
    });

    const result = await karmaService.isBlacklisted("test@example.com");
    expect(result).toBe(true);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("should return false if user is NOT blacklisted (404 response)", async () => {
    // Mock 404 error (indicating user not found in blacklist)
    const err: any = new Error("Not Found");
    err.isAxiosError = true;
    err.response = { status: 404 };

    mockedAxios.isAxiosError.mockReturnValue(true);
import axios from "axios";
import { KarmaService } from "../../../src/services/karma.service";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("KarmaService Unit Tests", () => {
  let karmaService: KarmaService;

  beforeEach(() => {
    karmaService = new KarmaService();
    jest.clearAllMocks();
  });

  it("should return true if user is blacklisted", async () => {
    // Mock successful response with data (indicating blacklist hit)
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: "success",
        message: "Identity found in karma",
        data: {
          identity: "test@example.com",
          reason: "Loan default",
        },
      },
    });

    const result = await karmaService.isBlacklisted("test@example.com");
    expect(result).toBe(true);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("should return false if user is NOT blacklisted (404 response)", async () => {
    // Mock 404 error (indicating user not found in blacklist)
    const err: any = new Error("Not Found");
    err.isAxiosError = true;
    err.response = { status: 404 };

    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedAxios.get.mockRejectedValueOnce(err);

    const result = await karmaService.isBlacklisted("clean@example.com");
    expect(result).toBe(false);
  });

  it('should throw error on other API errors (Fail-Closed)', async () => {
    // Mock 500 Network Error
    const err: any = new Error('Network Error');
    err.isAxiosError = true;
    
    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedAxios.get.mockRejectedValueOnce(err);

    // Should throw error (Fail Closed)
    await expect(karmaService.isBlacklisted('error@example.com')).rejects.toThrow('Karma check failed');
  });
});
