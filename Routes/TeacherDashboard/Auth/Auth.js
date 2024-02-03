import express from "express";
import { SignUp,SignIn, changePassword, verifyEmail, verifyOTP } from "../../../controllers/TeacherDashboard/Auth/Auth.js";
import { body } from "express-validator";
import validationError from "../../../middleware/validationError.js";
const router=express.Router()
const email_validation=[
    body('email').notEmpty().withMessage("Email is Required"),
]
router.post("/SignUp",SignUp)
router.post("/SignIn",SignIn)
router.post("/change-password/:token",changePassword)
router.post("/verify-Email",email_validation,validationError,verifyEmail)
// router.post("/verify-OTP",verifyOTP)
export default router