const express = require("express");
const router = express.Router();
const { chatHistory } = require("../database/database");

router.post("/saveHistory", async (req, res) => {
    const { recipientID, userId, message } = req.body;
    try {
        const chatRecord = new chatHistory({
            sender: {
                userID: userId,
            },
            receiver: {
                userID: recipientID,
            },
            message,
            timestamp: new Date(),
        });
        const result = await chatRecord.save();


        if (result) {
            return res.status(200).json({
                status: "success",
                message: "Chat history saved successfully!",
            });
        }

        throw new Error("Failed to save chat history.");
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
});

router.post("/loadHistory", async (req, res) => {
    const { recipientID, userId } = req.body;
    try {
        const result = await chatHistory.find({
            $or: [
                { "sender.userID": userId, "receiver.userID": recipientID },
                { "sender.userID": recipientID, "receiver.userID": userId },
            ],
        }).exec();
        
        return res.status(200).json({
            status: "success",
            chatHistory: result,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
});

module.exports = router;
