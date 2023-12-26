import express from 'express'
import { getClassDetails, getPastClasses, getRescheduledClasses, getTrialClasses, getUpcomingClassDetails, getUpcomingClasses } from '../../../controllers/Website/Class/Class.js'
import { authVerify } from '../../../controllers/Website/Auth/Auth.js'
import { body } from 'express-validator'
import { reviewClass } from '../../../controllers/Student/Class/Class.js'
import validationError from '../../../middleware/validationError.js'
const router=express.Router()
router.get("/get-upcoming-classes",authVerify,getUpcomingClasses)
router.get("/get-past-classes",authVerify,getPastClasses)
router.get("/Class-Details",authVerify,getClassDetails)
router.get("/upcoming-class-details",authVerify,getUpcomingClassDetails)
router.get("/rescheduled-classes",authVerify,getRescheduledClasses)
router.get("/trial-classes",authVerify,getTrialClasses)
const classReviewValidationChain=[
    body('class_id').notEmpty().withMessage("Invalid Class"),
    body('ratings').notEmpty().isFloat({ min: 0, max: 5 }).withMessage("Must be between 0 and 5")
]
router.post("/review-class",authVerify,classReviewValidationChain,validationError,reviewClass)
export default router