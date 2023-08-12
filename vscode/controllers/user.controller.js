import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import cloudinary from "cloudinary";
import crypto from "crypto";
import fs from "fs/promises";
import sendEmail from "../utils/sendEmail.js";
const cookieOptions = {
  secure: true,
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: true,
};

const register = async (req, res, next) => {
  const { fullName, email, password,role} = req.body;

  if (!password) {
    return next(new AppError("password is required", 400));
  } else if (!fullName) {
    return next(new AppError("name is required", 400));
  } else if (!email) {
    return next(new AppError("email is required", 400));
  }

  const userExists = await User.findOne({ email });


  if (userExists) {
    return next(new AppError("Email already registered", 400));
  }
  try {
    const user = await User.create({
      fullName,
      email,
      password,
      role,
      avatar: {
        public_id: email,
        secure_url: "dummy"
      }
    });
  
    if (!user) {
      return next(new AppError('User registration failed', 400));
    }
  
  } catch (error) {
    return next(new AppError('User registration failed: ' + error.message, 500));
  }
 
  //TODO: uplolad user picture
  console.log("file details>", JSON.stringify(req.file));
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
        timestamp: Math.floor(Date.now() / 1000),
      });

      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;
      }

      //remove file from local
      fs.rm(`uploads/${req.file.filename}`);
    } catch (error) {
      return next(
        new AppError(
          error.message || "file not uploaded, please try again",
          500
        )
      );
    }
  }
  await user.save();

  //TODO: get jwt token in cookie

  const token = await user.generateJWTtoken();

  res.cookie("token", token, cookieOptions);

  user.password = undefined;

  res.status(200).json({
    success: true,
    message: "user registered successfully",
    user,
  });
};
const login = async (req, res,next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user || !user.comparePassword(password)) {
    //TODO
    return next(new AppError("Email or password do not match", 400));
  }

  //generating jwt token
  const token = await user.generateJWTtoken();
  user.password = undefined;

  res.cookie("token", token, cookieOptions);
  res.status(201).json({
    success: true,
    message: "user loggedin successfully",
    user,
  });
};

const logout = (req, res) => {
  res.cookie("token", null, {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

const getprofile = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    message: "User details",
    user,
  });
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Email is not registered", 400));
  }
  const resetToken = await user.generatePasswordToken();
  console.log(resetToken);

  await user.save();

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const subject = "Reset Password";
  const message = `you can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore`;
  try {
    //TODO:create send email
    await sendEmail(email, subject, message);

    res.status(200).json({
      success: true,
      message: `Reset password token has sent to ${email} successfully!`,
    });
  } catch (error) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save();
    return next(new AppError(error.message, 500));
  }
};
const resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;
  console.log(resetToken);
  const { password } = req.body;

  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError("token is invalid or expired, please try again", 400)
    );
  }
  user.password = password;
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password successfuly changed.",
  });
};

const changePassword = async function (req, res, next) {
  const { oldPassword, newPassword } = req.body;
  console.log(req.user);
  const { id } = req.user;
  if (!oldPassword || !newPassword) {
    return new (AppError("All fields are mandatory", 400))();
  }
  const user = await User.findById(id).select("+password");

  if (!user) {
    return next(new AppError("User does not exist", 400));
  }
  const isPasswordValid = await user.comparePassword(oldPassword);

  if (!isPasswordValid) {
    return new (AppError("invalid old password", 400))();
  }
  user.password = newPassword;
  await user.save();
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
};

const updateUser = async function (req, res, next) {
  const { fullName } = req.body;
  const {role} = req.body;
  const { id } = req.user;
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("User not exist", 400));
  }
  if(role){
    user.role=role;
  }
  if (fullName) {
    user.fullName = fullName;
  }
  if (req.file) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
        timestamp: Math.floor(Date.now() / 1000),
      });

      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;
      }

      //remove file from local
      fs.rm(`uploads/${req.file.filename}`);
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  }
  await user.save();

  res.status(200).json({
    success: true,
    message: "User details updated successfully",
  });
};

export {
  register,
  login,
  logout,
  getprofile,
  resetPassword,
  forgotPassword,
  changePassword,
  updateUser,
};
