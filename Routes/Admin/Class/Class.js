import express from 'express'
import { authVerify } from '../../../controllers/Student/Auth/Auth.js'
import { getPastClasses, getRescheduledClasses, getTrialClasses, getUpcomingClasses } from '../../../controllers/Admin/Class/Class.js'

const router=express.Router()
router.get("/get-upcoming-classes",authVerify,getUpcomingClasses)
router.get("/get-past-classes",authVerify,getPastClasses)
router.get("/rescheduled-classes",authVerify,getRescheduledClasses)
router.get("/trial-classes",authVerify,getTrialClasses)
export default router