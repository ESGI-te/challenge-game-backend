const socket = require("socket.io");

module.exports = function (server) {
  try {
    const io = socket(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    console.log(`Socket.io is listening on port ${server.address().port}`);
    return io;
  } catch (error) {
    console.log(error);
  }
};
