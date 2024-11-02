/*
1. get user details done
2. update user details done
7. Update Diplay Picture TODO
6. Update password TODO
3. send friend request TODO
4. accept friend request TODO
5. reject friend request TODO
*/

import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { getMyProfile, updateProfile } from "../controllers/Profile.controller.js";
import { updateProfileValidator, validateHandler } from "../lib/validators.js";

const router = express.Router();


// After here user must be logged in to access the routes
router.use(isAuthenticated);

router.get("/my-profile", getMyProfile)
router.post("/update-profile", updateProfileValidator(), validateHandler, updateProfile)


export default router;

