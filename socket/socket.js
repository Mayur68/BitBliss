const socketIO = require("socket.io");
const { getdb } = require("../database/database");
db = getdb();

function setupSocket(server) {
  const io = socketIO(server);
  const availableUsers = [];
  const connectedUsers = {};

  io.on("connection", (socket) => {
    availableUsers.push(socket.id);
    socket.on("authenticate", (data) => {
      const { userID } = data;
      socket.userID = userID;
      connectedUsers[socket.id] = data;
      // db.collection("connectedUsers")
      //   .findOne({ userID: userID })
      //   .then((result) => {
      //     if (result) {
      //       console.log(socket.userID, "already connected.");
      //     } else {
      //       db.collection("connectedUsers")
      //         .insertOne({ userID: userID, socket: socket.id })
      //         .then(() => {
      //           console.log(socket.userID, "connected.");
      //         })
      //         .catch((error) => {
      //           console.error("Error:", error);
      //         });
      //     }
      //   })
      //   .catch((error) => {
      //     console.error("Error:", error);
      //   });
    });


    socket.on("findMatch", (data) => {
      if (availableUsers.length >= 2) {
        // Randomly select two users from the availableUsers array
        const index1 = Math.floor(Math.random() * availableUsers.length);
        const index2 = Math.floor(Math.random() * (availableUsers.length - 1));
        const user1SocketId = availableUsers.splice(index1, 1)[0];
        const user2SocketId = availableUsers.splice(index2, 1)[0];

        io.to(user1SocketId).emit('matched', user2SocketId);
        io.to(user2SocketId).emit('matched', user1SocketId);
      }
    })

    socket.on("send_message", (data) => {
      const { senderID, recipientID, content1, content2 } = data;
        if (senderID && recipientID) {
          const senderSocket = connectedUsers[senderID];
          const recipientSocket = recipientID;
          if ( recipientSocket) {
            console.log(recipientSocket)
            // Send the message to the recipient
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
      db.collection("connectedUsers")
        .deleteOne({ userID: socket.userID })
        .then(() => {
          console.log(socket.userID, "disconnected.....");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
        delete connectedUsers[socket.id];
        const index = availableUsers.indexOf(socket.id);
    if (index !== -1) {
      availableUsers.splice(index, 1);
    }
    });
  });
}

module.exports = setupSocket;
