const app = require("./app");

const server = require("http").createServer(app);
const io = require("socket.io")(server, {cors: {origin: "*"}});

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 3000
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
  console.log("USER CONNECTED: " + socket.id);
  console.log("------------------------");
});
