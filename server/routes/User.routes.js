/*
1. sign up
2. login
*/
import express from "express";
import { loginValidator, registerValidator, validateHandler } from "../lib/validators.js";
import { loginUser, newUser } from "../controllers/User.controller.js";


const router = express.Router();
router.post("/new", registerValidator(), validateHandler, newUser);
router.post("/login", loginValidator(), validateHandler, loginUser)


// TODO: Add routes for the following:

// Route for generating a reset password token
// router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
// router.post("/reset-password", resetPassword)


export default router;