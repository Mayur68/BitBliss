const socketIO = require("socket.io");
const { getdb } = require("../database/database");
db = getdb();

function setupSocketForChat(server) {
  const io = socketIO(server);

  io.on("connection_1", (socket) => {

    console.log("connected")
    socket.on("authenticate_1", (data) => {
      const { userID } = data;
      socket.userID = userID;
      console.log(userID)

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


      //load Friends

      //   socket.on("loadFriends", (data) => {
      //     const { userID } = data;
      //     let online = [];
      //     let friends = [];
      //     db.collection("accounts")
      //       .findOne({ userID: userID })
      //       .then((result) => {
      //         if (result) {
      //           friends.push(...result.friends);
      //         }
      //         friends.forEach((friend) => {
      //           if (connectedUsers.hasOwnProperty(friend)) {
      //             online.push(friend);
      //           }
      //         });
      //         console.log("Online friends:", online);
      //         socket.emit("onlineFriends", { online });
      //       })
      //       .catch((error) => {
      //         console.error("Error loading friends:", error);
      //       });
      //   });
      // });

      socket.on("disconnect", () => {
        delete connectedUsers[socket.id];
        const index = availableUsers.indexOf(socket.id);
        if (index !== -1) {
          availableUsers.splice(index, 1);
        }
      });
    })
  })
}

module.exports = setupSocketForChat;