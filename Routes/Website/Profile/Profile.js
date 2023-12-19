import express from 'express'
import { authVerify } from '../../../controllers/Website/Auth/Auth'
import { editProfileDetails, getHomework, getProfileDetails, uploadHomework } from '../../../controllers/Website/Profile/Profile'
const router=express.Router()
router.get("/profile",authVerify,getProfileDetails)
router.patch("/profile",authVerify,editProfileDetails)
router.get("/homeworks",authVerify,getHomework)
router.patch("/homework/:_id",authVerify,uploadHomework)
export default router