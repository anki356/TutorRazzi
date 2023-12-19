import express from 'express'
import { getAllExams, getBasicDetails, getQuotes, getScheduledClasses,  } from '../../../controllers/TeacherApp/Student/Student.js'
import { authVerify } from '../../../controllers/TeacherApp/Auth/Auth.js'
const router=express.Router()
router.get("/student-Details",authVerify,getBasicDetails)
router.get("/quotes",authVerify,getQuotes)
router.get("/scheduled-Classes",authVerify,getScheduledClasses)
router.get("/all-exams",authVerify,getAllExams)
export default router