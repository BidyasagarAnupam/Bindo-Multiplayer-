import express from "express";
import 'dotenv/config';
import { connectDB } from "./config/database.js";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";

import userRoute from './routes/User.routes.js';
import profileRoute from "./routes/Profile.routes.js";
import boardRoute from "./routes/Board.routes.js";
import gameRoute from "./routes/Game.routes.js"

import { errorMiddleware } from "./middlewares/tryCatch.js";
import { corsOptions } from "./constants/config.constants.js";
import { socketAuthenticator } from "./middlewares/auth.js";
import { CLICKED_ON_CELL_FROM_CLIENT, CLICKED_ON_CELL_FROM_SERVER, CREATE_ROOM, DESTROY_ROOM, ERROR_SAVING_GAME, JOIN_ROOM, OPPONENT_FOUND, OPPONENT_LEFT_MATCH_FROM_SERVER, OPPONENT_NOT_FOUND, PLAYER_ACCEPT_FOR_REMATCH_FROM_CLIENT, PLAYER_ACCEPT_FOR_REMATCH_FROM_SERVER, PLAYER_DONT_WANT_TO_PLAY_AGAIN_FROM_CLIENT, PLAYER_DONT_WANT_TO_PLAY_AGAIN_FROM_SERVER, PLAYER_LEFT_MATCH_FROM_CLIENT, PLAYER_WANT_TO_PLAY_AGAIN_FROM_CLIENT, PLAYER_WANT_TO_PLAY_AGAIN_FROM_SERVER, ROOM_READY, SEARCH_FOR_AN_OPPONENT, WINNER_NOTIFICATION_FROM_CLIENT, WINNER_NOTIFICATION_FROM_SERVER } from "./constants/events.js";
import { cloudinaryConnect } from "./config/cloudinary.js";
import { Game } from "./models/Game.models.js";
import { User } from "./models/User.models.js";
import mongoose from "mongoose";
import { Profile } from "./models/Profile.models.js";

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
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp",
    })
)

cloudinaryConnect()

