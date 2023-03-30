const app = require("./app");

const server = require("http").createServer(app);

const io = require("socket.io")(server, 
  {cors: {origin: "*"},
  pingTimeout: 120000
});

const Character = require("./models/Character.model");
const GameSession = require("./models/GameSession.model");
const Game = require("./models/Game.model");

const User = require('./models/User.model');

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
        const charOne = await Character.findById(gameSessionOne.selectedCharacter).populate("owner");
        
        const gameSessionTwo = await GameSession.findOne({socketId: playersArr[1]});
        const charTwo = await Character.findById(gameSessionTwo.selectedCharacter).populate("owner");

        const gameData = {
          gameRoom,
          playerOneSocketId: playersArr[0],
          playerTwoSocketId: playersArr[1],
          playerOneChar: [{
            name: charOne.name,
            health: charOne.healthPoints,
            strength: charOne.strength,
            defense: charOne.defense
          }],
          playerTwoChar: [{
            name: charTwo.name,
            health: charTwo.healthPoints,
            strength: charTwo.strength,
            defense: charTwo.defense
          }]
        };
        
        const game = await Game.create(gameData);

        io.to(`${gameRoom}`).emit("loadChar", charOne, charTwo, game);

      } catch (err) {
        console.error(err);
      };

    }
  });  

  socket.on("gameBeginRound", async (game) => {

    try{

      const defaultActions = {
        playerOneActionState: "Idle",
        playerTwoActionState: "Idle",
        message: ""
      };
  
      const updatedGame = await Game.findByIdAndUpdate(game._id, defaultActions, {new: true});
  
      io.to(`${game.gameRoom}`).emit("runRound", updatedGame);

    } catch (err) {
      console.error(err);
    }

  });

  socket.on("gameButtonPressed", async (gameOld, action) => {

    try{
  
      let actionData;
  
      if(gameOld.playerOneSocketId === socket.id) {
        actionData = {
          playerOneActionState: action
        };
      } else {
        actionData = {
          playerTwoActionState: action
        };
      }
      
      const game = await Game.findByIdAndUpdate(gameOld._id, actionData, {new: true});
  
      
      if(game.playerOneActionState !== "Idle" && game.playerTwoActionState !== "Idle") {
        
        let message;
        let playerOneNewHealth;
        let playerTwoNewHealth;
  
        if(game.playerOneActionState === game.playerTwoActionState){

          message = "Tie!!!";
          playerOneNewHealth = game.playerOneChar[0].health;
          playerTwoNewHealth = game.playerTwoChar[0].health;

        } else if (game.playerOneActionState === "Attack" && game.playerTwoActionState === "Spell") {
  
          message = `${game.playerOneChar[0].name} attacked ${game.playerTwoChar[0].name}, and won the round!`;
          playerTwoNewHealth = game.playerTwoChar[0].health - (game.playerOneChar[0].strength - game.playerTwoChar[0].defense);
          playerOneNewHealth = game.playerOneChar[0].health;
  
        } else if (game.playerOneActionState === "Spell" && game.playerTwoActionState === "Defense") {
  
          message = `${game.playerOneChar[0].name} cast a spell on ${game.playerTwoChar[0].name}, and won the round!`;
          playerTwoNewHealth = game.playerTwoChar[0].health - (game.playerOneChar[0].strength);
          playerOneNewHealth = game.playerOneChar[0].health;
  
        } else if (game.playerOneActionState === "Defense" && game.playerTwoActionState === "Attack") {
  
          message = `${game.playerOneChar[0].name} defended ${game.playerTwoChar[0].name}'s attack, and won the round!`;
          playerTwoNewHealth = game.playerTwoChar[0].health - (Math.round(game.playerTwoChar[0].strength / 3));
          playerOneNewHealth = game.playerOneChar[0].health;
  
        } else if (game.playerTwoActionState === "Attack" && game.playerOneActionState === "Spell") {
  
          message = `${game.playerTwoChar[0].name} attacked ${game.playerOneChar[0].name}, and won the round!`;
          playerOneNewHealth = game.playerOneChar[0].health - (game.playerTwoChar[0].strength - game.playerTwoChar[0].defense);
          playerTwoNewHealth = game.playerTwoChar[0].health;
  
        } else if (game.playerTwoActionState === "Spell" && game.playerOneActionState === "Defense") {
  
          message = `${game.playerTwoChar[0].name} cast a spell on ${game.playerOneChar[0].name}, and won the round!`;
          playerOneNewHealth = game.playerOneChar[0].health - (game.playerTwoChar[0].strength);
          playerTwoNewHealth = game.playerTwoChar[0].health;
  
        } else if (game.playerTwoActionState === "Defense" && game.playerOneActionState === "Attack") {
  
          message = `${game.playerTwoChar[0].name} defended ${game.playerOneChar[0].name}'s attack, and won the round!`;
          playerOneNewHealth = game.playerOneChar[0].health - (Math.round(game.playerTwoChar[0].strength / 3));
          playerTwoNewHealth = game.playerTwoChar[0].health;
  
        }
  
        
        if(playerOneNewHealth <= 0) {
          io.to(`${game.gameRoom}`).emit("gameOver", game.playerTwoSocketId, game);
        } else if (playerTwoNewHealth <= 0) {
          io.to(`${game.gameRoom}`).emit("gameOver", game.playerOneSocketId, game);
        } else {
          
          const updatedData = {
            message: message,
            playerOneChar: [{
              name: game.playerOneChar[0].name,
              health: playerOneNewHealth,
              strength: game.playerOneChar[0].strength,
              defense: game.playerOneChar[0].defense,
            }],
            playerTwoChar: [{
              name: game.playerTwoChar[0].name,
              health: playerTwoNewHealth,
              strength: game.playerTwoChar[0].strength,
              defense: game.playerTwoChar[0].defense,
            }]
          };
    
          const updatedGame = await Game.findByIdAndUpdate(game._id, updatedData, {new: true});
  
          io.to(`${game.gameRoom}`).emit("beginNewRound", updatedGame);
  
        } 
      }
    } catch (err) {
      console.error(err);
    }
    
  });

  socket.on("destroyGame", async (game, winnerSocketId) => {
    try{

      //Update Player's Character in the database
      const playersGameSession = await GameSession.findOne({socketId: socket.id});
      const playersCharacter = await Character.findById(playersGameSession.selectedCharacter);
      let newExpPoints;
      
      if(winnerSocketId === socket.id) {
        newExpPoints = playersCharacter.experiencePoints + 3;
      } else {
        newExpPoints = playersCharacter.experiencePoints + 1;
      }

      const updatedCharacter = await Character.findByIdAndUpdate(playersCharacter._id, {experiencePoints: newExpPoints}, {new: true});


      //Update the state of the players in the game document
      let updatedGame;
      
      if(game.playerOneSocketId === socket.id) {
        updatedGame = await Game.findByIdAndUpdate(game._id, {playerOneLeft: true}, {new: true});
      } else {
        updatedGame = await Game.findByIdAndUpdate(game._id, {playerTwoLeft: true}, {new: true});
      }
      
      //Delete player's game session on the data base
      await GameSession.findOneAndDelete({socketId: socket.id});
      
      //Check if all players exited
      if(updatedGame.playerOneLeft && updatedGame.playerTwoLeft) {
        console.log("Both players left!");
        await Game.findByIdAndDelete(updatedGame._id);
      }
    } catch (err) {
      console.error(err);
    }
  });

});
