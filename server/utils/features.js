import jwt from "jsonwebtoken";
import { BINGO_TOKEN } from "../constants/config.constants.js";
// import { v4 as uuid } from "uuid";
// import { v2 as cloudinary } from "cloudinary";
// import { getBase64, getSockets } from "../lib/helper.js";

const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000, 
  sameSite: "none",
  httpOnly: true,
  secure: true,
};


const sendToken = (res, user, code, message) => {
  const token = jwt.sign({
    _id: user._id,
    userName: user.userName,
    email: user.email
  }, process.env.JWT_SECRET);

  return res.status(code).cookie(BINGO_TOKEN, token, cookieOptions).json({
    success: true,
    user,
    message,
  });
};

// const emitEvent = (req, event, users, data) => {
//   const io = req.app.get("io");
//   const usersSocket = getSockets(users);
//   io.to(usersSocket).emit(event, data);
// };

// const uploadFilesToCloudinary = async (files = []) => {
//   const uploadPromises = files.map((file) => {
//     return new Promise((resolve, reject) => {
//       cloudinary.uploader.upload(
//         getBase64(file),
//         {
//           resource_type: "auto",
//           public_id: uuid(),
//         },
//         (error, result) => {
//           if (error) return reject(error);
//           resolve(result);
//         }
//       );
//     });
//   });

//   try {
//     const results = await Promise.all(uploadPromises);

//     const formattedResults = results.map((result) => ({
//       public_id: result.public_id,
//       url: result.secure_url,
//     }));
//     return formattedResults;
//   } catch (err) {
//     throw new Error("Error uploading files to cloudinary", err);
//   }
// };


export {
  sendToken,
  cookieOptions,
  // emitEvent,
  // uploadFilesToCloudinary,
};
