const express = require("express");
const app = express();
const path = require("path");
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.NODE_ENV === "development" ? "*" : "",
  },
});

const PORT = process.env.PORT || 3000;
const staticPath = path.resolve(__dirname + "/../dist/");

app.use(express.static(staticPath));
app.get(/.*/, function (req, res) {
  res.sendFile(staticPath + "/index.html");
});

let rooms = [];

io.on("connect", (socket) => {
  console.log("Socket: User connect");
  // yeni oyun oluşturulması
  socket.on("create-game", (payload) => {
    const game = {
      uuid: payload.uuid,
      name: payload.roomName,
      users: [],
      status: "playing",
    };

    rooms.push(game);
    console.log("game-create", game);
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
    io.sockets.in(payload.uuid).emit("room-action", room);
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
    io.sockets.in(payload.uuid).emit("room-action", room);
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
    io.sockets.in(payload.uuid).emit("room-action", room);
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

  io.sockets.in(roomUuid).emit(
    "room-action",
    rooms.find((i) => i.uuid === roomUuid)
  );
});

server.listen(PORT, () => {
  console.log("Connected to port: " + PORT);
});
