const express = require("express");
const router = express.Router();
const { db, Account, File } = require("../database/database");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, "../uploads");
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

router.post("/createRepository", upload.single("file"), async (req, res) => {
    try {
        const newRepository = new File({
            name: req.body.name,
            owner: req.body.accountId,
            createdAt: new Date(),
            filePath: req.file.path,
        });

        await newRepository.save();

        res.status(201).json({ message: "Repository created successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
