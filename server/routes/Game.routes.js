import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { getGameHistory } from "../controllers/Game.controller.js";

const router = express.Router();


// After here user must be logged in to access the routes
router.use(isAuthenticated);

router.get("/get-gameHistory", getGameHistory)

export default router;