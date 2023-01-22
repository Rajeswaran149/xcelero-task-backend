import express from "express";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { generateToken, isAuth } from "../utils.js";

const userRouter = express.Router();

userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: "Invalid email or password" });
  })
);

userRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  })
);

userRouter.put(
  "/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  })

  //   uploadRouter.post(
  //     "/",
  //     isAuth,
  //     isAdmin,
  //     upload.single("file"),
  //     async (req, res) => {
  //       cloudinary.config({
  //         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  //         api_key: process.env.CLOUDINARY_API_KEY,
  //         api_secret: process.env.CLOUDINARY_API_SECRET,
  //       });
  //       const streamUpload = (req) => {
  //         return new Promise((resolve, reject) => {
  //           const stream = cloudinary.uploader.upload_stream((error, result) => {
  //             if (result) {
  //               resolve(result);
  //             } else {
  //               reject(error);
  //             }
  //           });
  //           streamifier.createReadStream(req.file.buffer).pipe(stream);
  //         });
  //       };
  //       const result = await streamUpload(req);
  //       res.send(result);
  //     }
);

export default userRouter;
