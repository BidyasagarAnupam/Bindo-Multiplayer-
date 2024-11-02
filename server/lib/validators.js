import { body, validationResult } from "express-validator";
import { ErrorHandler } from "../utils/utility.js";

const validateHandler = (req, res, next) => {
    const errors = validationResult(req);

    const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(", ");

    if (errors.isEmpty()) return next();
    else next(new ErrorHandler(errorMessages, 400));
};

const registerValidator = () => [
    body("userName", "Please Enter UserName")
        .notEmpty()
        .isAlphanumeric()
        .withMessage("Username should not contain special characters"),

    body("email", "Please Enter Email")
        .notEmpty()
        .isEmail()
        .withMessage("Please enter a valid email address"),
    body("password", "Please Enter Password")
        .notEmpty()
        .withMessage("Password should not be empty")
        .isLength({ min: 6 })
        .withMessage("Password must be minimum 6 characters")
    ,
];

const loginValidator = () => [
    body("emailOrUsername", "Please Enter Username or Email").notEmpty(),
    body("password", "Please Enter Password").notEmpty(),
];

const updateProfileValidator = () => [
    body("displayName", "Please enter your display name")
        .notEmpty()
        .withMessage("displayName can't be empty"),
    body("gender", "Please enter your gender")
        .notEmpty()
        .withMessage("gender can't be empty"),
    body("dob", "Please enter your dob")
        .notEmpty()
        .isDate()
    .withMessage("DOB should be a date"),

];
const createBoardValidator = () => [
    body("board", "Please provide a 5x5 board")
        .isArray({ min: 5, max: 5 })
        .withMessage("Board should be an array with 5 rows")
        .custom((board) => {
            if (!Array.isArray(board) || board.length !== 5) {
                throw new Error("Board must be a 5x5 grid.");
            }
            for (let row of board) {
                if (!Array.isArray(row) || row.length !== 5) {
                    throw new Error("Each row in the board must have 5 columns.");
                }
                for (let cell of row) {
                    if (typeof cell !== 'number') {
                        throw new Error("Each cell in the board must be a number.");
                    }
                }
            }
            return true;
        })
];


export {
    validateHandler,
    registerValidator,
    loginValidator,
    updateProfileValidator,
    createBoardValidator
}