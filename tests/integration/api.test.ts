import request from "supertest";
import { Knex } from "knex";
import app from "../../src/app";
import db from "../../src/config/database";

describe("Wallet API Integration Tests", () => {
  // Test data
  const userA = {
    email: "usera@example.com",
    password: "password123",
    firstName: "User",
    lastName: "A",
  };

  const userB = {
    email: "userb@example.com",
    password: "password123",
    firstName: "User",
    lastName: "B",
  };

  let tokenA: string;
  let tokenB: string;

  // Setup and Teardown
  beforeAll(async () => {
    // Ensure we are in test environment
    if (process.env.NODE_ENV !== "test") {
      throw new Error("Running tests in non-test environment");
    }
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(async () => {
    // Clean database
    await db("transactions").del();
    await db("wallets").del();
    await db("users").del();
  });

  it("should pass health check", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should block onboarding when identity is blacklisted (mocked)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "blacklisted-user@example.com",
      password: "password123",
      firstName: "Black",
      lastName: "Listed",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/blacklisted/i);
  });

  it("should complete a full wallet flow: register -> fund -> transfer -> withdraw", async () => {
    // 1. Register User A
    const resRegisterA = await request(app)
      .post("/api/auth/register")
      .send(userA);
    expect(resRegisterA.status).toBe(201);
    expect(resRegisterA.body.data).toHaveProperty("token");
    tokenA = resRegisterA.body.data.token;
    expect(resRegisterA.body.data.user.email).toBe(userA.email);

    // 2. Register User B
    const resRegisterB = await request(app)
      .post("/api/auth/register")
      .send(userB);
    expect(resRegisterB.status).toBe(201);
    tokenB = resRegisterB.body.data.token;

    // 3. Fund User A's wallet
    const fundAmount = 5000;
    const resFund = await request(app)
      .post("/api/wallets/fund")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ amount: fundAmount });

    expect(resFund.status).toBe(200);
    expect(parseFloat(resFund.body.data.transaction.amount)).toBe(fundAmount);
    expect(resFund.body.data.transaction.type).toBe("fund");

    // Verify Balance A
    const resBalanceA = await request(app)
      .get("/api/wallets/balance")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resBalanceA.body.data.balance).toBe(fundAmount);

    // 4. Transfer from A to B
    const transferAmount = 2000;
    const resTransfer = await request(app)
      .post("/api/wallets/transfer")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        recipientEmail: userB.email,
        amount: transferAmount,
        description: "Test transfer",
      });

    expect(resTransfer.status).toBe(200);
    expect(parseFloat(resTransfer.body.data.transaction.amount)).toBe(
      transferAmount
    );
    expect(resTransfer.body.data.transaction.type).toBe("transfer");

    // 5. Verify Balances after transfer
    // A should have 3000 (5000 - 2000)
    const resBalanceA_After = await request(app)
      .get("/api/wallets/balance")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resBalanceA_After.body.data.balance).toBe(
      fundAmount - transferAmount
    );

    // B should have 2000
    const resBalanceB = await request(app)
      .get("/api/wallets/balance")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(resBalanceB.body.data.balance).toBe(transferAmount);

    // 6. Withdraw from B
    const withdrawAmount = 500;
    const resWithdraw = await request(app)
      .post("/api/wallets/withdraw")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ amount: withdrawAmount });

    expect(resWithdraw.status).toBe(200);

    // Verify B Balance (2000 - 500 = 1500)
    const resBalanceB_After = await request(app)
      .get("/api/wallets/balance")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(resBalanceB_After.body.data.balance).toBe(
      transferAmount - withdrawAmount
    );

    // 7. Check Transaction History for A
    const resHistoryA = await request(app)
      .get("/api/wallets/transactions")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(resHistoryA.status).toBe(200);
    expect(resHistoryA.body.data.transactions).toHaveLength(2); // Fund + Transfer
  });

  it("should prevent transfer if insufficient funds", async () => {
    // Register User C
    const userC = {
      email: "userc@example.com",
      password: "password123",
      firstName: "User",
      lastName: "C",
    };

    const resRegisterC = await request(app)
      .post("/api/auth/register")
      .send(userC);
    const tokenC = resRegisterC.body.data.token;

    // Try transfer without funding
    const resTransfer = await request(app)
      .post("/api/wallets/transfer")
      .set("Authorization", `Bearer ${tokenC}`)
      .send({
        recipientEmail: userA.email,
        amount: 100,
      });

    expect(resTransfer.status).toBe(400); // Bad Request
    expect(resTransfer.body.message).toMatch(/insufficient funds/i);
  });
});
