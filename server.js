const app = require("./app");

const server = require("http").createServer(app);
const io = require("socket.io")(server, {cors: {origin: "*"}});

const Character = require("./models/Character.model");
const GameSession = require("./models/GameSession.model");

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 3000
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

io.on("connection", (socket) => {

  socket.on("createGameSession", async (charId) => {

    try {

      const gameSessionData = {
        socketId: socket.id,
        selectedCharacter: charId
      };

      const gameSession = await GameSession.create(gameSessionData);

      socket.join("lobby");

      const clientsInLobby = io.sockets.adapter.rooms.get("lobby").size;
      
      
      if(clientsInLobby === 2) {
        
        const gameRoom = Math.floor(Math.random() * 1000000);

        io.to("lobby").emit("changeRoom", gameRoom);
      }

    } catch (err) {
      console.error(err);
    };
  });


  socket.on("initializeGame", async (gameRoom) => {

    socket.join(`${gameRoom}`);
    socket.leave("lobby");

    if(io.sockets.adapter.rooms.get(`${gameRoom}`).size === 2) {
      
      const players = io.sockets.adapter.rooms.get(`${gameRoom}`);
      const playersArr = [...players];

      io.to(`${gameRoom}`).emit("test");

      try {

        const gameSessionOne = await GameSession.findOne({socketId: playersArr[0]});
        const charOne = await Character.findById(gameSessionOne.selectedCharacter);
        
        const gameSessionTwo = await GameSession.findOne({socketId: playersArr[1]});
        const charTwo = await Character.findById(gameSessionTwo.selectedCharacter);
        

        io.to(`${gameRoom}`).emit("loadChar", charOne, charTwo);

      } catch (err) {
        console.error(err);
      };

    }
  });  

});
