import express from "express";
import { SignUp,SignIn, changePassword, verifyEmail, verifyOTP, authVerify } from "../../../controllers/Student/Auth/Auth.js";
import  { body, validationResult } from "express-validator";
import { responseObj } from "../../../util/response.js";
import validationError from "../../../middleware/validationError.js";
const loginValidationChain = [
    body('email').notEmpty().isEmail().trim(),
body('password').notEmpty().withMessage('Password is required field.')
    .isLength({ min: 8 }).optional()
    .withMessage('Password should have atleast 8 characters.')];



const router=express.Router()
router.post("/SignUp",loginValidationChain,validationError,SignUp)
router.post("/SignIn",loginValidationChain,validationError,SignIn)

router.patch("/change-Password",authVerify,loginValidationChain,validationError,changePassword)
router.post("/verify-Email",loginValidationChain,validationError,verifyEmail)
router.post("/verify-OTP",verifyOTP)
export default router