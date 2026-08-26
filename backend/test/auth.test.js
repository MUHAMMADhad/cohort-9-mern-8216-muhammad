import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";

const testUser = {
  name: "Login Test User",
  email: `login-${Date.now()}@example.com`,
  password: "Password123!",
};

// Check Authentication API health status!
describe("Authentication API", function () {
  describe("GET /api/v1/health", function () {
    it("should return good health status", async function () {
      const response = await request(app).get("/api/v1/health");

      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
      expect(response.body.message).to.equal("Authentication API is running");
    });
  });
});

// Registration API Testing
// When required fields are missing!
describe("Registration API testing", function () {
  describe("POST /api/v1/auth/register", function () {
    it("should reject when required fields are missing", async function () {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({});

      expect(response.status).to.equal(400);
      expect(response.body.success).to.equal(false);
    });

    // When fields are not string!
    it("should reject when registration fields are not strings", async function () {
      const response = await request(app).post("/api/v1/auth/register").send({
        name: 123,
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).to.equal(400);
      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal(
        "Name, email and password must be strings",
      );
    });

    // Rejects when password exceeding 72 bytes
    it("should reject a password exceeding 72 bytes", async function () {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Test User",
          email: `test-${Date.now()}@example.com`,
          password: `a`.repeat(73),
        });

      expect(response.status).to.equal(400);
      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal(
        "Password must not exceed 72 bytes",
      );
    });

    // Register New User successfully
    it("should register a new user successfully", async function () {
      const email = `test-${Date.now()}@example.com`;

      const response = await request(app).post("/api/v1/auth/register").send({
        name: "Test User",
        email,
        password: "Password123!",
      });

      expect(response.status).to.equal(201);
      expect(response.body.success).to.equal(true);
      expect(response.body.message).to.equal("User registered successfully");
      expect(response.body.user).to.exist;
      expect(response.body.user.email).to.equal(email);
    });

    // Rejects an already registered email
    it("should reject an already registered email", async function () {
      const email = `duplicate-${Date.now()}@example.com`;

      await request(app).post("/api/v1/auth/register").send({
        name: "Test User",
        email,
        password: "Password123!",
      });

      const response = await request(app).post("/api/v1/auth/register").send({
        name: "Another User",
        email,
        password: "Password123!",
      });

      expect(response.status).to.equal(409);
      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal("Email is already registered");
    });
  });
});

describe("POST /api/v1/auth/login", function () {
  before(async function () {
    await request(app).post("/api/v1/auth/register").send(testUser);
  });
  // Reject login when fields are not strings
  it("should reject login when fields are not strings", async function () {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: 123,
      password: "Password123!",
    });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal(
      "Email and password must be strings",
    );
  });

  // Reject unknown user email through login
  it("should reject login for an unknown email", async function () {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "does-not-exist@example.com",
      password: "Password123!",
    });

    expect(response.status).to.equal(401);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("Invalid email or password");
  });

  // Incorrect password rejection
  it("should reject login with an incorrect password", async function () {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: "WrongPassword123!",
    });

    expect(response.status).to.equal(401);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("Invalid email or password");
  });

  // Password rejection exceeding 72 bytes
  it("should reject a password exceeding 72 bytes", async function () {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: testUser.email,
        password: "a".repeat(73),
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("Password must not exceed 72 bytes");
  });

  // User loggin in and setting up authentication cookies
  it("should login successfully and set authentication cookies", async function () {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.message).to.equal("Login successful");

    expect(response.body.user).to.exist;

    const cookies = response.headers["set-cookie"];

    expect(cookies).to.be.an("array");

    const tokenCookie = cookies.find((cookie) => cookie.startsWith("token="));

    const csrfCookie = cookies.find((cookie) =>
      cookie.startsWith("csrf_token="),
    );

    expect(tokenCookie).to.exist;
    expect(csrfCookie).to.exist;
    expect(tokenCookie).to.include("HttpOnly");
  });

  // Logging out
  describe("POST /api/v1/auth/logout", function () {
    it("should logout successfully", async function () {
      const response = await request(app).post("/api/v1/auth/logout");

      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
      expect(response.body.message).to.equal("Logged out successfully");
    });
  });
});
