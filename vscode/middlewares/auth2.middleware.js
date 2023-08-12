import AppError from "../utils/appError.js";

const authorizedRoles =
  (...roles) =>
  (req, res, next) => {
    const currentRole = req.user.role;
    if (!roles.includes(currentRole)) {
      return next(new AppError("You donot have access to this route", 403));
    }

    next();
  };

  export default authorizedRoles