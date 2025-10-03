const express = require("express");
const http = require("http");
const SocketIO = require("socket.io");

const app = express();

const server = http.createServer(app);

//init socket.io
const io = SocketIO(server);

app.use(express.static("public"));

const users = new Set();

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("join", (userName) => {
    users.add(userName);
    // Notify all clients about the new user
    io.emit("userJoined", userName);

    // Send the updated user list to all clients
    io.emit("userList", Array.from(users));

    //handle incoming messages
    socket.on("chatMessage", (message) => {
      //broadcast the message to all clients
      io.emit("chatMessage", { user: userName, text: message });
    });

    //handle user disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected");
      users.forEach((user) => {
        if (user === userName) {
          users.delete(user);
        }
      });
      // Send the updated user list to all clients
      io.emit("userList", Array.from(users));
    });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
