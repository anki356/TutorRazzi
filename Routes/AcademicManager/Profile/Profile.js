import express from 'express'
import { authVerify } from '../../../controllers/AcademicManager/Auth/Auth.js'
import { deletePhoto, editPhoto, editProfileDetails, getProfileDetails } from '../../../controllers/AcademicManager/Profile/Profile.js'
const router=express.Router()
router.get("/profile",authVerify,getProfileDetails)
router.patch("/profile",authVerify,editProfileDetails)
router.patch("/photo",authVerify,editPhoto)
router.delete("/photo",authVerify,deletePhoto)
export default router