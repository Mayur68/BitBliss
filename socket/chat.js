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
        loadFriends(io, socket, connectedUsers, data);
      });


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

    socket.on("send_room_message", async (data) => {
      const { sender, roomName, message, time } = data;

      try {
        const room = await rooms.findOne({ name: roomName }).populate('members');

        if (!room) {
          return;
        }

        const memberNamesPromises = room.members.map(async (member) => {
          const account = await accounts.findOne({ _id: member });
          return account ? account.username : null;
        });

        const ownerAccount = await accounts.findOne({ _id: room.owner });
        const ownerName = ownerAccount ? ownerAccount.username : null;

        let memberNames = await Promise.all(memberNamesPromises);

        if (ownerName) {
          memberNames.push(ownerName);
        }

        memberNames = memberNames.filter(memberName => memberName !== sender);

        memberNames.forEach((memberName) => {
          if (connectedUsers[memberName]) {
            io.to(connectedUsers[memberName]).emit("receiveRoomMsg", {
              sender,
              message,
              time,
            });
          }
        });
      } catch (error) {
        console.error("Error sending room message:", error);
      }
    });






    socket.on("sendRequest", async (data) => {
      try {
        const { userId, friendId } = data;

        if (!userId || !friendId) {
          console.log('Missing userId or friendId');
          return;
        }

        if (connectedUsers[friendId]) {
          const friendSocketId = connectedUsers[friendId];

          if (friendSocketId) {
            io.to(friendSocketId).emit("friendRequest", { userId });
          }
        }

        const user = await accounts.findOne({ username: userId });
        const friend = await accounts.findOne({ username: friendId });

        if (!user || !friend) {
          console.log('User or friend not found');
          return;
        }

        const userNotification = await notification.findOne({ username: friend._id });
        if (!userNotification) {
          console.log('User notification not found');
          return;
        }

        userNotification.friendRequests.push(user._id);
        await userNotification.save();

      } catch (err) {
        console.error('Error adding pending request:', err);
      }
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

async function loadFriends(io, socket, connectedUsers, userID) {

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

    // Emitting the response with the proper event name
    socket.emit("loadFriendsResponse", { friends: friendUsernames });
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
