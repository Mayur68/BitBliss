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
  First_name: String,
  Last_name: String,
  gender: String,
  DOB: Date,
  email: String,
  region: String,
  password: String,
  session: String,
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
  },],
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
  filePaths: [String],
  topics: [String],
  collaboraters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
  },],
  permissions: [String]
}, {
  collection: 'repository'
});

const repository = mongoose.model("repository", fileSchema);






const chatHistorySchema = new mongoose.Schema({
  name: {
    user1ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
    user2ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
  },
  message: String,
  timestamp: String,
}, {
  collection: 'chatHistory'
});

const chatHistory = mongoose.model("chatHistory", chatHistorySchema);





const roomChatHistorySchema = new mongoose.Schema({
  roomNmae: String,
  names: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
  }],
  roomName: String,
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
  },
  message: String,
  timestamp: String,
}, {
  collection: 'roomChatHistory'
});

const roomChatHistory = mongoose.model("roomChatHistory", roomChatHistorySchema);






const roomSchema = new mongoose.Schema({
  name: String,
  roomProfilePhoto: String,
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

const rooms = mongoose.model("rooms", roomSchema);







const notificationSchema = new mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
  },
  timestamp: Date,
  friendRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts"
  }],
},
  {
    collection: 'notification'
  });

const notification = mongoose.model("notification", notificationSchema);






module.exports = { db, accounts, repository, chatHistory, rooms, roomChatHistory, notification };
