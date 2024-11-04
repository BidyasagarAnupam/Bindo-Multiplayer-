import { TryCatch } from "../middlewares/tryCatch.js";
import { Board } from "../models/Board.models.js";
import { User } from "../models/User.models.js";
import { ErrorHandler } from "../utils/utility.js";


// SignUp Controller
const createBoard = TryCatch(async (req, res, next) => {
    const { board } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) return next(new ErrorHandler("User not found", 404));

    const newBoard = await Board.create({
        board,
        user: userId
    });

    user.allBoards.push(newBoard._id);

    await user.save();

    return res.status(201).json({
        success: true,
        newBoard,
        message: "Board created successfully"
    });

});

const updateBoard = TryCatch(async (req, res, next) => {
    const { boardId } = req.params;
    const { board } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) return next(new ErrorHandler("User not found", 404));

    const boardToUpdate = await Board.findById(boardId);

    if (!boardToUpdate) return next(new ErrorHandler("Board not found", 404));

    if (boardToUpdate.user.toString() !== userId) {
        return next(new ErrorHandler("You are not authorized to update this board", 401));
    }

    boardToUpdate.board = board;

    await boardToUpdate.save();

    return res.status(200).json({
        success: true,
        boardToUpdate,
        message: "Board updated successfully"
    });
})

// Get a Board Controller code...
const getBoard = TryCatch(async (req, res, next) => {
    const { boardId } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) return next(new ErrorHandler("User not found", 404));

    const board = await Board.findById(boardId);

    if (!board) return next(new ErrorHandler("Board not found", 404));

    if (board.user.toString() !== userId) {
        return next(new ErrorHandler("You are not authorized to view this board", 401));
    }

    return res.status(200).json({
        success: true,
        board
    });
})

// Get All Boards Controller code...
const getAllBoards = TryCatch(async (req, res, next) => {
    const userId = req.userId;

    const user = await User.findById(userId).populate({ path: "allBoards" });

    if (!user) return next(new ErrorHandler("User not found", 404));

    return res.status(200).json({
        success: true,
        boards: user.allBoards,
        message: "All boards fetched successfully"
    });
})

// Delete a Board Controller code...
const deleteBoard = TryCatch(async (req, res, next) => {
    const { boardId } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) return next(new ErrorHandler("User not found", 404));

    const board = await Board.findById(boardId);

    if (!board) return next(new ErrorHandler("Board not found", 404));

    if (board.user.toString() !== userId) {
        return next(new ErrorHandler("You are not authorized to delete this board", 401));
    }

    // remove from user's allBoards array
    user.allBoards = user.allBoards.filter((b) => b.toString() !== boardId);

    await board.remove();

    return res.status(200).json({
        success: true,
        message: "Board deleted successfully"
    });

})



export {
    createBoard,
    updateBoard,
    getBoard,
    getAllBoards,
    deleteBoard
}