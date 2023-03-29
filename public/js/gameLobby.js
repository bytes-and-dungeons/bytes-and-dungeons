const socket = io("http://localhost:3000");

const charId = document.getElementById("char-id").innerText;
const userId = document.getElementById("user-id").innerText;
const loadingPageElm = document.getElementById('loading-page');
const gamePageElm = document.getElementById('game-page');


socket.on("connection");

socket.emit("createGameSession", charId);

socket.on("changeRoom", gameRoom => {
    socket.emit("initializeGame", gameRoom);
    loadingPageElm.classList.add('visually-hidden');
    gamePageElm.classList.remove('visually-hidden');
});

socket.on("loadChar", (charOne, charTwo) => {

    let myChar;
    let enemyChar;

    if(charOne.owner.toString() === userId) {
        myChar = charOne;
        enemyChar = charTwo;
    } else {
        myChar = charTwo;
        enemyChar = charOne;
    }

    const playerCharNameElm = document.querySelector("#my-char .name");
    const enemyCharNameElm = document.querySelector("#enemy-char .name");

    playerCharNameElm.innerText = myChar.name;
    enemyCharNameElm.innerText = enemyChar.name;

});