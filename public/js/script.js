// https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event
document.addEventListener("DOMContentLoaded", () => {
  console.log("bytes-and-dungeons JS imported successfully!");
});

localStorage.debug = 'socket.io-client:socket'; //enable socket.io debugging (any event received by the client will be printed to the console)


const socket = io();
