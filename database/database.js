const mongoose = require("mongoose");

const databaseUrl = "mongodb://127.0.0.1:27017/webapp";

mongoose
  .connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the MongoDB database");
  })
  .catch((error) => {
    console.error("Error connecting to the MongoDB database:", error);
  });

const db = mongoose.connection;

const accountSchema = new mongoose.Schema({
  profilePhoto: String,
  username: String,
  name: String,
  email: String,
  password: String,
  session: String,
  friends: [String],
  bio: String,
});

const Account = mongoose.model("Account", accountSchema);

const fileSchema = new mongoose.Schema({
  name: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
  createdAt: Date,
  filePath: String,
});

const File = mongoose.model("File", fileSchema);

module.exports = { db, Account, File };
