const express = require("express");
const router = express.Router();
const { accounts } = require("../database/database");

router.post("/getUsers", async (req, res) => {
    const { user} = req.body;
  });

module.exports = router;