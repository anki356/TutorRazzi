import express from 'express'
import { authVerify } from '../../../controllers/Student/Auth/Auth.js'
import { getClassDetails, getPastClasses, getRescheduledClasses, getTrialClasses, getUpcomingClassDetails, getUpcomingClasses, viewRec } from '../../../controllers/Admin/Class/Class.js'

const router=express.Router()
router.get("/get-upcoming-classes",authVerify,getUpcomingClasses)
router.get("/get-past-classes",authVerify,getPastClasses)
router.get("/rescheduled-classes",authVerify,getRescheduledClasses)
router.get("/trial-classes",authVerify,getTrialClasses)

router.get("/class-details",authVerify,getClassDetails)

router.get("/upcoming-class-details",authVerify,getUpcomingClassDetails)
router.get("/upcoming-class-details",authVerify,viewRec)
export default router