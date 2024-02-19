import express from 'express'
import { authVerify } from '../../../controllers/AcademicManager/Auth/Auth'
import { editPhoto, editProfileDetails, getProfileDetails } from '../../../controllers/AcademicManager/Profile/Profile'
const router=express.Router()
router.get("/profile",authVerify,getProfileDetails)
router.patch("/profile",authVerify,editProfileDetails)
router.patch("/photo",authVerify,editPhoto)
export default router