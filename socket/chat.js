const socketIO = require("socket.io");
const { accounts, rooms, notification } = require("../database/database");

function setupSocket(server) {
  const io = socketIO(server);
  const connectedUsers = {};

  io.on("connection", (socket) => {
    socket.on("authenticate", (data) => {
      const { userID } = data;
      socket.userID = userID;
      connectedUsers[userID] = socket.id;

      socket.on("loadNotifications", (data) => {
        loadNotifications(io, socket, data);
      })


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

    socket.on("sendRequest", async (data) => {
      const { userId, friendId } = data;
      console.log('Received sendRequest with data:', data);

      if (userId && connectedUsers[friendId]) {
        const friendSocketId = connectedUsers[friendId];
        console.log('Friend Socket ID:', friendSocketId);

        if (friendSocketId) {
          io.to(friendSocketId).emit("friendRequest", { userId });
          console.log('friendRequest emitted successfully to friend:', friendId);
        }
      } else {
        console.log('Friend Socket ID not found or user not connected');

        try {
          const user = await accounts.findOne({ username: userId });

          if (user) {
            const newUser = new accounts({
              username: friendId._id,
              friendRequest: userId,
            });

            await newUser.save();
            console.log('Pending request added to Notification schema for user:', friendId);
          } else {
            console.log('User not found');
          }
        } catch (err) {
          console.error('Error adding pending request:', err);
        }
      }
    });




    // socket.on('CreateRoom', (data) => {
    //   const { userID, roomName } = data;
    //   socket.join(roomName);

    //   socket.emit('roomCreated', `Room ${roomName} created successfully!`);

    //   io.to(roomName).emit('roomMessage', `User ${userID} has joined the room.`);
    // });


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
  });
}


async function loadNotifications(io, socket, data) {
  const userID = socket.userID;

  try {
    const user = await accounts.findOne({ username: userID });
    if (!user) {
      console.log("User not found with userID:", userID);
      return;
    }
  } catch (error) {
    console.error("Error loading Notifications:", error);
  }
}

async function loadFriends(io, socket) {
  const userID = socket.userID;

  try {
    const user = await accounts.findOne({ username: userID });
    if (!user) {
      console.log("User not found with userID:", userID);
      return;
    }

    const friends = user.friends || [];

    // Map user IDs to usernames
    const friendUsernames = await Promise.all(
      friends.map(async (friendID) => {
        const friend = await accounts.findOne({ _id: friendID });
        return friend ? friend.username : null;
      })
    );

    socket.emit("Friends", { friends: friendUsernames });
  } catch (error) {
    console.error("Error loading friends:", error);
  }
}



async function loadRooms(io, socket) {
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
      return;
    }
    socket.emit("UserRooms", { userRooms });

  } catch (error) {
    console.error("Error loading rooms:", error);
  }
}

module.exports = setupSocket;
