const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 10000;
const MAX_PLAYERS = 8;

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

function broadcast(room, data) {
    for (const player of room.players) {
        send(player.socket, data);
    }
}

function getPlayerData(player) {
    return {
        player_number: player.playerNumber,
        player_name: player.name,
        player_color: player.color,
        skin_index: player.skinIndex
    };
}

function getAllPlayerData(room) {
    return room.players.map(player => getPlayerData(player));
}

function findAvailablePlayerNumber(room) {
    for (let i = 1; i <= MAX_PLAYERS; i++) {
        const alreadyUsed = room.players.some(
            player => player.playerNumber === i
        );

        if (!alreadyUsed) {
            return i;
        }
    }

    return null;
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

            const player = {
                socket: socket,
                playerNumber: 1,
                name: String(data.player_name || "Player 1"),
                color: data.player_color || {
                    r: 1,
                    g: 1,
                    b: 1,
                    a: 1
                },
                skinIndex: Number(data.skin_index || 0)
            };

            rooms.set(code, {
                players: [player],
                started: false,
                seed: Math.floor(Math.random() * 2147483647)
            });

            socket.roomCode = code;
            socket.playerNumber = 1;

            console.log("Room created:", code);

            send(socket, {
                type: "room_created",
                code: code,
                player_number: 1,
                players: getAllPlayerData(rooms.get(code)),
                seed: rooms.get(code).seed
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

            if (room.started) {
                send(socket, {
                    type: "error",
                    message: "Game has already started."
                });

                return;
            }

            if (room.players.length >= MAX_PLAYERS) {
                send(socket, {
                    type: "error",
                    message: "Room is full."
                });

                return;
            }

            const playerNumber = findAvailablePlayerNumber(room);

            if (playerNumber === null) {
                send(socket, {
                    type: "error",
                    message: "Room is full."
                });

                return;
            }

            const player = {
                socket: socket,
                playerNumber: playerNumber,
                name: String(
                    data.player_name || "Player " + playerNumber
                ),
                color: data.player_color || {
                    r: 1,
                    g: 1,
                    b: 1,
                    a: 1
                },
                skinIndex: Number(data.skin_index || 0)
            };

            room.players.push(player);

            socket.roomCode = code;
            socket.playerNumber = playerNumber;

            console.log(
                "Player " + playerNumber + " joined:",
                code
            );

            send(socket, {
                type: "room_joined",
                code: code,
                player_number: playerNumber,
                players: getAllPlayerData(room),
                seed: room.seed
            });

            broadcast(room, {
                type: "player_joined",
                player_number: playerNumber,
                player_name: player.name,
                player_color: player.color,
                skin_index: player.skinIndex
            });

            return;
        }

        if (data.type === "start_game") {
            const code = socket.roomCode;

            if (!code || !rooms.has(code)) {
                return;
            }

            const room = rooms.get(code);

            if (socket.playerNumber !== 1) {
                return;
            }

            if (room.started) {
                return;
            }

            room.started = true;

            console.log("Game started:", code);

            broadcast(room, {
                type: "game_start",
                seed: room.seed,
                players: getAllPlayerData(room)
            });

            return;
        }

        if (data.type === "player_update") {
            const code = socket.roomCode;

            if (!code || !rooms.has(code)) {
                return;
            }

            const room = rooms.get(code);

            for (const player of room.players) {
                if (player.socket !== socket) {
                    send(player.socket, {
                        type: "player_update",
                        player_number: socket.playerNumber,
                        position: data.position,
                        rotation: data.rotation
                    });
                }
            }

            return;
        }
    });

    socket.on("close", () => {
        console.log("PLAYER DISCONNECTED");

        const code = socket.roomCode;

        if (!code || !rooms.has(code)) {
            return;
        }

        const room = rooms.get(code);

        const leavingPlayer = room.players.find(
            player => player.socket === socket
        );

        room.players = room.players.filter(
            player => player.socket !== socket
        );

        if (leavingPlayer) {
            for (const player of room.players) {
                send(player.socket, {
                    type: "player_left",
                    player_number: leavingPlayer.playerNumber
                });
            }
        }

        if (room.players.length === 0) {
            rooms.delete(code);
            console.log("Room deleted:", code);
        }
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
});
