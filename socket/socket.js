const socketIO = require("socket.io");
const { getdb } = require("../database/database");
db = getdb();

function setupSocket(server) {
  const io = socketIO(server);

  io.on("connection", (socket) => {
    console.log("New client connected. Socket ID:", socket.id);
    socket.on("authenticate", (data) => {
      const { userID } = data;
      socket.userID = userID;
      console.log(socket);
      db.collection("connectedUsers")
        .findOne({ userID: userID })
        .then((result) => {
          if (result) {
            console.log(socket.userID, "already connected.");
          } else {
            db.collection("connectedUsers")
              .insertOne({ userID: userID, socket: socket.id })
              .then(() => {
                console.log(socket.userID, "connected.");
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });

    socket.on("send_message", async (data) => {
      const { senderID, recipientID, content1, content2 } = data;

      try {
        const senderUser = await db
          .collection("connectedUsers")
          .findOne({ userID: senderID });
        const recipientUser = await db
          .collection("connectedUsers")
          .findOne({ userID: recipientID });

        if (senderUser && recipientUser) {
          const senderSocket = senderUser.socket;
          const recipientSocket = recipientUser.socket;

          console.log(senderSocket);

          if (senderSocket && recipientSocket) {
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
      } catch (error) {
        console.error("Error:", error);
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
    });
  });
}

module.exports = setupSocket;
