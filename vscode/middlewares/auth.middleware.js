import AppError from "../utils/appError.js";
import jwt from "jsonwebtoken";

const isLoggedin = function (req, res, next) {
  const { token } = req.cookies;
  if (!token) {
    return next(new AppError("unauthenticated, please log in first", 401));
  }

  const tokenDetails = jwt.verify(token, process.env.JWT_SECRET);
  if (!tokenDetails) {
    return next(new AppError("unauthenticated, please log in first", 401));
  }
  req.user = tokenDetails;

  next();
};

export default isLoggedin;
