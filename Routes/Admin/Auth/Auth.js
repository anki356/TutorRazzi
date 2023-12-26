import express from "express";
import { SignUp,SignIn, changePassword, verifyEmail, verifyOTP } from "../../../controllers/Admin/Auth/Auth.js";
import validationError from "../../../middleware/validationError.js";
import { body } from "express-validator";
const router=express.Router()
const loginValidationChain = [
    body('username').notEmpty().isEmail().trim(),
body('password').notEmpty().withMessage('Password is required field.')
    .isLength({ min: 8 }).optional()
    .withMessage('Password should have atleast 8 characters.')];


router.post("/SignUp",loginValidationChain,validationError,SignUp)
router.post("/SignIn",loginValidationChain,validationError,SignIn)
router.patch("/change-Password",loginValidationChain,validationError,changePassword)
router.post("/verify-Email",loginValidationChain,validationError,verifyEmail)
router.post("/verify-OTP",verifyOTP)
export default router