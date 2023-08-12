import express from 'express'
import upload from '../middlewares/multer.middleware.js'
const router = express.Router();
import {
    register,
    login,
    logout,
    getprofile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser
} from './../controllers/user.controller.js';
import isLoggedin from'../middlewares/auth.middleware.js';

router.post('/register',upload.single('avatar'),register);
router.post('/login',login);
router.get('/logout',logout);
router.get('/me',isLoggedin,getprofile);
router.post('/reset',forgotPassword)
router.post('/reset/:resetToken',resetPassword)
router.post('/change-password',isLoggedin,changePassword)
router.put('/update',isLoggedin,upload.single('avatar'),updateUser)

export default router;