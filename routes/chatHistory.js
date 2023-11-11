const express = require("express");
const router = express.Router();
const { accounts, chatHistory } = require("../database/database");

router.post("/saveHistory", async (req, res) => {
    const { recipientID, userId, message, time } = req.body;

    const ownerAccount = await accounts.findOne({ username: userId });
    const receiver = await accounts.findOne({ username: recipientID });

    if (!ownerAccount) {
        return res.status(401).json({
            status: "error",
            message: "Invalid user.",
        });
    }

    try {
        const chatRecord = new chatHistory({
            name: {
                user1ID: ownerAccount._id,
                user2ID: receiver._id,
            },
            sender: ownerAccount._id,
            receiver: receiver._id,
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

    try {
        const ownerAccount = await accounts.findOne({ username: userId });

        const receiver = await accounts.findOne({ username: recipientID });

        if (!ownerAccount || !receiver) {
            return res.status(401).json({
                status: "error",
                message: "Invalid user or recipient.",
            });
        }

        const ChatHistory = await chatHistory.find({
            $or: [
                {
                    sender: ownerAccount._id,
                    receiver: receiver._id,
                },
                {
                    sender: receiver._id,
                    receiver: ownerAccount._id,
                },
            ],
        })
            .populate("sender", "username")
            .populate("receiver", "username")
            .exec();

        const chatHistoryWithUsernames = ChatHistory.map((chat) => ({
            sender: chat.sender.username,
            receiver: chat.receiver.username,
            message: chat.message,
            timestamp: chat.timestamp,
        }));

        return res.status(200).json({
            status: "success",
            chatHistory: chatHistoryWithUsernames,
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
    const { userId } = req.body;

    const ownerAccount = await accounts.findOne({ username: userId });

    if (!ownerAccount || ownerAccount.username !== userId) {
        return res.status(403).json({
            status: "error",
            message: "Unauthorized access to delete chat.",
        });
    }

    try {

        await chatHistory.updateMany(
            { "name.user1ID": ownerAccount.username },
            { $set: { "name.user1ID": "" } }
        );

        await chatHistory.updateMany(
            { "name.user2ID": ownerAccount.username },
            { $set: { "name.user2ID": "" } }
        );

        await chatHistory.deleteMany({
            $and: [
                { "name.user1ID": "" },
                { "name.user2ID": "" },
            ],
        });

        return res.status(200).json({
            status: "success",
            message: "Chat history cleared successfully.",
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
//  Room
//

router.post("/saveRoomHistory", async (req, res) => {
    const { recipientID, userId, message, time } = req.body;
    const ownerAccount = await accounts.findOne({ username: userId });
    try {
        const chatRecord = new chatHistory({
            name: ownerAccount.id,
            sender: userId,
            receiver: recipientID,
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
                        { "sender": userId, "receiver": recipientID },
                        { "sender": recipientID, "receiver": userId },
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
                        { "sender": userId, "receiver": recipientID },
                        { "sender": recipientID, "receiver": userId },
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