// mounting routes
app.use("/api/v1/user", userRoute)
app.use("/api/v1/profile", profileRoute)
app.use("/api/v1/board", boardRoute)
app.use("/api/v1/game", gameRoute)


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

        currentPlayer.searching = true;
        currentPlayer.boardID = boardID;

        for (const [key, user] of userSocketIDs.entries()) {
            if (user.online && user.playing === false && key !== socket.id && user.searching === true) {
                opponentPlayer = user;
                break;
            }
        }

        if (opponentPlayer) {
            allRooms.push({
                player1: currentPlayer,
                player2: opponentPlayer,
                roomId: null
            });

            currentPlayer.playing = true;
            opponentPlayer.playing = true;

            currentPlayer.searching = false;
            opponentPlayer.searching = false;

            // Start a MongoDB transaction
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // Create a new Game document for the match
                const newGame = new Game({
                    players: [currentPlayer.userDetail._id, opponentPlayer.userDetail._id],
                    boards: [currentPlayer.boardID, opponentPlayer.boardID],
                    status: "inProgress"
                });

                // Save the game with the transaction
                await newGame.save({ session });
                console.log("Game saved successfully:", newGame._id);

                // Find the player documents with profile details
                let player1 = await User.findById(currentPlayer.userDetail._id).session(session);
                let player2 = await User.findById(opponentPlayer.userDetail._id).session(session);


                // Update players' allGames arrays
                player1.allGames.push(newGame._id);
                player2.allGames.push(newGame._id);

                // Update the game ID for both players
                currentPlayer.gameId = newGame._id;
                opponentPlayer.gameId = newGame._id;

                // Save the updates to User model
                await player1.save({ session });
                await player2.save({ session });

                // Now update profileDetails directly
                await Profile.findByIdAndUpdate(player1.profileDetails, { $inc: { totalGamePlayed: 1 } }, { session });
                await Profile.findByIdAndUpdate(player2.profileDetails, { $inc: { totalGamePlayed: 1 } }, { session });

                // Commit the transaction
                await session.commitTransaction();
                session.endSession();

                // Fetch the updated players with populated profile details
                player1 = await User.findById(player1._id).populate("profileDetails");
                player2 = await User.findById(player2._id).populate("profileDetails");

                // Emit OPPONENT_FOUND event to both players
                io.to(currentPlayer.socketID).emit(OPPONENT_FOUND, {
                    currentPlayer: {
                        ...currentPlayer,
                        userDetail: player1
                    },
                    opponentPlayer: {
                        ...opponentPlayer,
                        userDetail: player2
                    },
                    currentTurn: currentPlayer.userDetail.userName,
                    gameId: newGame._id // Send the game ID to the clients
                });

                io.to(opponentPlayer.socketID).emit(OPPONENT_FOUND, {
                    currentPlayer: {
                        ...opponentPlayer,
                        userDetail: player2
                    },
                    opponentPlayer: {
                        ...currentPlayer,
                        userDetail: player1
                    },
                    currentTurn: currentPlayer.userDetail.userName,
                    gameId: newGame._id // Send the game ID to the clients
                });
            } catch (error) {
                // Abort the transaction in case of an error
                await session.abortTransaction();
                session.endSession();

                console.error("Error saving game:", error);

                currentPlayer.playing = false;
                opponentPlayer.playing = false;

                currentPlayer.searching = true;
                opponentPlayer.searching = true;

                // Emit an ERROR_SAVING_GAME event to notify the users
                io.to(currentPlayer.socketID).emit(ERROR_SAVING_GAME, {
                    message: "Error in saving the game",
                });

                io.to(opponentPlayer.socketID).emit(ERROR_SAVING_GAME, {
                    message: "Error in saving the game",
                });
            }
        }
    });


    // Handle when opponent is not found
    socket.on(OPPONENT_NOT_FOUND, ({ socketId }) => {
        console.log("Opponent not found", socketId);
        const user = userSocketIDs.get(socketId);
        user.searching = false;
    })

    // Handle when you clicked any cell
    socket.on(CLICKED_ON_CELL_FROM_CLIENT, ({ cell, currentTurn, player1, player2 }) => {
        const nextTurn = currentTurn === player1.userDetail.userName ? player2.userDetail.userName : player1.userDetail.userName
        io.to(player1.socketID).emit(CLICKED_ON_CELL_FROM_SERVER, { cell, nextTurn });
        io.to(player2.socketID).emit(CLICKED_ON_CELL_FROM_SERVER, { cell, nextTurn });
    });

    // Handle when game is over and notify the winner
    socket.on(WINNER_NOTIFICATION_FROM_CLIENT, async ({ winner, looser, gameId }) => {
        console.log("winner player1 ", winner);
        console.log("looser player2 ", looser);

        console.log("---------TESTING-----------");
        console.log("YAHAN AAYA Means someone won the match");

        // Start a MongoDB transaction for the rematch
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find the game using gameId
            const game = await Game.findById(gameId).session(session);

            if (!game) {
                throw new Error("Game not found");
            }

            // Update game status to completed
            game.status = "completed";

            // Fetch the opponent's user details
            let winnerDetails = await User.findById(winner.userDetail._id)
                .session(session);

            if (!winnerDetails) {
                throw new Error("Opponent details not found");
            }

            // Update the winner of the game
            game.winner = winner.userDetail._id;

            await game.save({ session });


            // Update profileDetails directly
            //TUpdate totalGameWon in opponent's profile
            await Profile.findByIdAndUpdate(winnerDetails.profileDetails, { $inc: { totalGameWon: 1 } }, { session });


            // Commit the transaction to finalize the changes
            await session.commitTransaction();
            session.endSession();

            // Fetch the updated players with populated profile details
            winnerDetails = await User.findById(winnerDetails._id).populate("profileDetails");

            // Update both players' states
            winner.playing = false;
            looser.playing = false;

            // Notify the opponent that the user left   
            io.to(looser.socketID).emit(WINNER_NOTIFICATION_FROM_SERVER, { status: "LOST" });
            io.to(winner.socketID).emit(WINNER_NOTIFICATION_FROM_SERVER, { status: "WON", userDetail: winnerDetails });
        } catch (error) {
            // Abort the transaction in case of any error during the rematch process
            await session.abortTransaction();
            session.endSession();

            console.error("Error saving game for rematch:", error);

            // Emit an error event to both players
            io.to(winner.socketID).emit(ERROR_SAVING_GAME, {
                message: "Error in saving the rematch game",
            });
            io.to(looser.socketID).emit(ERROR_SAVING_GAME, {
                message: "Error in saving the rematch game",
            });
        }
    });

    //  Handle when a player doesn't want to play again
    socket.on(PLAYER_DONT_WANT_TO_PLAY_AGAIN_FROM_CLIENT, ({ player1, player2 }) => {
        // console.log("player1 ", player1);
        // console.log("player2 ", player2);

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

    // Handle when player accepts for a rematch
    socket.on(PLAYER_ACCEPT_FOR_REMATCH_FROM_CLIENT, async ({ player1, player2 }) => {
        console.log("Player accepted for rematch");
        console.log("Player1: ", player1);
        console.log("Player2: ", player2);

        // Ensure both players are ready for the rematch
        // const currentPlayer = userSocketIDs.get(socket.id); // Current player is the one initiating the rematch
        // const opponentPlayer = player1.socketID === currentPlayer.socketID ? player2 : player1; // Find the opponent player

        // Start a MongoDB transaction for the rematch
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Create a new Game document for the rematch
            const newGame = new Game({
                players: [player1.userDetail._id, player2.userDetail._id],
                boards: [player1.boardID, player2.boardID],  // Reset the boards for the rematch
                status: "inProgress",  // Set the game status to in progress
            });

            // Save the new game with the session
            await newGame.save({ session });
            console.log("New Game created successfully:", newGame._id);

            let player1Details = await User.findById(player1.userDetail._id).session(session);
            let player2Details = await User.findById(player2.userDetail._id).session(session);

            // Update players' allGames arrays to include the new game
            player1Details.allGames.push(newGame._id);
            player2Details.allGames.push(newGame._id);

            // Save the updated player profiles
            await player1Details.save({ session });
            await player2Details.save({ session });

            // Update profileDetails directly, increment totalGamePlayed
            await Profile.findByIdAndUpdate(player1Details.profileDetails, { $inc: { totalGamePlayed: 1 } }, { session });
            await Profile.findByIdAndUpdate(player2Details.profileDetails, { $inc: { totalGamePlayed: 1 } }, { session });

            // Commit the transaction to finalize the changes
            await session.commitTransaction();
            session.endSession();

            // Fetch the updated players with populated profile details
            player1Details = await User.findById(player1Details._id).populate("profileDetails");
            player2Details = await User.findById(player2Details._id).populate("profileDetails");

            // Emit the OPPONENT_FOUND event to both players, starting the new game
            io.to(player1.socketID).emit(PLAYER_ACCEPT_FOR_REMATCH_FROM_SERVER, {
                currentPlayer: {
                    ...player1,
                    userDetail: player1Details
                },
                opponentPlayer: {
                    ...player2,
                    userDetail: player2Details
                },
                currentTurn: player1.userDetail.userName,  // Starting player for the rematch
                gameId: newGame._id  // Provide the new game ID
            });

            io.to(player2.socketID).emit(PLAYER_ACCEPT_FOR_REMATCH_FROM_SERVER, {
                currentPlayer: {
                    ...player2,
                    userDetail: player2Details
                },
                opponentPlayer: {
                    ...player1,
                    userDetail: player1Details
                },
                currentTurn: player1.userDetail.userName,  // Same starting player for both players
                gameId: newGame._id  // Provide the new game ID
            });
        } catch (error) {
            // Abort the transaction in case of any error during the rematch process
            await session.abortTransaction();
            session.endSession();

            console.error("Error saving game for rematch:", error);

            // Emit an error event to both players
            io.to(player1.socketID).emit(ERROR_SAVING_GAME, {
                message: "Error in saving the rematch game",
            });
            io.to(player2.socketID).emit(ERROR_SAVING_GAME, {
                message: "Error in saving the rematch game",
            });
        }
    });


    // Handle when player leave the match
    const handlePlayerLeavetheMatch = async (socketId, gameId) => {
        const session = await mongoose.startSession(); // Start a new session for transaction
        session.startTransaction();

        console.log("---------TESTING-----------");
        console.log("YAHAN AAYA player leave the match");

        try {
            const user = userSocketIDs.get(socketId);

            // Update user's state
            user.playing = false;
            user.searching = false;
            console.log("GAME ID -------> ", gameId);
            // Find the game using gameId
            let game = await Game.findById(gameId).session(session);

            if (!game) {
                throw new Error("Game not found");
            }

            // Find the room and notify the opponent
            for (let index = 0; index < allRooms.length; index++) {
                const { player1, player2 } = allRooms[index];

                if (player1 && player2 && (player1.socketID === socketId || player2.socketID === socketId)) {
                    // Determine the opponent
                    const opponent = player1.socketID === socketId ? player2 : player1;

                    // Update game status to completed
                    game.status = "completed";

                    // Fetch the opponent's user details
                    let opponentDetails = await User.findById(opponent.userDetail._id)
                        .session(session);

                    if (!opponentDetails) {
                        throw new Error("Opponent details not found");
                    }

                    // Update the winner of the game
                    game.winner = opponentDetails._id;

                    // Save the game with the transaction
                    await game.save({ session });

                    // console.log("totalGameWon", opponentDetails.profileDetails);

                    // Update the totalGameWon in the opponent's profile
                    await Profile.findByIdAndUpdate(opponentDetails.profileDetails, {
                        $inc: {
                            totalGameWon: 1
                        }
                    }, { session });

                    // Update both players' states
                    player1.playing = false;
                    player2.playing = false;

                    // Remove room from allRooms
                    allRooms.splice(index, 1);

                    opponentDetails = await User.findById(opponent.userDetail._id)
                        .populate("profileDetails")
                        .session(session);

                    // Notify the opponent that the user left
                    io.to(opponent.socketID).emit(OPPONENT_LEFT_MATCH_FROM_SERVER, {
                        winner: opponent.userDetail.userName,
                        updatedUserDetails: opponentDetails,
                    });

                    break;
                }
            }

            await session.commitTransaction(); // Commit the transaction
            session.endSession(); // End the session
        } catch (error) {
            console.error("Error in handlePlayerLeavetheMatch", error);
            await session.abortTransaction(); // Roll back the transaction on error
        }
    };



    socket.on(PLAYER_LEFT_MATCH_FROM_CLIENT, ({ socketId, gameId }) => {
        console.log("SOCKET ID FROM CLIENT", socketId);
        handlePlayerLeavetheMatch(socketId, gameId);
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


    //  Here also create Room document in the database
    // Join Room (Play with Friend)
    socket.on(JOIN_ROOM, async ({ boardID, roomId }, callback) => {
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

        currentPlayer.searching = false;
        opponentPlayer.searching = false;

        console.log("room", room);
        socket.join(roomId);

        // Start a MongoDB transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Create a new Game document for the match
            const newGame = new Game({
                players: [currentPlayer.userDetail._id, opponentPlayer.userDetail._id],
                boards: [currentPlayer.boardID, opponentPlayer.boardID],
                status: "inProgress"
            });

            // Save the game with the transaction
            await newGame.save({ session });
            console.log("Game saved successfully:", newGame._id);

            // Find the player documents with profile details
            let player1 = await User.findById(currentPlayer.userDetail._id).session(session);
            let player2 = await User.findById(opponentPlayer.userDetail._id).session(session);


            // Update players' allGames arrays
            player1.allGames.push(newGame._id);
            player2.allGames.push(newGame._id);

            // Update the game ID for both players
            currentPlayer.gameId = newGame._id;
            opponentPlayer.gameId = newGame._id;

            // Save the updates to User model
            await player1.save({ session });
            await player2.save({ session });

            // Now update profileDetails directly
            await Profile.findByIdAndUpdate(player1.profileDetails, { $inc: { totalGamePlayed: 1 } }, { session });
            await Profile.findByIdAndUpdate(player2.profileDetails, { $inc: { totalGamePlayed: 1 } }, { session });

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            // Fetch the updated players with populated profile details
            player1 = await User.findById(player1._id).populate("profileDetails");
            player2 = await User.findById(player2._id).populate("profileDetails");

            // Emit OPPONENT_FOUND event to both players
            io.to(currentPlayer.socketID).emit(OPPONENT_FOUND, {
                currentPlayer: {
                    ...currentPlayer,
                    userDetail: player1
                },
                opponentPlayer: {
                    ...opponentPlayer,
                    userDetail: player2
                },
                currentTurn: currentPlayer.userDetail.userName,
                gameId: newGame._id // Send the game ID to the clients
            });

            io.to(opponentPlayer.socketID).emit(OPPONENT_FOUND, {
                currentPlayer: {
                    ...opponentPlayer,
                    userDetail: player2
                },
                opponentPlayer: {
                    ...currentPlayer,
                    userDetail: player1
                },
                currentTurn: currentPlayer.userDetail.userName,
                gameId: newGame._id // Send the game ID to the clients
            });

            callback({ success: true, roomId });

        } catch (error) {
            // Abort the transaction in case of an error
            await session.abortTransaction();
            session.endSession();

            console.error("Error saving game:", error);

            currentPlayer.playing = false;
            opponentPlayer.playing = false;

            currentPlayer.searching = true;
            opponentPlayer.searching = true;

            // Emit an ERROR_SAVING_GAME event to notify the users
            io.to(currentPlayer.socketID).emit(ERROR_SAVING_GAME, {
                message: "Error in saving the game",
            });

            io.to(opponentPlayer.socketID).emit(ERROR_SAVING_GAME, {
                message: "Error in saving the game",
            });
        }
        
    });

    socket.on("disconnect", () => {
        const socketId = socket.id;
        const user = userSocketIDs.get(socketId);
        const isPlaying = user.playing;
        user.online = false;
        user.playing = false;
        if (isPlaying) {
            handlePlayerLeavetheMatch(socketId, user.gameId);
        }
    });
});

app.use(errorMiddleware)

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
