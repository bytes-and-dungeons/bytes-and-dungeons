const socket = io("http://localhost:3000/");

socket.on("connection");

socket.emit("enterLobby", "New player joined the lobby!")

socket.on("redirectToGame", (gameId) => {
    window.location.href = `http://localhost:3000/game/${gameId}`; // SHOULD CHANGE WHEN DEPLOYED
})