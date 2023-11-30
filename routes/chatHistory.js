const express = require("express");
const router = express.Router();
const { accounts, chatHistory, rooms, roomChatHistory } = require("../database/database");

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
            $and: [
                {
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
                },
                {
                    $or: [
                        {
                            "name.user1ID": ownerAccount._id,
                        },
                        {
                            "name.user2ID": ownerAccount._id,
                        },
                    ],
                }
            ]
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

    try {

        const ownerAccount = await accounts.findOne({ username: userId });

        if (!ownerAccount || ownerAccount.username !== userId) {
            return res.status(403).json({
                status: "error",
                message: "Unauthorized access to delete chat.",
            });
        }

        await chatHistory.updateMany(
            { "name.user1ID": ownerAccount._id },
            { $set: { "name.user1ID": null } }
        );

        await chatHistory.updateMany(
            { "name.user2ID": ownerAccount._id },
            { $set: { "name.user2ID": null } }
        );

        await chatHistory.deleteMany({
            $and: [
                { "name.user1ID": null },
                { "name.user2ID": null },
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
    const { roomName, sender, message, time } = req.body;

    try {
        const senderAccount = await accounts.findOne({ username: sender });
        const room = await rooms.findOne({ name: roomName });

        if (!senderAccount || !room) {
            return res.status(401).json({
                status: "error",
                message: "Invalid user or room.",
            });
        }

        const memberIds = room.members.map(member => member.toString());

        if (room.owner) {
            memberIds.push(room.owner.toString());
        }

        const chatRecord = new roomChatHistory({
            roomName: roomName,
            name: memberIds,
            sender: senderAccount._id,
            message: message,
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
    const { roomName, user } = req.body;
    console.log(req.body)
    try {
        const account = await accounts.findOne({ username: user });

        if (!account) {
            return res.status(401).json({
                status: "error",
                message: "Invalid user.",
            });
        }

        const room = await rooms.findOne({ name: roomName });

        if (!room || !room.members.includes(account._id) || room.owner != account._id) {
            return res.status(401).json({
                status: "error",
                message: "User is not a member of the room or room does not exist.",
            });
        }

        const result = await roomChatHistory.find({
            roomName: roomName,
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


router.post("/clearRoomChat", async (req, res) => {
    const { recipientID, userId } = req.body;

    const Account = await accounts.findOne({ username: userId });

    if (!Account || Account.username !== userId) {
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
                { name: Account._id },
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
