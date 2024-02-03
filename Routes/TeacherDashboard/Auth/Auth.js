import express from "express";
import { SignUp,SignIn, changePassword, verifyEmail, verifyOTP } from "../../../controllers/TeacherDashboard/Auth/Auth.js";
const router=express.Router()
router.post("/SignUp",SignUp)
router.post("/SignIn",SignIn)
router.post("/change-password/:token",changePassword)
router.post("/verify-Email",verifyEmail)
// router.post("/verify-OTP",verifyOTP)
export default router