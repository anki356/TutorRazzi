import express from 'express'
import { getClassDetails, getPastClasses, getUpcomingClasses } from '../../../controllers/Website/Class/Class'
import { authVerify } from '../../../controllers/Website/Auth/Auth'
const router=express.Router()
router.get("/get-upcoming-classes",authVerify,getUpcomingClasses)
router.get("/get-past-classes",authVerify,getPastClasses)
router.get("/get-Class-Details",authVerify,getClassDetails)
export default router