const app = require("./app");

const server = require("http").createServer(app);
const io = require('socket.io')(server, {cors: {origin: "*"}});

const Character = require('./models/Character.model');

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 3000
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
  
  socket.on("enterLobby", async (charId) =>{
    try {
      socket.join("lobby");

      const character = await Character.findById(charId);

      socket.selectedCharacter = character;

      const clientsInLobby = io.sockets.adapter.rooms.get("lobby").size;
      console.log(clientsInLobby);
      
      if(clientsInLobby === 2) {
        console.log("Two players in lobby!!!!");
        io.to("lobby").emit('redirectToGame', Math.floor(Math.random() * 1000000));

      }
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("enterGame", () => {
    console.log(socket.selectedCharacter);
  });
});