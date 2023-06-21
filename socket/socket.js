const socketIO = require('socket.io');

function setupSocket(server) {
  const io = socketIO(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('message', (data) => {
      console.log('Received message:', data);

      // Broadcast the message to all connected clients
      io.emit('message', data);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
}

module.exports = setupSocket;
