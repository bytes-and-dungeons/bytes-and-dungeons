const app = require("./app");

const server = require("http").createServer(app);
const io = require('socket.io')(server, {cors: {origin: "*"}});

const User = require('./models/User.model');

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 3000
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
  
  socket.on("enterLobby", () =>{
    socket.join("lobby");
    const clientsInLobby = io.sockets.adapter.rooms.get("lobby").size;
    console.log(clientsInLobby);
    
    if(clientsInLobby === 2) {
      console.log("Two players in lobby!!!!");
      io.to("lobby").emit('redirectToGame', Math.floor(Math.random() * 1000000));

    }
  });

  socket.on("enterGame", (userId) => {

    console.log(userId);
    console.log(socket.id);

    User.findById(userId)
      .then((user) => {
        socket.to(`${socket.id}`).emit("recieveOwnUser", user);
      }).catch((err) => {
        console.error(err);
      });

  });
});