import express from "express";
import { SignUp,SignIn, changePassword, verifyEmail, verifyOTP, authVerify } from "../../../controllers/TeacherApp/Auth/Auth.js";
import validationError from "../../../middleware/validationError.js";
import { body ,param} from "express-validator";
const router=express.Router()
const loginValidationChain = [
    body('email').notEmpty().isEmail().trim(),
body('password').notEmpty().withMessage('Password is required field.').optional()
    .withMessage('Password should have atleast 8 characters.')];


    const pswdValidationChain = [
        body('password').notEmpty().withMessage('Password is required field.')];
router.post("/SignUp",loginValidationChain,validationError,SignUp)
router.post("/SignIn",loginValidationChain,validationError,SignIn)
router.patch("/change-Password",authVerify,pswdValidationChain,validationError,changePassword)
router.post("/verify-Email",loginValidationChain,validationError,verifyEmail)
router.post("/verify-OTP",verifyOTP)
export default router