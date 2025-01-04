import express from "express";
import 'dotenv/config';
import { connectDB } from "./config/database.js";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";


import userRoute from './routes/User.routes.js';
import profileRoute from "./routes/Profile.routes.js";
import boardRoute from "./routes/Board.routes.js";
import { errorMiddleware } from "./middlewares/tryCatch.js";
import { corsOptions } from "./constants/config.constants.js";
import { socketAuthenticator } from "./middlewares/auth.js";
import { CLICKED_ON_CELL_FROM_CLIENT, CLICKED_ON_CELL_FROM_SERVER, CREATE_ROOM, DESTROY_ROOM, ERROR_SAVING_GAME, JOIN_ROOM, OPPONENT_FOUND, OPPONENT_LEFT_MATCH_FROM_SERVER, OPPONENT_NOT_FOUND, PLAYER_ACCEPT_FOR_REMATCH_FROM_CLIENT, PLAYER_ACCEPT_FOR_REMATCH_FROM_SERVER, PLAYER_DONT_WANT_TO_PLAY_AGAIN_FROM_CLIENT, PLAYER_DONT_WANT_TO_PLAY_AGAIN_FROM_SERVER, PLAYER_LEFT_MATCH_FROM_CLIENT, PLAYER_WANT_TO_PLAY_AGAIN_FROM_CLIENT, PLAYER_WANT_TO_PLAY_AGAIN_FROM_SERVER, ROOM_READY, SEARCH_FOR_AN_OPPONENT, WINNER_NOTIFICATION_FROM_CLIENT, WINNER_NOTIFICATION_FROM_SERVER } from "./constants/events.js";

// Constants from .env
const PORT = process.env.PORT || 3000;

// used to store the user's socket id
const userSocketIDs = new Map();

// used to store all the rooms
const allRooms = new Array();


// Connect to database
connectDB()

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: corsOptions,
});

app.set("io", io);

// Apply middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

// mounting routes
app.use("/api/v1/user", userRoute)
app.use("/api/v1/profile", profileRoute)
app.use("/api/v1/board", boardRoute)


app.get("/", (req, res) => {
    res.send("Hello World");
});

io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res,
        async (err) => {
            await socketAuthenticator(err, socket, next);
        });
})

