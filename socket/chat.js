const socketIO = require("socket.io");
const { getdb } = require("../database/database");
db = getdb();

function setupSocket(server) {
  const io = socketIO(server);
  const connectedUsers = [];

  io.on("connection", (socket) => {
    connectedUsers.push(socket.id);

    socket.on("authenticate", (data) => {
      const { userID } = data;
      socket.userID = userID;
      loadFriends(io, socket, connectedUsers);
    });

    socket.on("send_message", (data) => {
      const { senderID, recipientID, message } = data;
      if (recipientID) {
        io.to(recipientID).emit("new_message", {
          senderID,
          message,
        });
      } else {
        console.log("Recipient not found for sender:", senderID);
      }
    });


    socket.on("disconnect", () => {
      const index = connectedUsers.indexOf(socket.id);
      if (index !== -1) {
        connectedUsers.splice(index, 1);
      }
    });

  })
}


async function loadFriends(io, socket) {
  const userID = socket.userID; // Corrected to extract userID

  try {
    const user = await db.collection("accounts").findOne({ username: userID });
    if (!user) {
      console.log("User not found with userID:", userID);
      return;
    }

    const onlineFriends = [];
    const friends = user.friends || [];
    console.log(io.sockets.connected)
    friends.forEach((friendID) => {
      if (io.sockets.connected[friendID]) {
        console.log("gfcjghck")
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