const mongoose = require("mongoose");

const databaseUrl = "mongodb://127.0.0.1:27017/webapp";
// const databaseUrl = "mongodb+srv://mayur68:IF8QYZLtEzm7kR6@cluster0.bpkmyqk.mongodb.net/?retryWrites=true&w=majority";

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
  First_name: String,
  Last_name: String,
  gender: String,
  DOB: Date,
  email: String,
  region: String,
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
  visibility: String,
  description: String,
  createdAt: Date,
  filePath: String,
  topics: [String],
  collaboraters: [String],
  permissions: [String]
}, {
  collection: 'repository'
});

const repository = mongoose.model("repository", fileSchema);

const chatHistorySchema = new mongoose.Schema({
  sender: {
    userID: String,
  },
  receiver: {
    userID: String,
  },
  message: String,
  timestamp: Date,
}, {
  collection: 'chatHistory'
});

const chatHistory = mongoose.model("chatHistory", chatHistorySchema);

const roomsSchema = new mongoose.Schema({
  name: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts"
  },
  description: String,
  timestamp: Date,
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts"
  }]
}, {
  collection: 'rooms'
});

const rooms = mongoose.model("rooms", roomsSchema);

module.exports = { db, accounts, repository, chatHistory, rooms };
