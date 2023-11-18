const express = require("express");
const router = express.Router();
const { accounts, repository } = require("../database/database");
const path = require("path");


router.get("/Products/BitBlissIDE", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/products.html"));
});

module.exports = router;