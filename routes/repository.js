const express = require("express");
const router = express.Router();
const { accounts, repository } = require("../database/database");
const multer = require("multer");
const fs = require('fs');
const path = require("path");
const unzipper = require('unzipper');
const JSZip = require('jszip');


//Repository
router.get("/:username/new-Repository", async (req, res) => {
  const sessionString = req.cookies.sessionToken;
  const username = req.params.username;

  try {
    const user = await accounts.findOne({ session: sessionString });

    if (user) {
      res.render("createRepo", { username: username });
    } else {
      res.status(403).send("Unauthorized");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'zipFile') {
      cb(null, path.resolve(__dirname, '../../../webapp_temp'));
    } else {
      const repositoryName = req.body.name;
      const uploadDir = path.join(__dirname, '../../../uploads', repositoryName);

      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (err) {
        console.error('Error creating repository directory:', err);
        cb(err);
      }
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });





// POST route for creating a new repository
router.post('/createRepository', upload.single('zipFile'), async (req, res) => {
  try {
    const repositoryName = req.body.name;
    const username = req.body.accountId;
    const user = await accounts.findOne({ username });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const existingRepository = await repository.findOne({ name: repositoryName });

    if (existingRepository) {
      return res.status(400).json({ status: 'error', message: 'Repository name already exists' });
    }

    const newRepository = new repository({
      name: repositoryName,
      owner: user._id,
      createdAt: new Date(),
      description: req.body.description,
      visibility: req.body.visibility,
      topics: req.body.topics.split(',').map((topic) => topic.trim()),
      filePaths: [], // Initialize filePaths as an empty array
    });

    const repositoryDirectory = path.join(__dirname, '../../../uploads', repositoryName);

    if (req.file && req.file.fieldname === 'zipFile') {
      const zipFilePath = req.file.path;

      const extractionStream = fs.createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: repositoryDirectory }));

      let extractedFilesCount = 0;

      extractionStream.on('entry', () => {
        extractedFilesCount++;
      });

      extractionStream.on('finish', async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const allFiles = await fs.promises.readdir(repositoryDirectory);
          const filePaths = allFiles.map(fileName => path.join(repositoryDirectory, fileName));
          newRepository.filePaths = filePaths;
          await newRepository.save();
          res.status(200).json({ status: 'success', message: 'Repository created successfully' });
        } catch (err) {
          console.error('Error reading files:', err);
          res.status(500).json({ status: 'error', message: 'Error reading files', error: err });
        }
      });

      extractionStream.on('error', (err) => {
        console.error('Error extracting files:', err);
        res.status(500).json({ status: 'error', message: 'Error extracting files', error: err });
      });
    } else {
      await newRepository.save();
      res.status(200).json({ status: 'success', message: 'Repository created without files' });
    }
  } catch (err) {
    console.error('Error creating repository:', err);
    res.status(500).json({ status: 'error', message: 'Error creating repository', error: err });
  }
});










// Update repository file
router.post("/updateRepositoryFile", upload.single("editedFile"), async (req, res) => {
  try {
    const repositoryName = req.body.repositoryName;
    const editedFile = req.file;

    if (!editedFile) {
      return res.status(400).json({ status: "error", message: "No file uploaded" });
    }

    const existingRepository = await repository.findOne({ name: repositoryName });

    if (!existingRepository) {
      return res.status(404).json({ status: "error", message: "Repository not found" });
    }

    existingRepository.filePath = editedFile.path;
    await existingRepository.save();

    res.status(200).json({ status: "success", message: "Repository file updated successfully" });
  } catch (error) {
    console.error("Error updating repository file:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
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
      filePath: repo.filePaths,
      description: repo.description,
      topics: repo.topics,
    }));

    res.status(200).json({ status: "success", repositories: repositoriesData });
  } catch (error) {
    console.error("Error loading repositories:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});


router.post("/loadPublicRepository", async (req, res) => {
  try {
    const username = req.body.userId;
    const user = await accounts.findOne({ username });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const repositories = await repository.find({ owner: user._id, visibility: "public" });

    const repositoriesData = repositories.map((repo) => ({
      name: repo.name,
      createdAt: repo.createdAt,
      filePath: repo.filePaths,
      description: repo.description,
      topics: repo.topics,
    }));

    res.status(200).json({ status: "success", repositories: repositoriesData });
  } catch (error) {
    console.error("Error loading repositories:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

router.post("/exploreRepository", async (req, res) => {
  try {
    const { query } = req.body;

    const normalizedQuery = new RegExp(query, 'i');

    const repositories = await repository.find({
      $or: [
        { name: { $regex: normalizedQuery } },
        { topics: { $in: [normalizedQuery] } }
      ]
    })
      .select('name createdAt filePaths description topics owner')
      .populate({
        path: 'owner',
        select: 'name'
      });

    const repositoriesData = repositories.map((repo) => ({
      name: repo.name,
      createdAt: repo.createdAt,
      filePath: repo.filePaths,
      description: repo.description,
      topics: repo.topics,
      owner: repo.owner ? repo.owner.name : null
    }));

    res.status(200).json({ status: "success", repositories: repositoriesData });
  } catch (error) {
    console.error("Error loading repositories:", error);
    res.status(500).json({ status: "error", message: "Failed to load repositories" });
  }
});







router.post('/getRepository', async (req, res) => {
  try {
    const { userId, re } = req.body;
console.log(req.body)
    const user = await accounts.findOne({ username: userId });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const repo = await repository.findOne({ owner: user._id, name: re });
    console.log(repo)
    if (!repo) {
      return res.status(404).json({ status: "error", message: "Repository not found" });
    }

    const filePaths = repo.filePaths;

    // Process each file path in the repository
    const fileContents = [];
    const fileNames = [];

    for (const filePath of filePaths) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);

      fileContents.push(fileContent);
      fileNames.push(fileName);
    }

    res.status(200).json({ status: "success", repository: repo, fileContents, fileNames });
  } catch (error) {
    console.error("Error loading repository:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});






router.get('/:username/:repository', (req, res) => {
  const username = req.params.username;
  const repository = req.params.repository;
  res.render("repository", { username: username, repository: repository });
});


module.exports = router;