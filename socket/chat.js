const socketIO = require("socket.io");
const { accounts, rooms } = require("../database/database");

function setupSocket(server) {
  const io = socketIO(server);
  const connectedUsers = {};

  io.on("connection", (socket) => {
    socket.on("authenticate", (data) => {
      const { userID } = data;
      socket.userID = userID;
      connectedUsers[userID] = socket.id;

      socket.on("loadFriends", (data) => {
        loadFriends(io, socket, connectedUsers);
      })
      socket.on("loadRooms", (data) => {
        loadRooms(io, socket, connectedUsers);
      })

    });

    socket.on("send_message", (data) => {
      const { senderID, recipientID, message, time } = data;
      if (recipientID && connectedUsers[recipientID]) {
        io.to(connectedUsers[recipientID]).emit("receiveMsg", {
          senderID,
          message,
          time,
        });
      }
    });

    socket.on('CreateRoom', (data) => {
      const { userID, roomName } = data;
      socket.join(roomName);

      socket.emit('roomCreated', `Room ${roomName} created successfully!`);

      io.to(roomName).emit('roomMessage', `User ${userID} has joined the room.`);
    });


    socket.on('typing', (data) => {
      const { userId, recipientID } = data;
      if (recipientID && connectedUsers[recipientID]) {
        io.to(connectedUsers[recipientID]).emit("istyping", { userId });
      }
    });


    socket.on('gameChallenge', (userID, recipientID) => {
      if (recipientID && connectedUsers[recipientID]) {
        io.to(connectedUsers[recipientID]).emit('challengereturn', userID);
        io.to(connectedUsers[userID]).emit('challengereturn', recipientID);
      }
    })


    socket.on("send_message", (data) => {
      const { senderID, recipientID, content1, content2 } = data;
      if (senderID && recipientID) {
        const senderSocket = connectedUsers[senderID];
        const recipientSocket = connectedUsers[recipientID];
        if (recipientSocket) {
          io.to(recipientSocket).emit("new_message", {
            senderID,
            content1,
            content2,
          });
        }
      } else {
        console.log(
          "Sender or recipient not found in the connectedUsers collection."
        );
      }
    });

    socket.on("disconnect", () => {
      const userID = socket.userID;
      delete connectedUsers[userID];
      socket.leaveAll();
    });
  })
}

async function loadFriends(io, socket, connectedUsers) {
  const userID = socket.userID;

  try {
    const user = await accounts.findOne({ username: userID });
    if (!user) {
      console.log("User not found with userID:", userID);
      return;
    }

    const onlineFriends = [];
    const friends = user.friends || [];
    friends.forEach((friendID) => {
      if (connectedUsers[friendID]) {
        onlineFriends.push(friendID);
      }
    });

    socket.emit("Friends", { friends });
    socket.emit("onlineFriends", { onlineFriends });
  } catch (error) {
    console.error("Error loading friends:", error);
  }
}


async function loadRooms(io, socket, connectedUsers) {
  const userID = socket.userID;

  try {

    const ownerAccount = await accounts.findOne({ username: userID });

    const userRooms = await rooms.find({
      $or: [
        { owner: ownerAccount.id },
        { members: ownerAccount.id }
      ]
    });

    if (userRooms.length === 0) {
      console.log("User has no rooms as owner or member:", userID);
      return;
    }
    socket.emit("UserRooms", { userRooms });

  } catch (error) {
    console.error("Error loading rooms:", error);
  }
}



module.exports = setupSocket;
