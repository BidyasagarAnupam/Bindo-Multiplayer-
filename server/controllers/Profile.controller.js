import { TryCatch } from "../middlewares/tryCatch.js";
import { User } from "../models/User.models.js";
import { Board } from "../models/Board.models.js"; // both are required for the controller to work, so dont remove
import { Game } from "../models/Game.models.js"
import { Profile } from "../models/Profile.models.js";
import { BINGO_TOKEN } from "../constants/config.constants.js";
import { cookieOptions, uploadImageToCloudinary } from "../utils/features.js";


const getMyProfile = TryCatch(async (req, res, next) => {
    const userId = req.userId;

    const user = await User.findById(userId).populate({
        path: "profileDetails"
    }).populate({
        path: "allBoards"
    }).populate({
        path: "allGames"
    }).exec();

    if (!user) return next(new ErrorHandler("User not found", 404));


    return res.status(200).json({
        success: true,
        user,
    });
})

const updateProfile = TryCatch(async (req, res, next) => {
    const { displayName, gender, dob } = req.body;

    const userId = req.userId;

    let user = await User.findById(userId);

    if (!user) return next(new ErrorHandler("User not found", 404));

    const profileId = user.profileDetails

    let profileDetails = await Profile.findById(profileId);

    if (!profileDetails) return next(new ErrorHandler("Profile details not found", 404));

    profileDetails.displayName = displayName
    profileDetails.gender = gender
    profileDetails.dob = dob

    await profileDetails.save();

    user = await User.findById(userId).populate({
        path: "profileDetails"
    }).populate({
        path: "allBoards"
    }).populate({
        path: "allGames"
    }).exec();

    return res.status(200).json({
        success: true,
        user,
        message: "Profile update Successful"
    });

})

const updateProfilePicture = TryCatch(async (req, res, next) => {
    const userId = req.userId;
    const profilePicture = req.files?.profilePicture

    console.log("Profile Picture ", req?.files?.profilePicture);

    let user = await User.findById(userId);

    if (!user) return next(new ErrorHandler("User not found", 404));

    const profileId = user.profileDetails

    let profileDetails = await Profile.findById(profileId);

    if (!profileDetails) return next(new ErrorHandler("Profile details not found", 404));

    const image = await uploadImageToCloudinary(
        profilePicture,
        process.env.FOLDER_NAME,
        1000,
        1000
    )

    profileDetails.avatar = image.secure_url

    await profileDetails.save();

    user = await User.findById(userId).populate({
        path: "profileDetails"
    }).populate({
        path: "allBoards"
    }).populate({
        path: "allGames"
    }).exec();

    return res.status(200).json({
        success: true,
        user,
        message: "Profile Picture updated Successful"
    });

})

const logout = TryCatch(async (req, res) => {
    return res
        .status(200)
        .cookie(BINGO_TOKEN, "", { ...cookieOptions, maxAge: 0 })
        .json({
            success: true,
            message: "Logged out successfully",
        });
});



export {
    getMyProfile,
    updateProfile,
    updateProfilePicture,
    logout
}