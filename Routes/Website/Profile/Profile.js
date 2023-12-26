import express from 'express'
import { authVerify } from '../../../controllers/Website/Auth/Auth.js'
import { editProfileDetails, getAllStudents, getHomework, getProfileDetails, selectStudent, subscribeToNewsLetter, uploadHomework } from '../../../controllers/Website/Profile/Profile.js'
const router=express.Router()
router.get("/profile",authVerify,getProfileDetails)
router.patch("/profile",authVerify,editProfileDetails)
router.get("/homeworks",authVerify,getHomework)
router.patch("/homework/:_id",authVerify,uploadHomework)
router.post("/subscribe-newsletter",subscribeToNewsLetter)
router.get("/all-students",authVerify,getAllStudents)
router.post("/select-student",authVerify,selectStudent)
export default router