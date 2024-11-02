/*
1. Create a Board
2. Update a Board
3. Get a Board
4. Get All Boards
5. Delete a Board
*/

import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";

import { createBoardValidator, validateHandler } from "../lib/validators.js";
import { createBoard, deleteBoard, getAllBoards, getBoard, updateBoard } from "../controllers/Board.controller.js";

const router = express.Router();


// After here user must be logged in to access the routes
router.use(isAuthenticated);

router.post("/create-board", createBoardValidator(), validateHandler, createBoard)
router.put("/update-board/:boardId", createBoardValidator(), validateHandler, updateBoard)
router.get("/get-board/:boardId", getBoard)
router.get("/get-all-boards", getAllBoards)
router.delete("/delete-board/:boardId", deleteBoard)



export default router;

