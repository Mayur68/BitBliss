const express = require("express");
const router = express.Router();
const { accounts, chatHistory } = require("../database/database");

router.post("/saveSendingHistory", async (req, res) => {
    const { recipientID, userId, message, time } = req.body;
    const ownerAccount = await accounts.findOne({ username: userId });
    try {
        const chatRecord = new chatHistory({
            name: ownerAccount.id,
            sender: {
                userID: userId,
            },
            receiver: {
                userID: recipientID,
            },
            message,
            timestamp: time,
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

router.post("/saveRecievingHistory", async (req, res) => {
    const { recipientID, userId, message, time } = req.body;
    const ownerAccount = await accounts.findOne({ username: recipientID });
    try {
        const chatRecord = new chatHistory({
            name: ownerAccount.id,
            sender: {
                userID: userId,
            },
            receiver: {
                userID: recipientID,
            },
            message,
            timestamp: time,
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
    const ownerAccount = await accounts.findOne({ username: userId });
    try {
        const result = await chatHistory.find({
            $and: [
                {
                    $or: [
                        { "sender.userID": userId, "receiver.userID": recipientID },
                        { "sender.userID": recipientID, "receiver.userID": userId },
                    ],
                },
                { name: ownerAccount._id },
            ],
        }).exec();
console.log(result)
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

router.post("/clearChat", async (req, res) => {
    const { recipientID, userId } = req.body;

    const ownerAccount = await accounts.findOne({ username: userId });

    if (!ownerAccount || ownerAccount.username !== userId) {
        return res.status(403).json({
            status: "error",
            message: "Unauthorized access to delete chat.",
        });
    }

    try {
        await chatHistory.deleteMany({
            $and: [
                {
                    $or: [
                        { "sender.userID": userId, "receiver.userID": recipientID },
                        { "sender.userID": recipientID, "receiver.userID": userId },
                    ],
                },
                { name: ownerAccount._id },
            ],
        });

        return res.status(200).json({
            status: "success",
            message: "Chat history deleted successfully.",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
});



//
//
//

router.post("/saveSendingRoomHistory", async (req, res) => {
    const { recipientID, userId, message, time } = req.body;
    const ownerAccount = await accounts.findOne({ username: userId });
    try {
        const chatRecord = new chatHistory({
            name: ownerAccount.id,
            sender: {
                userID: userId,
            },
            receiver: {
                userID: recipientID,
            },
            message,
            timestamp: time,
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

router.post("/saveRecievingRoomHistory", async (req, res) => {
    const { recipientID, userId, message, time } = req.body;
    const ownerAccount = await accounts.findOne({ username: recipientID });
    try {
        const chatRecord = new chatHistory({
            name: ownerAccount.id,
            sender: {
                userID: userId,
            },
            receiver: {
                userID: recipientID,
            },
            message,
            timestamp: time,
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

router.post("/loadRoomHistory", async (req, res) => {
    const { recipientID, userId } = req.body;
    const ownerAccount = await accounts.findOne({ username: userId });
    try {
        const result = await chatHistory.find({
            $and: [
                {
                    $or: [
                        { "sender.userID": userId, "receiver.userID": recipientID },
                        { "sender.userID": recipientID, "receiver.userID": userId },
                    ],
                },
                { name: ownerAccount._id },
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

router.post("/clearRoomChat", async (req, res) => {
    const { recipientID, userId } = req.body;

    const ownerAccount = await accounts.findOne({ username: userId });

    if (!ownerAccount || ownerAccount.username !== userId) {
        return res.status(403).json({
            status: "error",
            message: "Unauthorized access to delete chat.",
        });
    }

    try {
        await chatHistory.deleteMany({
            $and: [
                {
                    $or: [
                        { "sender.userID": userId, "receiver.userID": recipientID },
                        { "sender.userID": recipientID, "receiver.userID": userId },
                    ],
                },
                { name: ownerAccount._id },
            ],
        });

        return res.status(200).json({
            status: "success",
            message: "Chat history deleted successfully.",
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
