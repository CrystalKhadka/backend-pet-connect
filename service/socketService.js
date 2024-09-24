const { Server } = require('socket.io');

let io;

const users = {};

const initSocket = async (server) => {
  io = new Server(server, {
    cors: {
      origin: {
        test: ['http://localhost:3000', 'http://192.168.137.1:3000'],
      },

      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.id; // Get user ID from query params

    socket.emit('connected', () => {
      console.log('Socket connected');
    });

    socket.on('newUser', (userId) => {
      // Remove the user from the mapping if userId already exists
      console.log(users);
      for (let user in users) {
        if (user === userId) {
          delete users[user];
          break;
        }
      }
      users[userId] = socket.id;
      console.log('New user connected', userId);
      console.log(users);
    });

    socket.on('sendMessage', (message) => {
      console.log('Message event', message);

      if (users[message.sender._id]) {
        socket.to(users[message.sender._id]).emit('receiveMessage', message);
      }
    });

    // Send notification
    socket.on('sendNotification', (notification) => {
      console.log('Notification event', notification);
      if (users[notification.receiver]) {
        socket
          .to(users[notification.receiver])
          .emit('receiveNotification', notification);
      }
    });

    socket.on('test', (data) => {
      console.log('Test event', data);
      socket.broadcast.emit('sendTest', data);
    });

    // Typing event
    socket.on('typing', (data) => {
      console.log('Typing event', data);
      if (users[data.receiver]) {
        console.log('Typing event', data);
        io.to(users[data.receiver]).emit('typingNow', data);
      }
    });
    // 6683d7c434862f49a8f283d3

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      // Remove user from mapping
      for (let user in users) {
        if (users[user] === socket.id) {
          delete users[user];
          break;
        }
      }
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initSocket,
  getIo,
  users,
};
