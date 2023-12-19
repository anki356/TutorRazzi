import express from 'express'
import { authVerify } from '../../../controllers/TeacherDashboard/Auth/Auth.js'
import { editProfile, getUserProfile } from '../../../controllers/TeacherDashboard/Profile/Profile.js'
import { body } from 'express-validator'
import validationError from '../../../middleware/validationError.js'
import upload from '../../../util/upload.js'
const router=express.Router()

router.get("/profile",authVerify,getUserProfile)
router.patch("/profile",authVerify,editProfile)
export default router