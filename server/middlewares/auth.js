import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "./tryCatch.js";
import { BINGO_TOKEN } from "../constants/config.constants.js";


const isAuthenticated = TryCatch((req, res, next) => {
  const token = req.cookies[BINGO_TOKEN];
  if (!token)
    return next(new ErrorHandler("Please login to access this route", 401));

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.userId = decodedData._id;

  next();
});


// const socketAuthenticator = async (err, socket, next) => {
//   try {
//     if (err) return next(err);

//     const authToken = socket.request.cookies[BINGO_TOKEN];

//     if (!authToken)
//       return next(new ErrorHandler("Please login to access this route", 401));

//     const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

//     const user = await User.findById(decodedData._id);

//     if (!user)
//       return next(new ErrorHandler("Please login to access this route", 401));

//     socket.user = user;

//     return next();
//   } catch (error) {
//     console.log(error);
//     return next(new ErrorHandler("Please login to access this route", 401));
//   }
// };

export { isAuthenticated };
