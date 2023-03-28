const socket = io("http://localhost:3000/");

const charId = document.getElementById("char-id").innerText;

socket.emit("enterGame");


