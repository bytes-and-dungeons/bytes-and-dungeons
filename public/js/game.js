const socket = io("http://localhost:3000/");

const userId = document.getElementById("user-id").innerText;
console.log(userId);

socket.emit("enterGame", userId);
