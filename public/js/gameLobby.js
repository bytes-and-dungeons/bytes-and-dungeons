//Connect to socket io server
const socket = io({
    timeout: 120000,
    transports: ['websocket'] // 10 seconds
});

const charId = document.getElementById("char-id").innerText;
const userId = document.getElementById("user-id").innerText;
const loadingPageElm = document.getElementById('loading-page');
const gamePageElm = document.getElementById('game-page');
const gameOverPageElm = document.getElementById('game-over');

// button and message element
const btnMenuElm = document.getElementById('btn-menu');
const msgElm = document.getElementById('message');
const resultElm = document.getElementById('result');


// player variables
const playerNameElm = document.getElementById("player")
const playerCharNameElm = document.querySelector("#my-char .name");
const playerCharHealthElm = document.querySelector("#my-char .health");
const playerCharStrengthElm = document.querySelector("#my-char .strength");
const playerCharDefenseElm = document.querySelector("#my-char .defense");

// enemy variables
const enemyNameElm = document.getElementById('enemy');
const enemyCharNameElm = document.querySelector("#enemy-char .name");
const enemyCharHealthElm = document.querySelector('#enemy-char .health');
const enemyCharStrengthElm = document.querySelector('#enemy-char .strength');
const enemyCharDefenseElm = document.querySelector('#enemy-char .defense');


//This is called on connection and future reconnections
socket.on("connect", () => {
    //Asks the server to check if we are already playing a game or in the lobby, using our character ID
    socket.emit("checkGame", socket.id, charId);
});

//Called when it's the first time connecting
socket.on("initialization", () => {
    //Create a game session in the server
    socket.emit("createGameSession", charId);
});

//Called when the server finds a match for the client, giving our game room
socket.on("changeRoom", gameRoom => {
    socket.emit("initializeGame", gameRoom);
    loadingPageElm.classList.add('visually-hidden');
    gamePageElm.classList.remove('visually-hidden');
});

//To load the characters information when the game starts
socket.on("loadChar", (charOne, charTwo, game) => {

    let myChar;
    let enemyChar;
    
    if(charOne.owner._id.toString() === userId) {
        myChar = charOne;
        enemyChar = charTwo;
    } else {
        myChar = charTwo;
        enemyChar = charOne;
    }
    
    // player values
    playerNameElm.innerText = myChar.owner.username;
    playerCharNameElm.innerText = myChar.name;
    playerCharHealthElm.innerText = myChar.healthPoints;
    playerCharStrengthElm.innerText = myChar.strength;
    playerCharDefenseElm.innerText = myChar.defense;

    // enemy values
    enemyNameElm.innerText = enemyChar.owner.username;
    enemyCharNameElm.innerText = enemyChar.name;
    enemyCharHealthElm.innerText = enemyChar.healthPoints;
    enemyCharStrengthElm.innerText = enemyChar.strength;
    enemyCharDefenseElm.innerText = enemyChar.defense;

    socket.emit("gameBeginRound", game);
    
});

//To check for inputs during a round
socket.on("runRound", game => {
    
    btnMenuElm.innerHTML = `<button id="attack-btn" class="btn btn-warning">ATTACK</button>
    <button id="spell-btn" class="btn btn-success">SPELL</button>
    <button id="defense-btn" class="btn btn-primary">DEFENSE</button>`;

    const attackBtn = document.getElementById("attack-btn");
    const defenseBtn = document.getElementById('defense-btn');
    const spellBtn = document.getElementById('spell-btn');

    attackBtn.addEventListener("click", () => {
        socket.emit('gameButtonPressed', game, "Attack");
        btnMenuElm.innerHTML = ``;
    });

    spellBtn.addEventListener("click", () => {
        socket.emit('gameButtonPressed', game, "Spell");
        btnMenuElm.innerHTML = ``;
    });

    defenseBtn.addEventListener("click", () => {
        socket.emit('gameButtonPressed', game, "Defense");
        btnMenuElm.innerHTML = ``;
    });
    
    if(game.playerOneSocketId === socket.id) {
        myChar = game.playerOneChar[0];
        enemyChar = game.playerTwoChar[0];
    } else {
        myChar = game.playerTwoChar[0];
        enemyChar = game.playerOneChar[0];
    }


    // player health
    playerCharHealthElm.innerText = myChar.health;

    // enemy health
    enemyCharHealthElm.innerText = enemyChar.health;

});

//Updates report from last round, and asks the server to begin the new one
socket.on("beginNewRound", game => {
    msgElm.innerText = game.message;
    socket.emit("gameBeginRound", game);
});

//Recieves the game over notification, to ask to finallize the whole game process
socket.on("gameOver", (winnerSocketId, game) => {

    socket.emit("destroyGame", game, winnerSocketId);

    gamePageElm.classList.add('visually-hidden');
    gameOverPageElm.classList.remove('visually-hidden');

    if(winnerSocketId === socket.id) {
        resultElm.innerText = "YOU WIN!!!"
    } else {
        resultElm.innerText = "YOU LOSE!!!"
    }
});