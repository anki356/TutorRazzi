import express from 'express'
import { authVerify } from '../../../controllers/AcademicManager/Auth/Auth'
import { editProfileDetails, getProfileDetails } from '../../../controllers/AcademicManager/Profile/Profile'
const router=express.Router()
router.get("/profile",authVerify,getProfileDetails)
router.patch("/profile",authVerify,editProfileDetails)