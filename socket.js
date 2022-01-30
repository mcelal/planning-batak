const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:8080", "https://admin.socket.io"],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
});

// let users = [];
let rooms = [];

io.on("connect", (socket) => {
  // yeni oyun oluşturulması
  socket.on("create-game", (payload) => {
    const game = {
      createdBy: socket.id,
      uuid: payload.uuid,
      name: payload.roomName,
      // selectedNumbers: [],
      users: [],
    };

    rooms.push(game);
  });

  // odaya giriş
  socket.on("join-room", (payload) => {
    // oda var mı kontrol et
    let room = rooms.find((room) => room.uuid === payload.uuid);

    const user = {
      id: socket.id,
      room: payload.uuid,
      name: payload.name,
      idea: null,
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

    socket.join(payload.uuid);

    // console.log("joining room:", room, room.users);

    // odaya kullanıcı listesini gönder
    io.sockets.in(payload.uuid).emit("welcome-room", room);
  });

  // oy kullanma
  socket.on("run-game", (payload) => {
    // const room = rooms.find(i => i.uuid === payload.uuid)
    console.log(payload);

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
    // console.log("oy-donus", room.users);

    // console.log("oy kullanildi", payload, rooms);
    // // rooms[payload.uuid]["selectedNumbers"][socket.id] = payload.number;
    // io.sockets.in(payload.uuid).emit(
    //   "run-game",
    //   rooms.filter((room) => room.gameId === payload.uuid)
    // );
  });

  // oylamayı bitir
  socket.on("end-game", (payload) => {
    rooms.map((room) => {
      if (room.uuid === payload.uuid) {
        room.status = "finished";
        console.log("finis yapıldı");
        return room;
      }

      return room;
    });

    const room = rooms.find((room) => room.uuid === payload.uuid);
    io.sockets.in(payload.uuid).emit("welcome-room", room);

    console.log("oyunu bitir");
  });

  // yeni oyun
  socket.on("new-game", (payload) => {
    rooms.map((room) => {
      if (room.uuid === payload.uuid) {
        room.status = "playing";

        room.users.map((user) => {
          if (user.id === socket.id) {
            user.idea = null;
            return user;
          }
        });

        return room;
      }

      return room;
    });

    const room = rooms.find((room) => room.uuid === payload.uuid);
    io.sockets.in(payload.uuid).emit("welcome-room", room);

    console.log("oyunu bitir");
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

  // users = users.filter((user) => user.id !== id);

  // io.sockets.in(room).emit("welcome-room", users);
});

// io.on("connection", (socket) => {
//   socket.on("create-game", (payload) => {
//     const game = {
//       created_by: socket.id,
//       game_id: payload.uuid,
//       type: payload.type,
//       name: payload.roomName,
//     };
//
//     // Oyun bilgilerini geri gönder
//     socket.emit("game-" + game.game_id, game);
//     console.log("oyun oluştur");
//   });
//
//   socket.on("join-room", (uuid) => {
//     const users = [];
//     for (let [id] of io.of("/").sockets) {
//       users.push({
//         userID: id,
//         username: "kullanici adi" + id,
//       });
//     }
//     socket.join(uuid);
//
//     socket.broadcast.in(uuid).emit("users", users);
//     socket.in(uuid).emit("welcome-room", users);
//   });
//
//   socket.on("disconnecting", () => {
//     console.log(socket.rooms);
//   });
// });

httpServer.listen(3000);
