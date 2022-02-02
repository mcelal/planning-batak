const express = require("express");
const port = process.env.PORT || 8080;
const app = express();

app.use(express.static(__dirname + "/dist/"));
app.get(/.*/, function(req, res) {
  res.sendFile(__dirname + "/dist/index.html");
})
app.listen(port);

const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    // origin: [
    //   "http://192.168.1.200",
    //   "http://localhost:8080",
    //   "https://admin.socket.io",
    // ],
    credentials: true,
  },
});

let rooms = [];

io.on("connect", (socket) => {
  // yeni oyun oluşturulması
  socket.on("create-game", (payload) => {
    const game = {
      uuid: payload.uuid,
      name: payload.roomName,
      users: [],
      status: "playing",
    };

    rooms.push(game);
    console.log("game-create", game)
  });

  // odaya giriş
  socket.on("join-room", (payload) => {
    // oda var mı kontrol et
    let room = rooms.find((room) => room.uuid === payload.uuid);

    const user = {
      id: socket.id,
      room: payload.uuid,
      name: payload.name,
      idea: "",
    };

    // Oda oluşturulmamış ise yeni oda oluştur
    if (room === undefined) {
      rooms.push({
        uuid: payload.uuid,
        name: "RandomBatak-" + Math.floor(Math.random() * 100) + 1,
        users: [user],
        status: "playing",
      });

      room = rooms.find((room) => room.uuid === payload.uuid);
    } else {
      room.users.push(user);
    }

    // kullanıcıyı odaya dahil et
    socket.join(payload.uuid);

    // odaya kullanıcı listesini gönder
    io.sockets.in(payload.uuid).emit("welcome-room", room);
  });

  // oy kullanma
  socket.on("run-game", (payload) => {
    console.log("run-game", payload);

    rooms.map((room) => {
      if (room.uuid === payload.uuid) {
        room.users.map((user) => {
          if (user.id === socket.id) {
            user.idea = payload.idea;
            return user;
          }
        });
      }

      return room;
    });

    const room = rooms.find((room) => room.uuid === payload.uuid);
    io.sockets.in(payload.uuid).emit("welcome-room", room);
  });

  // oylamayı bitir
  socket.on("end-game", (payload) => {
    rooms.map((room) => {
      if (room.uuid === payload.uuid) {
        room.status = "finished";
        return room;
      }

      return room;
    });

    const room = rooms.find((room) => room.uuid === payload.uuid);
    io.sockets.in(payload.uuid).emit("finished-game", room);

    console.log("oyunu bitir");
  });

  // yeni oyun
  socket.on("new-game", (payload) => {
    rooms.map((room) => {
      if (room.uuid === payload.uuid) {
        room.status = "playing";

        room.users.map((user) => {
          if (user.id === socket.id) {
            user.idea = "";
            return user;
          }
        });

        return room;
      }

      return room;
    });

    const room = rooms.find((room) => room.uuid === payload.uuid);
    io.sockets.in(payload.uuid).emit("welcome-room", room);
  });
});

io.of("/").adapter.on("leave-room", (roomUuid, id) => {
  console.log(`socket ${id} has leave room ${roomUuid}`);

  rooms = rooms.map((room) => {
    if (room.uuid === roomUuid) {
      room.users = room.users.filter((i) => i.id !== id);
      return room;
    }

    return room;
  });
});

httpServer.listen(3000);
