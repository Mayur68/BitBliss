const express = require("express");
const router = express.Router();
const mongoose = require('mongoose')
const { accounts, rooms, notification } = require("../database/database");
const multer = require('multer');
const fs = require('fs');
const path = require('path');


router.post("/notifications", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username not provided' });
    }
    const user = await accounts.findOne({ username: username });
    const userNotification = await notification.findOne({ username: user._id });

    if (!userNotification) {
      return res.status(404).json({ message: 'User not found' });
    }

    const friendRequests = userNotification.friendRequests || [];

    const friendRequestsUsernames = await Promise.all(
      friendRequests.map(async (friendID) => {
        try {
          const friend = await accounts.findOne({ _id: friendID });
          return friend ? friend.username : null;
        } catch (error) {

          console.error("Error fetching friend:", error);
          return null;
        }
      })
    );

    return res.status(200).json({ status: 'success', userNotification, friendRequests: friendRequestsUsernames });
  } catch (error) {

    console.error("Unexpected error:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.post("/:username/:repositoryName", async (req, res) => { });

router.get("/Explore/:promt", async (req, res) => {
  try {
    const promt = req.params.promt;
    res.render("explore", { promt: promt });
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




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const roomName = req.body.roomName;
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
  const { owner, roomName, Description, members } = req.body;

  try {

    if (!owner || !roomName || !members || !Description) {
      return res.status(400).json({
        status: "error",
        message: "Required fields are missing in the request.",
      });
    }

    if (members.length > 10) {
      return res.status(400).json({
        status: "error",
        message: "Exceeded the limit of 10 members per room.",
      });
    }

    const ownerAccount = await accounts.findOne({ username: owner });
    const room = await rooms.findOne({ roomName: roomName });

    if (!ownerAccount) {
      return res.status(400).json({
        status: "error",
        message: "Owner account not found.",
      });
    }

    const memberAccountsPromises = members.map(async (memberUsername) => {
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

    room.name = roomName;
    room.owner = ownerAccount._id;
    room.members = memberIds;
    room.description = Description;
    room.timestamp = new Date();

    let profilePhoto = req.file;
    const originalname = roomName;
    const photoDirectory = path.join(__dirname, '../roomProfilePhotos', originalname);
    const filePath = path.join(photoDirectory, profilePhoto.originalname);

    await fs.promises.mkdir(photoDirectory, { recursive: true });
    fs.renameSync(profilePhoto.path, filePath);
    room.profilePhoto = `/roomProfilePhotos/${originalname}/${profilePhoto.originalname}`;

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



router.post("/addFriend", async (req, res) => {
  const { userId, friendId } = req.body;

  if (!userId || !friendId || userId === friendId) {
    return res.status(400).json({
      status: "error",
      message: "Invalid request. Both userId and friendId are required and must be different.",
    });
  }

  try {
    const [user, friend] = await Promise.all([
      accounts.findOne({ username: userId }),
      accounts.findOne({ username: friendId }),
    ]);

    if (!user || !friend) {
      return res.status(404).json({
        status: "error",
        message: "User or friend not found!",
      });
    }

    if (user.friends.includes(friend._id) && friend.friends.includes(user._id)) {
      return res.status(400).json({
        status: "error",
        message: "Friend already exists!",
      });
    }

    const addFriendToUser = async (user, friendId) => {
      if (!user.friends.includes(friendId)) {
        user.friends.push(friendId);
        await user.save();
      } else {
        const friendIndex = user.friends.indexOf(friendId);
        user.friends[friendIndex] = friendId;
        await user.save();
      }
    };

    await Promise.all([
      addFriendToUser(user, friend._id),
      addFriendToUser(friend, user._id),
    ]);


    const requestingUser = await notification.findOneAndUpdate(
      { username: user._id },
      { $pull: { friendRequests: friend._id } },
      { new: true }
    );

    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }

    res.json({
      status: "success",
      message: "Friend added successfully!",
    });
  } catch (err) {
    console.error("Error adding a friend:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

router.post("/deleteFriendRequest", async (req, res) => {
  const { userId, friendId } = req.body;

  if (!userId || !friendId || userId === friendId) {
    return res.status(400).json({
      status: "error",
      message: "Invalid request. Both userId and friendId are required and must be different.",
    });
  }

  try {
    const [user, friend] = await Promise.all([
      accounts.findOne({ username: userId }),
      accounts.findOne({ username: friendId }),
    ]);

    if (!user || !friend) {
      return res.status(404).json({
        status: "error",
        message: "User or friend not found!",
      });
    }

    const requestingUser = await notification.findOneAndUpdate(
      { username: user._id },
      { $pull: { friendRequests: friend._id } },
      { new: true }
    );

    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }

    res.json({
      status: "success",
      message: "Request removed successfully!",
    });
  } catch (err) {
    console.error("Error ", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});


module.exports = router;