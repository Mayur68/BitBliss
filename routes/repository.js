const express = require("express");
const router = express.Router();
const { accounts, repository } = require("../database/database");
const multer = require("multer");
const fs = require('fs');
const path = require("path");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const repositoryName = req.body.name;
    const uploadDir = path.join(__dirname, "../../../uploads", repositoryName);

    fs.mkdir(uploadDir, { recursive: true }, (err) => {
      if (err) {
        console.error("Error creating repository directory:", err);
      }
      cb(null, uploadDir);
    });
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/createRepository", upload.single("file"), async (req, res) => {
  const username = req.body.accountId;
  console.log(req.body)
  try {
    const user = await accounts.findOne({ username });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No file uploaded" });
    }

    const repositoryName = req.body.name;
    const repositoryDirectory = path.join(__dirname, "../../../uploads", repositoryName);

    const newRepository = new repository({
      name: repositoryName,
      owner: user._id,
      createdAt: new Date(),
      description: req.description,
      visibility: req.visibility,
      filePath: req.file.path,
      topics: req.body.topics.split(",").map(topic => topic.trim()),
    });

    fs.mkdir(repositoryDirectory, { recursive: true }, async (err) => {
      if (err) {
        console.error("Error creating repository directory:", err);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
      }
      await newRepository.save();

      res.status(200).json({ status: "success", message: "Repository created successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





router.post("/loadRepository", async (req, res) => {
  try {
    const username = req.body.userId;
    const user = await accounts.findOne({ username });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const repositories = await repository.find({ owner: user._id });

    const repositoriesData = repositories.map((repo) => ({
      name: repo.name,
      createdAt: repo.createdAt,
      filePath: repo.filePath,
    }));

    res.status(200).json({ status: "success", repositories: repositoriesData });
  } catch (error) {
    console.error("Error loading repositories:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

router.post("/getRepository", async (req, res) => {
  try {
    const username = req.body.data.userId;
    const repositoryName = req.body.data.repository;

    const user = await accounts.findOne({ username });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const repositories = await repository.find({ owner: user._id, name: repositoryName });

    const repositoriesData = await Promise.all(repositories.map(async (repo) => {
      const repositoryFiles = await getFilesInRepository(repo.name);
      return {
        name: repo.name,
        createdAt: repo.createdAt,
        filePath: repo.filePath,
        files: repositoryFiles,
      };
    }));

    res.status(200).json({ status: "success", repositories: repositoriesData });
  } catch (error) {
    console.error("Error loading repositories:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

// Function to get the list of files in a repository directory
async function getFilesInRepository(repositoryName) {
  return new Promise((resolve, reject) => {
    const repositoryDirectory = path.join(__dirname, "../../../uploads", repositoryName);
    fs.readdir(repositoryDirectory, (err, files) => {
      if (err) {
        console.error("Error reading repository files:", err);
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}


router.get('/:username/:repository', (req, res) => {
  const username = req.params.username;
  const repository = req.params.repository;
  res.render("repository", { username: username, repository: repository });
});


module.exports = router;