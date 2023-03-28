const socket = io("http://localhost:3000/");

socket.on("connection");

const charId = document.getElementById("char-id").innerText;

socket.emit("enterLobby", charId);

socket.on("redirectToGame", (gameId) => {
    window.location.href = `http://localhost:3000/game/${gameId}`; // SHOULD CHANGE WHEN DEPLOYED
})

