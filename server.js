const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Multiplayer server is running");
});

const wss = new WebSocket.Server({ server });

const rooms = new Map();

function generateRoomCode() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code;

    do {
        code = "";

        for (let i = 0; i < 6; i++) {
            code += characters[Math.floor(Math.random() * characters.length)];
        }
    } while (rooms.has(code));

    return code;
}

function send(socket, data) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    }
}

wss.on("connection", (socket) => {
    console.log("PLAYER CONNECTED");

    socket.roomCode = null;
    socket.playerNumber = null;

    send(socket, {
        type: "connected"
    });

    socket.on("message", (message) => {
        let data;

        try {
            data = JSON.parse(message.toString());
        } catch {
            return;
        }

        if (data.type === "create_room") {
            const code = generateRoomCode();

            rooms.set(code, {
                players: [socket]
            });

            socket.roomCode = code;
            socket.playerNumber = 1;

            console.log("Room created:", code);

            send(socket, {
                type: "room_created",
                code: code,
                player_number: 1
            });

            return;
        }

        if (data.type === "join_room") {
            const code = String(data.code || "").toUpperCase();
            const room = rooms.get(code);

            if (!room) {
                send(socket, {
                    type: "error",
                    message: "Room not found."
                });

                return;
            }

            if (room.players.length >= 2) {
                send(socket, {
                    type: "error",
                    message: "Room is full."
                });

                return;
            }

            room.players.push(socket);

            const host = room.players[0];

            send(host, {
                type: "player_joined",
                player_number: 2
            });

            socket.roomCode = code;
            socket.playerNumber = 2;

            console.log("Player 2 joined:", code);

            send(socket, {
                type: "room_joined",
                code: code,
                player_number: 2
            });

            for (const player of room.players) {
                send(player, {
                    type: "game_start"
                });
            }

            return;
        }

        if (data.type === "player_update") {
            const code = socket.roomCode;

            if (!code || !rooms.has(code)) {
                return;
            }

            const room = rooms.get(code);

            for (const player of room.players) {
                if (player !== socket) {
                    send(player, {
                        type: "player_update",
                        player_number: socket.playerNumber,
                        position: data.position,
                        rotation: data.rotation
                    });
                }
            }
        }
    });

    socket.on("close", () => {
        console.log("PLAYER DISCONNECTED");

        const code = socket.roomCode;

        if (!code || !rooms.has(code)) {
            return;
        }

        const room = rooms.get(code);

        room.players = room.players.filter(
            player => player !== socket
        );

        for (const player of room.players) {
            send(player, {
                type: "player_left"
            });
        }

        if (room.players.length === 0) {
            rooms.delete(code);
        }
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
});
