import { expect } from "chai";
import app from "../src/app.js";
import request from "supertest";
import env from "../src/config/env.js";

describe("Notes API", function () {
  let agent;
  let csrfToken;
  let noteId;

  const testUser = {
    name: "Notes Test User",
    email: `notes-${Date.now()}@example.com`,
    password: "Password123!",
  };

  const testNote = {
    title: "Test Note",
    content: "This is a test note.",
  };

  /*
   * Login before running the protected notes tests.
   * Supertest agent keeps the authentication cookies.
   */
  before(async function () {
    agent = request.agent(app);

    const registerResponse = await agent
      .post("/api/v1/auth/register")
      .send(testUser);

    expect(registerResponse.status).to.equal(201);

    const loginResponse = await agent.post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(loginResponse.status).to.equal(200);
  });

  describe("Proctected Routes", function () {
    it("should reject unauthenticated requests", async function () {
      const response = await request(app).get("/api/v1/notes");

      expect(response.status).to.equal(401);
      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal(
        "Authentication token is required",
      );
    });
  });

  describe("POST /api/v1/notes", function () {
    it("should reject a note with missing fields", async function () {
      const response = await agent.post("/api/v1/notes").send({});

      expect(response.status).to.equal(400);
      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal("Title and content are required");
    });

    it("should reject a note with invalid field types", async function () {
      const response = await agent.post("/api/v1/notes").send({
        title: 123,
        content: "Valid content",
      });

      expect(response.status).to.equal(400);
      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal("Title and content are required");
    });

    it("should reject a note with empty title or content", async function () {
      const response = await agent.post("/api/v1/notes").send({
        title: "   ",
        content: "Valid content",
      });

      expect(response.status).to.equal(400);
      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal("Title and content are required");
    });

    it("should create a note successfully", async function () {
      const req = agent.post("/api/v1/notes").send(testNote);

      if (env.COOKIE_SAME_SITE === "none" && csrfToken) {
        req.set("X-CSRF-Token", csrfToken);
      }

      const response = await req;

      expect(response.status).to.equal(201);
      expect(response.body.success).to.equal(true);
      expect(response.body.message).to.equal("Note created successfully");

      expect(response.body.data).to.exist;
      expect(response.body.data.title).to.equal(testNote.title);
      expect(response.body.data.content).to.equal(testNote.content);

      noteId = response.body.data.id;
    });
  });

  describe("GET /api/v1/notes", function () {
    it("should return the user's notes", async function () {
      const response = await agent.get("/api/v1/notes");

      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
      expect(response.body.data).to.be.an("array");

      const createdNote = response.body.data.find((note) => note.id === noteId);

      expect(createdNote).to.exist;
      expect(createdNote.title).to.equal(testNote.title);
      expect(createdNote.content).to.equal(testNote.content);
    });
  });

  describe("GET /api/v1/notes/:id", function () {
    it("should return a specific note", async function () {
      const response = await agent.get(`/api/v1/notes/${noteId}`);

      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);

      expect(response.body.data).to.exist;
      expect(response.body.data.id).to.equal(noteId);
      expect(response.body.data.title).to.equal(testNote.title);
      expect(response.body.data.content).to.equal(testNote.content);
    });

    it("should return 404 for a non-existent note", async function () {
      const response = await agent.get("/api/v1/notes/999999999");

      expect(response.status).to.equal(404);
      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal("Note not found");
    });
  });

  describe("PUT /api/v1/notes/:id", function () {
    it("should reject invalid note data", async function () {
      const req = agent.put(`/api/v1/notes/${noteId}`).send({
        title: "",
        content: "",
      });

      if (env.COOKIE_SAME_SITE === "none" && csrfToken) {
        req.set("X-CSRF-Token", csrfToken);
      }

      const response = await req;

      expect(response.status).to.equal(400);
      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal("Title and content are required");
    });

    it("should update a note successfully", async function () {
      const updatedNote = {
        title: "Updated Test Note",
        content: "Updated test note content.",
      };

      const req = agent.put(`/api/v1/notes/${noteId}`).send(updatedNote);

      if (env.COOKIE_SAME_SITE === "none" && csrfToken) {
        req.set("X-CSRF-Token", csrfToken);
      }

      const response = await req;

      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
      expect(response.body.message).to.equal("Note updated successfully");

      expect(response.body.data).to.exist;
      expect(response.body.data.id).to.equal(noteId);
      expect(response.body.data.title).to.equal(updatedNote.title);
      expect(response.body.data.content).to.equal(updatedNote.content);
    });
  });

  describe("DELETE /api/v1/notes/:id", function () {
    it("should delete a note successfully", async function () {
      const req = agent.delete(`/api/v1/notes/${noteId}`);

      if (env.COOKIE_SAME_SITE === "none" && csrfToken) {
        req.set("X-CSRF-Token", csrfToken);
      }

      const response = await req;

      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
      expect(response.body.message).to.equal("Note deleted successfully");
    });

    it("should return 404 when deleting a non-existent note", async function () {
      const req = agent.delete(`/api/v1/notes/${noteId}`);

      if (env.COOKIE_SAME_SITE === "none" && csrfToken) {
        req.set("X-CSRF-Token", csrfToken);
      }

      const response = await req;

      expect(response.status).to.equal(404);
      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal("Note not found");
    });
  });
});
