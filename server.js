const app = require("./app");

const server = require("http").createServer(app);

const io = require('socket.io')(server, {
  pingTimeout: 120000, // 30 seconds
  transports: ['websocket'],
  allowUpgrades: true,
  cors: {origin: "*"}
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

  //Event to create a Game Session in our database, and redirect the socket to a "lobby", to wait for a second player to join
  socket.on("createGameSession", async (charId) => {

    try {

      const gameSessionData = {
        socketId: socket.id,
        selectedCharacter: charId
      };

      //Create Game Session in the Database
      await GameSession.create(gameSessionData);

      //Redirect the socket to the "lobby" room
      socket.join("lobby");

      const clientsInLobby = io.sockets.adapter.rooms.get("lobby").size;
      console.log("Clients in lobby: " + clientsInLobby);
      
      //If there are 2 sockets in the lobby, generate a game room, and ask both sockets to ask the server to be moved to that room
      if(clientsInLobby === 2) {
        
        const gameRoom = Math.floor(Math.random() * 1000000);

        io.to("lobby").emit("changeRoom", gameRoom);
      }

    } catch (err) {
      console.error(err);
    };
  });

  //Event to create a Game document in our Database
  socket.on("initializeGame", async (gameRoom) => {

    //Change socket from the lobby room to its new game room
    socket.join(`${gameRoom}`);
    socket.leave("lobby");

    const clientsInGame = io.sockets.adapter.rooms.get(`${gameRoom}`).size;
    console.log("Clients in game room " + gameRoom + ": " + clientsInGame);

    //If both players are in the game room already, create the Game document with all the necessary info
    if(io.sockets.adapter.rooms.get(`${gameRoom}`).size === 2) {
      
      const players = io.sockets.adapter.rooms.get(`${gameRoom}`);
      const playersArr = [...players];

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
        
        //Send the game information to both players, so that their browser can render the game
        io.to(`${gameRoom}`).emit("loadChar", charOne, charTwo, game);

      } catch (err) {
        console.error(err);
      };

    }
  });  

  //Event to initiallize each round
  socket.on("gameBeginRound", async (game) => {

    try{

      //Update the chosen action of both players back to Idle
      const defaultActions = {
        playerOneActionState: "Idle",
        playerTwoActionState: "Idle",
      };
  
      const updatedGame = await Game.findByIdAndUpdate(game._id, defaultActions, {new: true});
  
      //Send the game information back to the players
      io.to(`${game.gameRoom}`).emit("runRound", updatedGame);

    } catch (err) {
      console.error(err);
    }

  });


  //Event to reciev the input from players
  socket.on("gameButtonPressed", async (gameOld, action) => {

    try{
  
      let actionData;
  
      //Check who the action choice belongs to
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
  
      //If both players have chosen the action to take, run the game logic
      if(game.playerOneActionState !== "Idle" && game.playerTwoActionState !== "Idle") {
        
        let message;
        let playerOneNewHealth;
        let playerTwoNewHealth;
  
        //If elses to check all possible combinatons, and calculate outcomes
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
          playerTwoNewHealth = game.playerTwoChar[0].health - (Math.round(game.playerTwoChar[0].strength / 2));
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
          playerOneNewHealth = game.playerOneChar[0].health - (Math.round(game.playerTwoChar[0].strength / 2));
          playerTwoNewHealth = game.playerTwoChar[0].health;
  
        }
  
        //If one of the players died, emit a game over event, passing the winner to the players
        if(playerOneNewHealth <= 0) {
          io.to(`${game.gameRoom}`).emit("gameOver", game.playerTwoSocketId, game);
        } else if (playerTwoNewHealth <= 0) {
          io.to(`${game.gameRoom}`).emit("gameOver", game.playerOneSocketId, game);
        } else {

          //If both are still alive, update info on the game document
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
  
          //Initialize new round process
          io.to(`${game.gameRoom}`).emit("beginNewRound", updatedGame);
  
        } 
      }
    } catch (err) {
      console.error(err);
    }
    
  });

  //Event to destroy the game document from our Database, in case both players finished playing
  socket.on("destroyGame", async (game, winnerSocketId) => {
    try{

      //Update Player's Character in the database
      const playersGameSession = await GameSession.findOne({socketId: socket.id});
      const playersCharacter = await Character.findById(playersGameSession.selectedCharacter);
      let newExpPoints;
      
      if(winnerSocketId === socket.id) {
        newExpPoints = playersCharacter.experiencePoints + 2;
      } else {
        newExpPoints = playersCharacter.experiencePoints;
      }

      await Character.findByIdAndUpdate(playersCharacter._id, {experiencePoints: newExpPoints}, {new: true});


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

  //Event to chec if the connecting socket was playing a game or waiting in the lobby before being disconnected
  socket.on("checkGame", async (newSocketId, charId) => {

    try {
      //Get the former socket id
      const myGameSession = await GameSession.findOne({selectedCharacter: charId});

      if(myGameSession) {

        const myOldSocketId = myGameSession.socketId;
  
        //Update the socket id in use in the GAameSession document in the Database
        await GameSession.findByIdAndUpdate(myGameSession._id, {socketId: newSocketId}, {new: true});
  
        //Try to find if there is a game where the player was playing before being disconnected 
        const myGame = await Game.findOne( { $or: [ { playerOneSocketId: myOldSocketId }, { playerTwoSocketId: myOldSocketId } ] } );
  
        //If there is a Game
        if(myGame) {
          
          //Check wich player we were, and update our socket id in the Game document
          if(myGame.playerOneSocketId === myOldSocketId) {
            await Game.findByIdAndUpdate(myGame._id, {playerOneSocketId: newSocketId});
          } else {
            await Game.findByIdAndUpdate(myGame._id, {playerTwoSocketId: newSocketId});
          }
    
          //Rejoin the game room the player was in, before disconnecting
          socket.join(`${myGame.gameRoom}`);
    
          //If the room has 2 players, restart the game from the its last stage before players disconnected
          if(io.sockets.adapter.rooms.get(`${myGame.gameRoom}`).size === 2) {
            io.to(`${myGame.gameRoom}`).emit("beginNewRound", myGame);
          }
  
        } else {
          //If there was no game, we keep the player in the lobby room
          socket.join("lobby");
        }

      } else {
        socket.emit("initialization")
      }

    } catch (err) {
      console.log(err);
    }
  });

  //Event to check if the player disconnected, and is taking to long to reconnect
  socket.on("disconnect", () => {    
    
    //On disconnection, we set a time out to check if in a few seconds the socket that disconnected didn't try to reconnect
    setTimeout(async () => {

      const socketGameSession = await GameSession.findOne({socketId: socket.id});

      if(socketGameSession){
        //If the game session document still has the same socket id after a few seconds, the player didn't reconnect, so we delete the Game Session from the Database
        if(socket.id === socketGameSession.socketId) {
          await GameSession.findByIdAndDelete(socketGameSession._id);
          
          const myGame = await Game.findOne( { $or: [ { playerOneSocketId: socket.id }, { playerTwoSocketId: socket.id } ] } );
  
          //If the the player that disconnected was playing a game
          if(myGame) {
  
            //Check if the socket id didn't change, and if it didnt, finish that game, giving victory to the opponent
            if(myGame.playerOneSocketId === socket.id) {
              await Game.findByIdAndUpdate(myGame._id, {playerOneLeft: true}, {new: true});
              io.to(`${myGame.gameRoom}`).emit("gameOver", myGame.playerTwoSocketId, myGame);
            } else {
              await Game.findByIdAndUpdate(myGame._id, {playerTwoLeft: true}, {new: true});
              io.to(`${myGame.gameRoom}`).emit("gameOver", myGame.playerOneSocketId, myGame);
            }
          }
        }
      }
    }, 5000);
  });

});
