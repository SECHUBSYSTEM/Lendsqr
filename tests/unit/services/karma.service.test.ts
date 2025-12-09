import axios from "axios";
import { KarmaService } from "../../../src/services/karma.service";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("KarmaService Unit Tests", () => {
  let karmaService: KarmaService;

  beforeEach(() => {
    karmaService = new KarmaService({
      mockBlacklist: false,
      baseUrl: "https://adjutor.test",
      apiKey: "test-key",
      mockListedIdentities: [],
    });
    jest.clearAllMocks();
  });

  it("should return true if user is blacklisted (real call)", async () => {
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

  it("should return true (fail-closed) on other API errors", async () => {
    // Mock 500 Network Error
    const err: any = new Error("Network Error");
    err.isAxiosError = true;

    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedAxios.get.mockRejectedValueOnce(err);

    const result = await karmaService.isBlacklisted("error@example.com");
    expect(result).toBe(true);
  });

  it("should default to fail-closed when no API key and not mocked", async () => {
    const localService = new KarmaService({
      mockBlacklist: false,
      baseUrl: "https://adjutor.test",
      apiKey: "",
      mockListedIdentities: [],
    });

    const result = await localService.isBlacklisted("anyone@example.com");
    expect(result).toBe(true);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("should use mock mode when enabled with explicit identities", async () => {
    const mockService = new KarmaService({
      mockBlacklist: true,
      mockListedIdentities: ["blocked@example.com"],
      apiKey: "unused",
      baseUrl: "https://adjutor.test",
    });

    const blocked = await mockService.isBlacklisted("blocked@example.com");
    const allowed = await mockService.isBlacklisted("clean@example.com");

    expect(blocked).toBe(true);
    expect(allowed).toBe(false);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("should treat identities containing 'blacklisted' as mocked blacklist hits", async () => {
    const mockService = new KarmaService({
      mockBlacklist: true,
      mockListedIdentities: [],
      apiKey: "unused",
      baseUrl: "https://adjutor.test",
    });

    const blocked = await mockService.isBlacklisted("blacklisted-user@test.com");
    expect(blocked).toBe(true);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});
