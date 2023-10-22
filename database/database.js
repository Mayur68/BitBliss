const mongoose = require("mongoose");

const databaseUrl = "mongodb://127.0.0.1:27017/webapp";

mongoose
  .connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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

const accounts = mongoose.model("accounts", accountSchema);

const fileSchema = new mongoose.Schema({
  name: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
  },
  createdAt: Date,
  filePath: String,
}, {
  collection: 'File'
});

const repositories = mongoose.model("repositories", fileSchema);

const chatHistorySchema = new mongoose.Schema({
  sender: {
    userID: String,
  },
  receiver: {
    userID: String,
  },
  message: String,
  timestamp: Date,
});

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

module.exports = { db, accounts, repositories, ChatHistory };
