import express from 'express'
const router = new express.Router()
import upload from '../../../util/upload.js'
import  {getTotalStudents, getTrialClassesRequests,getAllExams, getUpcomingClasses,overallPerformance,acceptTrialClassRequest, getTrialClasses, getMyProfile, editPhoto, editProfile} from "../../../controllers/TeacherApp/Profile/Profile.js"
import { authVerify } from '../../../controllers/TeacherApp/Auth/Auth.js'
import validationError from '../../../middleware/validationError.js'
import { body,param } from 'express-validator'
router.get("/trial-classes-requests",authVerify,getTrialClassesRequests)
router.get("/upcoming-classes",authVerify,getUpcomingClasses)
router.get("/overall-performance",authVerify,overallPerformance)
router.get("/total-students",authVerify,getTotalStudents)
const acceptRescheduleValidationChain=[
    param('_id').notEmpty().withMessage("Invalid Class"),
   
]
router.patch("/accept-trial-class/:_id",authVerify,acceptRescheduleValidationChain,validationError,acceptTrialClassRequest)
router.get("/get-all-exams",authVerify,getAllExams)
router.get("/trial-classes",authVerify,getTrialClasses)
router.get("/my-profile",authVerify,getMyProfile)


router.patch("/profile",authVerify,editProfile)
export default router