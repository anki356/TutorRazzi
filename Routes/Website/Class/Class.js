import express from 'express'
import { acceptClassRequest, getClassDetails, getPastClasses, getRescheduledClasses, getTrialClasses, getUpcomingClassDetails, getUpcomingClasses, rescheduleClass } from '../../../controllers/Website/Class/Class.js'
import { authVerify } from '../../../controllers/Website/Auth/Auth.js'
import { body, param } from 'express-validator'
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
const rescheduleValidationChain=[
    param('_id').notEmpty().withMessage("Invalid Class"),
    body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time"),
    ]
router.patch("/reschedule-class/:_id",authVerify,rescheduleValidationChain,validationError,rescheduleClass)
const acceptRescheduleValidationChain=[
    param('_id').notEmpty().withMessage("Invalid Class"),
   
]
router.patch("/accept-class/:_id",authVerify,acceptRescheduleValidationChain,validationError,acceptClassRequest)


export default router