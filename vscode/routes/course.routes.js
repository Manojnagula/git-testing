import express from "express";
const router = express.Router();
import upload from "../middlewares/multer.middleware.js";

import {
  addLectureByCourseId,
  createCourse,
  deleteCourse,
  getAllCourses,
  getLecturesByCourseId,
  updateCourse,
} from "../controllers/course.Controllers.js";
import isLoggedin from "../middlewares/auth.middleware.js";
import authorizedRoles from "../middlewares/auth2.middleware.js";

router
  .route("/")
  .get(getAllCourses)
  .post(
    isLoggedin,
    authorizedRoles("ADMIN"),
    upload.single("thumbnail"),
    createCourse
  );
router
  .route("/:courseId")
  .get(isLoggedin, getLecturesByCourseId)
  .put(isLoggedin, authorizedRoles("ADMIN"), updateCourse)
  .delete(isLoggedin, authorizedRoles("ADMIN"), deleteCourse)
  .post(
    isLoggedin,
    authorizedRoles("ADMIN"),
    upload.single("lecture"),
    addLectureByCourseId
  );
export default router;
