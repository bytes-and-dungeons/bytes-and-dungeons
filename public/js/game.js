const socket = io("http://localhost:3000");

const userId = document.getElementById("user-id").innerText;


socket.on("test", () => {
    console.log("working");
})

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