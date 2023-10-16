const socketIO = require("socket.io");
const { getdb } = require("../database/database");
db = getdb();

function setupSocket(server) {
  const io = socketIO(server);
  const connectedUsers = {};
  const connectedUsers1 = [];

  io.on("connection", (socket) => {
    socket.on("authenticate", (data) => {
      const { userID } = data;
      socket.userID = userID;
      connectedUsers[userID] = socket.id;
      connectedUsers1.push(userID);
      loadFriends(io, socket, connectedUsers1);
    });

    socket.on("send_message", (data) => {
      const { senderID, recipientID, message } = data;
      if (recipientID && connectedUsers[recipientID]) {
        io.to(connectedUsers[recipientID]).emit("receiveMsg", {
          senderID,
          message,
        });
      }
      // else {
      //   console.log("Recipient not found for sender:", senderID);
      // }
    });

    socket.on('CreateRoom', (data) => {
      const { userID, roomName } = data;
      socket.join(roomName);
    })

    socket.on("disconnect", () => {
      const userID = socket.userID;
      delete connectedUsers[userID];
      const index = connectedUsers1.indexOf(userID);
      if (index !== -1) {
        connectedUsers1.splice(index, 1);
      }
    });
  });
}


async function loadFriends(io, socket, connectedUsers1) {
  const userID = socket.userID;

  try {
    const user = await db.collection("accounts").findOne({ username: userID });
    if (!user) {
      console.log("User not found with userID:", userID);
      return;
    }

    const onlineFriends = [];
    const friends = user.friends || [];
    friends.forEach((friendID) => {
      if (connectedUsers1.indexOf(friendID) >= 0) {
        onlineFriends.push(friendID);
      }
    });

    socket.emit("Friends", { friends });
    socket.emit("onlineFriends", { onlineFriends });
  } catch (error) {
    console.error("Error loading friends:", error);
  }
}

module.exports = setupSocket;