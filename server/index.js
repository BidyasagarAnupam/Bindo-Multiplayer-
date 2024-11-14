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
import { CLICKED_ON_CELL_FROM_CLIENT, CLICKED_ON_CELL_FROM_SERVER, ERROR_SAVING_GAME, OPPONENT_FOUND, OPPONENT_LEFT_MATCH, OPPONENT_NOT_FOUND, SEARCH_FOR_AN_OPPONENT, WINNER_NOTIFICATION_FROM_CLIENT, WINNER_NOTIFICATION_FROM_SERVER } from "./constants/events.js";
import { Game } from "./models/Game.models.js";

// Constants from .env
const PORT = process.env.PORT || 3000;
const userSocketIDs = new Map();
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
            })

            currentPlayer.playing = true;
            opponentPlayer.playing = true;

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
        } else {
            io.to(currentPlayer.socketID).emit(OPPONENT_NOT_FOUND, {
                message: "No opponent found",
            });
        }
    })

    socket.on(CLICKED_ON_CELL_FROM_CLIENT, ({ cell, currentTurn, player1, player2 }) => {
        const nextTurn = currentTurn === player1.userDetail.userName ? player2.userDetail.userName : player1.userDetail.userName
        io.to(player1.socketID).emit(CLICKED_ON_CELL_FROM_SERVER, { cell, nextTurn });
        io.to(player2.socketID).emit(CLICKED_ON_CELL_FROM_SERVER, { cell, nextTurn });
    });

    socket.on(WINNER_NOTIFICATION_FROM_CLIENT, ({ winner, looser }) => {
        console.log("winner player1 ", winner);
        console.log("looser player2 ", looser);

        // 1st set playing to false for both players
        winner.playing = false;
        looser.playing = false;

        // then remove the room from allRooms
        allRooms.splice(allRooms.indexOf({ player1: currentPlayer, player2: opponentPlayer }), 1);

        io.to(winner.socketID).emit(WINNER_NOTIFICATION_FROM_SERVER, { status: "WON" });
        io.to(looser.socketID).emit(WINNER_NOTIFICATION_FROM_SERVER, { status: "LOST" });
    });

    // TODO: Handle when a player doesn't want to play again

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        // when a user disconnects, set their playing to false and searcing to false
        const user = userSocketIDs.get(socket.id);
        user.online = false;
        user.playing = false;
        user.searching = false;

        for (let index = 0; index < allRooms.length; index++) {
            const { player1, player2 } = allRooms[index];

            if (player1?.socketID === socket?.id) {
                console.log("player2 ", player2);
                io.to(player2.socketID).emit(OPPONENT_LEFT_MATCH);
                break;
            }

            if (player2?.socket?.id === socket?.id) {
                console.log("player1 ", player1);
                io.to(player1.socketID).emit(OPPONENT_LEFT_MATCH);
                break;
            }
        }
    });
});

app.use(errorMiddleware)

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
