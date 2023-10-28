const socketIO = require("socket.io");
const { getdb } = require("../database/database");
db = getdb();

function setupSocket(server) {
  const io = socketIO(server);
  const connectedUsers = {};
  const availableUsersForTictactoe = [];
  const availableUsersForPaint = [];


  io.on("connection", (socket) => {
    socket.on("authenticate", (data) => {
      const { userID } = data;
      socket.userID = userID;


      //
      //
      //for tic tac toe
      //
      //
      socket.on("findMatchForTictactoe", (data) => {
        availableUsersForTictactoe.push(socket.id);
        console.log(availableUsersForTictactoe)
        if (availableUsersForTictactoe.length >= 2) {
          // Randomly select two users from the availableUsersForTictactoe array
          const index1 = Math.floor(Math.random() * availableUsersForTictactoe.length);
          const index2 = Math.floor(Math.random() * (availableUsersForTictactoe.length - 1));
          const user1SocketId = availableUsersForTictactoe.splice(index1, 1)[0];
          const user2SocketId = availableUsersForTictactoe.splice(index2, 1)[0];

          io.to(user1SocketId).emit('matchedForTictactoe', user2SocketId);
          io.to(user2SocketId).emit('matchedForTictactoe', user1SocketId);
        }
      })

      socket.on("removeAvailableFromTictactoe", (data) => {
        const index = availableUsersForTictactoe.indexOf(socket.id);
        if (index !== -1) {
          availableUsersForTictactoe.splice(index, 1);
        }
        console.log(availableUsersForTictactoe);
      })

      socket.on("send_message", (data) => {
        const { senderID, recipientID, content1, content2 } = data;
        if (senderID && recipientID) {
          const senderSocket = connectedUsers[senderID];
          const recipientSocket = recipientID;
          if (recipientSocket) {
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

      connectedUsers[socket.id] = data;
    });

    socket.on("disconnect", () => {
      db.collection("connectedUsers")
        .deleteOne({ userID: socket.userID })
        // .then(() => {
        //   console.log(socket.userID, "disconnected.....");
        // })
        .catch((error) => {
          console.error("Error:", error);
        });
      delete connectedUsers[socket.id];
      const index = availableUsersForTictactoe.indexOf(socket.id);
      if (index !== -1) {
        availableUsersForTictactoe.splice(index, 1);
      }
    });


    //
    //
    //for paint
    //
    //
    socket.on("findMatchForPaint", (data) => {
      availableUsersForPaint.push(socket.id);
      console.log(availableUsersForPaint)
      if (availableUsersForPaint.length >= 2) {
        // Randomly select two users from the availableUsersForPaint array
        const index1 = Math.floor(Math.random() * availableUsersForPaint.length);
        const index2 = Math.floor(Math.random() * (availableUsersForPaint.length - 1));
        const user1SocketId = availableUsersForPaint.splice(index1, 1)[0];
        const user2SocketId = availableUsersForPaint.splice(index2, 1)[0];

        io.to(user1SocketId).emit('matchedForPaint', user2SocketId);
        io.to(user2SocketId).emit('matchedForPaint', user1SocketId);
        console.log("done")
      }
    })

    socket.on("removeAvailableForPaint", (data) => {
      const index = availableUsersForPaint.indexOf(socket.id);
      if (index !== -1) {
        availableUsersForPaint.splice(index, 1);
      }
      console.log(availableUsersForPaint);
    })

    socket.on("send_message", (data) => {
      const { senderID, recipientID, content1, content2 } = data;
      if (senderID && recipientID) {
        const senderSocket = connectedUsers[senderID];
        const recipientSocket = recipientID;
        if (recipientSocket) {
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


    socket.on("sendMsg", (data) => {
      const { senderId, message } = data
      socket.emit("recieveMsg", { data })
    })
  });
}

module.exports = setupSocket;