io.on("connection", (socket) => {
    console.log("a user connected", socket.id);
    const user = socket.user;
    // console.log("USER IS", user);
    const userStatus = {
        socketID: socket.id,
        online: true,
        playing: false,
        userDetail: user,
        searching: false,
    }
    let opponentPlayer = null;
    let currentPlayer = null;

    userSocketIDs.set(socket.id, userStatus);

    // handle when user is searching for an opponent
    socket.on(SEARCH_FOR_AN_OPPONENT, async ({ userID, boardID }) => {
        console.log("searching for an opponent");

        currentPlayer = userSocketIDs.get(socket.id);

        // console.log("currentPlayer", currentPlayer);
        currentPlayer.searching = true;
        currentPlayer.boardID = boardID;

        for (const [key, user] of userSocketIDs.entries()) {
            if (user.online && user.playing === false && key !== socket.id && user.searching === true) {
                opponentPlayer = user;
                break;
            }
        }

        if (opponentPlayer) {
            // console.log("Opponent found for", currentPlayer.userDetail.userName, "and", opponentPlayer.userDetail.userName);
            allRooms.push({
                player1: currentPlayer,
                player2: opponentPlayer,
                roomId: null
            })

            currentPlayer.playing = true;
            opponentPlayer.playing = true;

            currentPlayer.searching = false;
            opponentPlayer.searching = false;

            //TODO: Create a new Game document
            // const newGame = new Game({
            //     players: [currentPlayer.userDetail._id, opponentPlayer.userDetail._id],
            //     boards: [currentPlayer.boardID, opponentPlayer.boardID],
            //     status: "inProgress"
            // });

            try {
                // await newGame.save();
                // console.log("Game saved successfully:", newGame._id);

                io.to(currentPlayer.socketID).emit(OPPONENT_FOUND, {
                    currentPlayer,
                    opponentPlayer,
                    currentTurn: currentPlayer.userDetail.userName,
                    // gameId: newGame._id // Send the game ID to the clients
                });

                io.to(opponentPlayer.socketID).emit(OPPONENT_FOUND, {
                    currentPlayer: opponentPlayer,
                    opponentPlayer: currentPlayer,
                    currentTurn: currentPlayer.userDetail.userName,
                    // gameId: newGame._id // Send the game ID to the clients
                });
            } catch (error) {
                console.error("Error saving game:", error);
                // emit an event, to notify the user that an error occured

                io.to(currentPlayer.socketID).emit(ERROR_SAVING_GAME, {
                    message: "Error in saving the game",
                });

                io.to(opponentPlayer.socketID).emit(ERROR_SAVING_GAME, {
                    message: "Error in saving the game",
                });
            }
        }
    })

    // Handle when opponent is not found
    socket.on(OPPONENT_NOT_FOUND, ({ socketId }) => {
        console.log("Opponent not found", socketId);
        const user = userSocketIDs.get(socketId);
        user.searching = false;
    })

    // Handle when opponent left the match
    socket.on(CLICKED_ON_CELL_FROM_CLIENT, ({ cell, currentTurn, player1, player2 }) => {
        const nextTurn = currentTurn === player1.userDetail.userName ? player2.userDetail.userName : player1.userDetail.userName
        io.to(player1.socketID).emit(CLICKED_ON_CELL_FROM_SERVER, { cell, nextTurn });
        io.to(player2.socketID).emit(CLICKED_ON_CELL_FROM_SERVER, { cell, nextTurn });
    });

    // Handle when opponent left the match
    socket.on(WINNER_NOTIFICATION_FROM_CLIENT, ({ winner, looser }) => {
        console.log("winner player1 ", winner);
        console.log("looser player2 ", looser);

        // 1st set playing to false for both players
        winner.playing = false;
        looser.playing = false;

        io.to(winner.socketID).emit(WINNER_NOTIFICATION_FROM_SERVER, { status: "WON" });
        io.to(looser.socketID).emit(WINNER_NOTIFICATION_FROM_SERVER, { status: "LOST" });
    });

    //  Handle when a player doesn't want to play again
    socket.on(PLAYER_DONT_WANT_TO_PLAY_AGAIN_FROM_CLIENT, ({ player1, player2 }) => {
        console.log("player1 ", player1);
        console.log("player2 ", player2);

        // 1st set playing to false for both players
        player1.playing = false;
        player2.playing = false;

        // then remove the room from allRooms
        allRooms.splice(allRooms.indexOf({ player1: currentPlayer, player2: opponentPlayer }), 1);

        // send to only player2
        io.to(player2.socketID).emit(PLAYER_DONT_WANT_TO_PLAY_AGAIN_FROM_SERVER, { message: "Player1 doesn't want to play again" });
    });

    // Handle when player want to play again
    socket.on(PLAYER_WANT_TO_PLAY_AGAIN_FROM_CLIENT, ({ player1, player2 }) => {
        io.to(player2.socketID).emit(PLAYER_WANT_TO_PLAY_AGAIN_FROM_SERVER, { message: "Player1 wants to play again" });
    });

    // Handle when player accept for rematch
    socket.on(PLAYER_ACCEPT_FOR_REMATCH_FROM_CLIENT, ({ player1, player2 }) => {
        console.log("From player accept for rematch");
        console.log("Player1 ", player1);
        console.log("Player2 ", player2);
        io.to(player1.socketID).emit(PLAYER_ACCEPT_FOR_REMATCH_FROM_SERVER, { currentTurn: currentPlayer.userDetail.userName });
        io.to(player2.socketID).emit(PLAYER_ACCEPT_FOR_REMATCH_FROM_SERVER, { currentTurn: currentPlayer.userDetail.userName });
    });

    // Handle when player leave the match
    const handlePlayerLeavetheMatch = (socketId) => {
        const user = userSocketIDs.get(socketId);

        // Update user's state
        // user.online = false;
        user.playing = false;
        user.searching = false;

        for (let index = 0; index < allRooms.length; index++) {
            const { player1, player2, roomId } = allRooms[index];

            if (player1 && player2 && (player1?.socketID === socketId || player2?.socketID === socketId)) {
                // Determine the opponent
                const opponent = player1.socketID === socketId ? player2 : player1;

                // Update both players' states
                player1.playing = false;
                player2.playing = false;

                // Remove room from allRooms
                allRooms.splice(index, 1);

                // Notify the opponent that the user left
                io.to(opponent.socketID).emit(OPPONENT_LEFT_MATCH_FROM_SERVER, {
                    winner: opponent.userDetail.userName
                });
                break;
            }
        }
    };


    socket.on(PLAYER_LEFT_MATCH_FROM_CLIENT, ({ socketId }) => {
        handlePlayerLeavetheMatch(socketId);
    })

    // Create Room (Play with Friend)
    socket.on(CREATE_ROOM, ({ roomId, boardID }, callback) => {
        if (allRooms.find((room) => room.roomId === roomId)) {
            return callback({ success: false, message: 'Room ID already exists' });
        }

        currentPlayer = userSocketIDs.get(socket.id);
        currentPlayer.boardID = boardID;

        const newRoom = {
            roomId,
            player1: currentPlayer,
            player2: null,
        };

        allRooms.push(newRoom);
        socket.join(roomId);

        callback({ success: true, roomId });
    });

    // Destroy Room (Play with Friend)
    socket.on(DESTROY_ROOM, ({ roomId }, callback) => {
        const room = allRooms.find((r) => r.roomId === roomId);
        if (!room) {
            return callback({ success: false, message: 'Room ID does not exist' });
        }
        allRooms.splice(allRooms.indexOf(room), 1);
        callback({ success: true, message: 'Room destroyed successfully' });
    });


    // Join Room (Play with Friend)
    socket.on(JOIN_ROOM, ({ boardID, roomId }, callback) => {
        const room = allRooms.find((r) => r.roomId === roomId);
        if (!room) {
            return callback({ success: false, message: 'Room ID does not exist' });
        }

        if (room.player2) {
            return callback({ success: false, message: 'Room is full' });
        }


        opponentPlayer = userSocketIDs.get(socket.id);
        opponentPlayer.boardID = boardID;

        currentPlayer = room.player1;
        room.player2 = opponentPlayer;

        currentPlayer.playing = true;
        opponentPlayer.playing = true;

        console.log("room", room);


        socket.join(roomId);

        io.to(currentPlayer.socketID).emit(OPPONENT_FOUND, {
            currentPlayer,
            opponentPlayer,
            currentTurn: currentPlayer.userDetail.userName,
            // gameId: newGame._id // Send the game ID to the clients
        });

        io.to(opponentPlayer.socketID).emit(OPPONENT_FOUND, {
            currentPlayer: opponentPlayer,
            opponentPlayer: currentPlayer,
            currentTurn: currentPlayer.userDetail.userName,
            // gameId: newGame._id // Send the game ID to the clients
        });
        callback({ success: true, roomId });
    });

    socket.on("disconnect", () => {
        const socketId = socket.id;
        const user = userSocketIDs.get(socketId);
        user.online = false;
        user.playing = false;
        handlePlayerLeavetheMatch(socketId);
    });
});

app.use(errorMiddleware)

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
