import express from 'express'
import { getClassDetails, getPastClasses, getUpcomingClassDetails, getUpcomingClasses } from '../../../controllers/Website/Class/Class'
import { authVerify } from '../../../controllers/Website/Auth/Auth'
const router=express.Router()
router.get("/get-upcoming-classes",authVerify,getUpcomingClasses)
router.get("/get-past-classes",authVerify,getPastClasses)
router.get("/get-Class-Details",authVerify,getClassDetails)
router.get("/upcoming-class-details",authVerify,getUpcomingClassDetails)
export default router