const express = require('express');
const router = express.Router();
const { accounts, roomChatHistory, rooms } = require('../database/database');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

router.get("/:roomName/Settings", async (req, res) => {
    try {
        const sessionString = req.cookies.sessionToken;
        const roomName = req.params.roomName;

        if (sessionString) {
            const room = await rooms.findOne({ name: roomName });
            const owner = await accounts.findOne({ _id: room.owner });

            if (owner && sessionString === owner.session) {
                return res.render("roomSettings", { roomName: roomName, username: owner.username });
            }
        }
        res.status(401).send('Unauthorized');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});



router.post("/createRoom", async (req, res) => {
    const { owner, roomName, Description, members } = req.body;

    try {

        if (!owner || !roomName || !members || !Description) {
            console.log("sdfsdfsfsdf")
            return res.status(400).json({
                status: "error",
                message: "Required fields are missing in the request.",
            });
        }

        const existingRoom = await rooms.findOne({ name: roomName });

        if (existingRoom) {
            return res.status(400).json({
                status: "error",
                message: "Room with this name already exists.",
            });
        }


        const ownerAccount = await accounts.findOne({ username: owner });

        if (!ownerAccount) {
            return res.status(400).json({
                status: "error",
                message: "Owner account not found.",
            });
        }

        const membersArray = Array.isArray(members) ? members : [members];

        if (members.length > 10) {
            return res.status(400).json({
                status: "error",
                message: "Exceeded the limit of 10 members per room.",
            });
        }

        const memberAccountsPromises = membersArray.map(async (memberUsername) => {
            const memberAccount = await accounts.findOne({ username: memberUsername });
            return memberAccount;
        });

        const memberAccounts = await Promise.all(memberAccountsPromises);

        if (memberAccounts.some(member => !member)) {
            return res.status(400).json({
                status: "error",
                message: "One or more member usernames are invalid.",
            });
        }

        const memberIds = memberAccounts.map(member => member._id);

        const newRoom = new rooms({
            name: roomName,
            owner: ownerAccount._id,
            members: memberIds,
            description: Description,
            timestamp: new Date(),
        });

        await newRoom.save();

        return res.status(201).json({
            status: "success",
            message: "Room created successfully",
            room: newRoom,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
});




router.post('/loadRoomData', async (req, res) => {
    try {
        const { roomName } = req.body;

        if (!roomName) {
            return res.status(400).json({ message: 'Room name not provided' });
        }

        const room = await rooms.findOne({ name: roomName })
            .populate('owner', 'username')
            .populate('members', 'username');

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const profilePhoto = room.roomProfilePhoto;
        room.roomProfilePhoto = profilePhoto ? `https://g02bq8d9-3000.inc1.devtunnels.ms/${profilePhoto}` : '';

        return res.status(200).json({ status: 'success', room });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to load room data' });
    }
});





const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const roomName = req.body.roomName;
        if (!roomName) {
            return cb(new Error('Room name not provided'));
        }

        const uploadDir = path.join(__dirname, '../roomProfilePhotos', roomName);

        fs.mkdir(uploadDir, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating repository directory:', err);
                cb(err, null);
            } else {
                cb(null, uploadDir);
            }
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

router.post("/updateRoom", upload.single('profilePhoto'), async (req, res) => {
    const { roomName, Description, members } = req.body;

    try {
        if (!roomName || !Description) {
            return res.status(400).json({
                status: "error",
                message: "Required fields are missing in the request.",
            });
        }

        const room = await rooms.findOne({ name: roomName });

        if (!room) {
            return res.status(404).json({
                status: "error",
                message: "Room not found",
            });
        }

        let memberIds = [];

        if (members) {
            const membersArray = Array.isArray(members) ? members : [members];

            if (membersArray.length + room.members.length > 10) {
                return res.status(400).json({
                    status: "error",
                    message: "Exceeded the limit of 10 members per room.",
                });
            }

            const memberAccounts = await accounts.find({ username: { $in: membersArray } });

            if (memberAccounts.length !== membersArray.length) {
                return res.status(400).json({
                    status: "error",
                    message: "One or more member usernames are invalid.",
                });
            }

            memberIds = memberAccounts.map(member => member._id);
        }

        room.name = roomName;
        room.description = Description;
        room.members = memberIds;
        room.timestamp = new Date();

        let profilePhoto = req.file;

        if (profilePhoto) {
            const originalname = roomName;
            const photoDirectory = path.join(__dirname, '../roomProfilePhotos', originalname);
            const filePath = path.join(photoDirectory, profilePhoto.originalname);

            await fs.promises.mkdir(photoDirectory, { recursive: true });
            fs.renameSync(profilePhoto.path, filePath);
            room.roomProfilePhoto = `/roomProfilePhotos/${originalname}/${profilePhoto.originalname}`;
        }

        await room.save();

        return res.status(201).json({
            status: "success",
            message: "Room updated successfully",
            room: room,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
});







router.post('/removeMembers', async (req, res) => {
    try {
        const { roomName, owner, member } = req.body;

        if (!owner || !member) {
            return res.status(400).json({ message: 'Owner or member not provided' });
        }

        const room = await rooms.findOne({ name: roomName });
        const member_ = await accounts.findOne({ username: member });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const updatedMembers = room.members.filter(member => !member.equals(member_._id));

        await rooms.updateOne({ name: roomName }, { $set: { members: updatedMembers } });

        return res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to remove member' });
    }
});




module.exports = router;