const express = require("express");
const request = require("supertest");
const app = express();

// Import the route you want to test
const repositoryRoutes = require("../routes/repository"); // Update with the correct path

// Create mock database functions
const mockAccounts = {
  findOne: jest.fn().mockResolvedValue({ _id: "mockUserId" }),
};

const mockRepository = {
  create: jest.fn().mockResolvedValue({}),
};

jest.mock("../database/database", () => ({
  accounts: mockAccounts,
  repository: mockRepository,
}));

// Use the route in your Express app
app.use(repositoryRoutes);

describe("Test '/createRepository' route", () => {
  it("should create a new repository", async () => {
    const response = await request(app)
      .post("/createRepository")
      .field("name", "Test Repository")
      .field("accountId", "testuser")
      .attach("file", "path-to-your-test-file/example.txt");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      message: "Repository created successfully",
    });

    // Ensure database queries were called as expected
    expect(mockAccounts.findOne).toHaveBeenCalledWith({ username: "testuser" });
    expect(mockRepository.create).toHaveBeenCalledWith({
      name: "Test Repository",
      owner: "mockUserId", // Mocked user ID
      createdAt: expect.any(Date),
      filePath: expect.any(String), // You can use a regex to match the path
    });
  });

  it("should handle a missing user", async () => {
    // Simulate a missing user in the database
    mockAccounts.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post("/createRepository")
      .field("name", "Test Repository")
      .field("accountId", "nonexistentuser")
      .attach("file", "path-to-your-test-file/example.txt");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ status: "error", message: "User not found" });
  });

  it("should handle missing file", async () => {
    const response = await request(app)
      .post("/createRepository")
      .field("name", "Test Repository")
      .field("accountId", "testuser");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ status: "error", message: "No file uploaded" });
  });
});
