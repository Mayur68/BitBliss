const socketIO = require("socket.io");

// Store user information
const connectedUsers = {};

function setupSocket(server) {
  const io = socketIO(server);

  io.on("connection", (socket) => {
    console.log("A user connected.");

    socket.on("send_message", (data) => {
      socket.broadcast.emit("new_message", data);
    });

    // Handle incoming messages 
    // socket.on("send_message", (data) => {
    //   const { recipient, content } = data;
    //   const recipientId = recipient;

    //   // Get the sender's and recipient's sockets
    //   const senderSocket = connectedUsers[senderId]?.socket;
    //   const recipientSocket = connectedUsers[recipientId]?.socket;

    //   socket.broadcast.to("ID").emit("send msg", { somedata: somedata_server });
    //   if (senderSocket && recipientSocket) {
    //     // Send the message to the recipient
    //     console.log("sending....");
    //     recipientSocket.emit("new_message", { sender: senderId, content });
    //   }
    // });
    socket.on("disconnect", () => {
      console.log("A user disconnected.....");
    });
  });
}

module.exports = setupSocket;
