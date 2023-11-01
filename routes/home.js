const express = require("express");
const router = express.Router();
const mongoose = require('mongoose')
const { accounts, rooms } = require("../database/database");



router.post("/notification", async (req, res) => { });

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
  const { owner, roomName, members, description } = req.body;

  try {
    const existingRoom = await rooms.findOne({ owner: owner, name: roomName });

    if (existingRoom) {
      return res.status(400).json({
        status: "error",
        message: "A room with the same name already exists for the owner.",
      });
    }

    const ownerAccount = await accounts.findOne({ username: owner });
    const memberAccounts = await accounts.find({ username: { $in: members } });

    const newRoom = new rooms({
      name: roomName,
      owner: ownerAccount._id,
      members: memberAccounts.map(member => member._id),
      description,
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


router.post("/addFriend", async (req, res) => {
  const { userId, friendId } = req.body;
  
  if (!userId || !friendId || userId === friendId) {
    return res.status(400).json({
      status: "error",
      message: "Invalid request. Both userId and friendId are required and must be different.",
    });
  }

  try {
    const friend = await accounts.findOne({ username: friendId });
    if (!friend) {
      return res.status(404).json({
        status: "error",
        message: "Friend not found!",
      });
    }

    const user = await accounts.findOne({ username: userId });
    if (user && user.friends.includes(friendId)) {
      return res.status(400).json({
        status: "error",
        message: "Friend already exists!",
      });
    }

    if (user) {
      user.friends.push(friendId);
      await user.save();
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

module.exports = router;