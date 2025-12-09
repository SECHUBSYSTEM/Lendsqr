import dotenv from "dotenv";

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),

  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "demo_credit",
    testName: process.env.DB_NAME_TEST || "demo_credit_test",
  },

  adjutor: {
    baseUrl: process.env.ADJUTOR_BASE_URL || "https://adjutor.lendsqr.com/v2",
    apiKey: process.env.ADJUTOR_API_KEY || "",
    appId: process.env.ADJUTOR_APP_ID || "",
    mockBlacklist:
      (process.env.ADJUTOR_MOCK_BLACKLIST || "true").toLowerCase() !== "false",
    mockListedIdentities: (process.env.ADJUTOR_MOCK_BLACKLIST_IDENTITIES || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  },
};
