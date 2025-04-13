import { TryCatch } from "../middlewares/tryCatch.js";
import { Game } from "../models/Game.models.js";
import { formatTimeTaken } from "../utils/timeFormatter.js";
import { ErrorHandler } from "../utils/utility.js";

// Game history controller
const getGameHistory = TryCatch(async (req, res, next) => {
    const userId = req.userId;
    let { page, limit } = req.query;

    page = parseInt(page) || 0;   // Default to 0 if not provided
    limit = parseInt(limit) || 10; // Default to 10 if not provided()

    const games = await Game.find({
        players: userId,  // Matches if userId is in the players array
        status: "completed",
    })
        .sort({ createdAt: -1 })  // Latest games first
        .skip(page * limit)  // Skip previous pages
        .limit(limit)  // Fetch only required records
        .select("-status -__v -boards") // Exclude status field
        .populate({
            path: "players",
            model: "User",
            select: "_id userName profileDetails",
            populate: {
                path: "profileDetails",  // Nested population
                model: "Profile",  // Reference model
                select: "avatar"
            }
        })
        .populate({
            path: "winner",
            model: "User",
            select: "_id userName"  // Exclude allGames field from winner
        });

    // Count total completed games for this user
    const totalCount = await Game.countDocuments({
        players: userId,
        status: "completed"
    });

    // If no games are found, return an error
    if (!games.length) return next(new ErrorHandler("No games found", 404));

    // Add a field to indicate if the user won the game
    const formattedGames = games.map(game => {
        // Time difference in milliseconds
        const timeTakenMs = game.updatedAt - game.createdAt;

        // Find the opponent by filtering out the current user
        const opponent = game.players.find(player => player._id.toString() !== userId);

        // Convert the game object to JSON and exclude createdAt & updatedAt
        const { createdAt, updatedAt, winner, ...gameData } = game.toObject();

        return {
            ...gameData,
            players: opponent,
            isWinner: game.winner?._id?.toString() === userId,
            timeTaken: formatTimeTaken(timeTakenMs),  // Convert to hh:mm:ss format
        };
    });

    return res.status(200).json({
        success: true,
        formattedGames,
        hasMore: (page + 1) * limit < totalCount  // If there are more games to fetch
    });
});


export {
    getGameHistory
}