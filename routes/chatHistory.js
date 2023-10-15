const express = require("express");
const router = express.Router();
const { getdb } = require("../database/database");

router.post("/saveHistory", async (req, res) => {
    const { recepientID, userId, message } = req.body;
    const db = getdb();

    try {
        const chatRecord = {
            sender: {
                userId: userId,
            },
            receiver: {
                userId: recepientID,
            },
            message,
            timestamp: new Date(),
        };

        const result = await db.collection("chatHistory").insertOne(chatRecord);

        if (result.insertedCount === 1) {
            res.status(200).json({
                status: "success",
                message: "Chat history saved successfully!",
            });
        } else {
            res.status(500).json({
                status: "error",
                message: "Failed to save chat history.",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
});

router.post("/loadHistory", async (req, res) => {
    const { recepientID, userId } = req.body;
    const db = getdb();

    try {
        const result = await db.collection("chatHistory").find({

            $or: [
                { "sender.userId": userId, "receiver.userId": recepientID },
                { "sender.userId": recepientID, "receiver.userId": userId },
            ]
        }).toArray();

        if (result.length > 0) {
            res.status(200).json({
                status: "success",
                chatHistory: result
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
});

module.exports = router;
