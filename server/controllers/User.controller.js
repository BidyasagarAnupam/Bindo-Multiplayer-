import { TryCatch } from "../middlewares/tryCatch.js";
import { User } from "../models/User.models.js";
import { Profile } from '../models/Profile.models.js';
import { ErrorHandler } from "../utils/utility.js";
import { compare } from "bcrypt";
import { sendToken } from "../utils/features.js";

// SignUp Controller
const newUser = TryCatch(async (req, res, next) => {
    const { userName, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return next(new ErrorHandler("Email is already is exist", 500))
    }

    // create profileDetails
    const profileDetails = await Profile.create({
        displayName: null,
        gender: null,
        dob: null,
        avatar: `https://api.dicebear.com/5.x/initials/svg?seed=${userName}`,

    });

    const user = await User.create({
        userName,
        email,
        password,
        profileDetails: profileDetails._id
    });

    console.log("User is", user);

    return res.status(200).json({
        success: true,
        message: "User created succesfull",
        user
    })
});

// Login controller
const loginUser = TryCatch(async (req, res, next) => {
    // 
    const { emailOrUsername, password } = req.body;

    let user;
    if (emailOrUsername.includes('@')) {
        user = await User.findOne({ email: emailOrUsername }).select("+password").populate({
            path: "profileDetails"
        });
    } else {
        user = await User.findOne({ userName: emailOrUsername }).select("+password").populate({
            path: "profileDetails"
        });;
    }

    if (!user) {
        return next(new ErrorHandler("Invalid email/username", 400));
    }

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid password", 400));
    }

    // here i dont want to send password
    user.password = ""

    sendToken(res, user, 200, `Welcome back ${user.userName}`);
});

const usernameCheck = TryCatch(async (req, res, next) => {
    const { userName } = req.body;

    const user = await User.findOne({ userName });
    
    if (user) {
        return next(new ErrorHandler("Username is already exist", 400));
    }

    return res.status(200).json({
        success: true,
        message: "Username is available"
    })
})


export {
    newUser,
    loginUser,
    usernameCheck
}