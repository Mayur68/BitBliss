const express = require("express");
const router = express.Router();
const { db, Account, File } = require("../database/database");


router.post("/createRepository", async (req, res) => {
    try {
        if (!db) {
            console.error("Database connection not established");
            return res.status(500).json({ error: "Internal Server Error" });
        }

        // First, find the user with the provided username
        const user = await Account.findOne({ username: req.body.accountId });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const newRepository = new File({
            name: req.body.name,
            owner: user._id, // Use user._id to get the user's ObjectId
            createdAt: new Date(),
            filePath: req.body.filePath,
        });

        // Save the new repository using Mongoose
        await newRepository.save();

        res.status(201).json({ message: "Repository created successfully" });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
