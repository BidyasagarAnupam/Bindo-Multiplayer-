import jwt from "jsonwebtoken";
import { BINGO_TOKEN } from "../constants/config.constants.js";
// import { v4 as uuid } from "uuid";
import { v2 as cloudinary } from "cloudinary";
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

const uploadImageToCloudinary = async (file, folder, height, quality) => {
  const options = { folder };
  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }
  options.resource_type = "auto";

  return await cloudinary.uploader.upload(file.tempFilePath, options);
}


export {
  sendToken,
  cookieOptions,
  // emitEvent,
  uploadImageToCloudinary,
};
