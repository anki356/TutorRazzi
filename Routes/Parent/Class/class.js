import express from 'express'
import { getClassDetails,requestExtraclass,acceptRescheduledClass,getExtraClassQuotes, requestTrialClass,scheduleClass,rescheduleClass, reviewClass,raiseRequestResource,getClassQuotes, joinClass, leaveClass, getPurchasedClasses, getPurchasedClassesByQuoteId, setReminder, getClassesBasedOnDate, getLastTrialClass, likeClass, dislikeClass, getUpcomingClassDetails } from '../../../controllers/Parent/Class/Class.js'
import { authVerify } from '../../../controllers/Parent/Auth/Auth.js'
import validationError from '../../../middleware/validationError.js'
import { body,param,query } from 'express-validator'
const router=express.Router()
const trialClassValidationChain=[
    body('teacher_id').notEmpty().withMessage("Teacher ID cannot be null"),
    body('subject').notEmpty().withMessage("Subject cannot be empty"),
    body('curriculum').notEmpty().withMessage("Curriculum cannot be empty"),
    body('grade').notEmpty().withMessage("Curriculum cannot be empty"),
    body("student_id").notEmpty().withMessage("Student id required"),
    body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time"),
    
    ]
    const scheduleClassValidation=[
        param('id').notEmpty().withMessage("Invalid Quote Id"),
        body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time")
    ]
    const rescheduleValidationChain=[
        param('id').notEmpty().withMessage("Invalid Class"),
        body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time"),
       
        ]
        const classReviewValidationChain=[
            body('class_id').notEmpty().withMessage("Invalid Class"),
            body('rating').notEmpty().isFloat({ min: 0, max: 5 }).withMessage("Must be between 0 and 5")
        ]
        const requestValidationChain=[
            body('class_id').notEmpty().withMessage("Invalid Class"),
        
            body('message').notEmpty().withMessage("Message is Required Field"),
        
        ]
        const classValidatonChain=[
            body('class_id').notEmpty().withMessage("Invalid Class")
        ]
        const extraClassValidationChain=[
            body("quote_id").notEmpty().withMessage("Invalid Quote Id"),
            body('message').notEmpty().withMessage("Message is required Field"),
        
        ]
router.post("/request-Trial-Class",authVerify,trialClassValidationChain,validationError,requestTrialClass)
router.get("/get-Class-Details",authVerify,getClassDetails)
router.patch("/reschedule-class/:id",authVerify,rescheduleValidationChain,validationError,rescheduleClass)
router.post("/review-class",authVerify,classReviewValidationChain,validationError,reviewClass)
router.post("/raise-request-resource",authVerify,requestValidationChain,validationError,raiseRequestResource)
router.get("/class-quotes",authVerify,getClassQuotes)
router.post("/join-class",authVerify,classValidatonChain,validationError,joinClass)
router.post("/leave-class",authVerify,classValidatonChain,validationError,leaveClass)
router.get("/purchased-classes",authVerify,getPurchasedClasses)
router.get("/purchased-classes-by-quote_id",authVerify,getPurchasedClassesByQuoteId)
router.patch("/schedule-class/:id",authVerify,scheduleClassValidation,validationError,scheduleClass)
router.post("/reminder",authVerify,classValidatonChain,validationError,setReminder)
router.post("/request-extra-class",authVerify,extraClassValidationChain,validationError,requestExtraclass)
router.patch("/accept-rescheduled-class/:_id",authVerify,rescheduleValidationChain,validationError,acceptRescheduledClass)
router.get("/extra-classes-quotes",authVerify,getExtraClassQuotes)
const dateValidationChain=[
    query("date").notEmpty().withMessage("Date is Required"),
   
]
router.get("/classes-by-date",authVerify,dateValidationChain,validationError,getClassesBasedOnDate)

router.get("/get-last-trial-class",authVerify,getLastTrialClass)
router.post("/like-class",authVerify,likeClass)
router.post("/dislike-class",authVerify,dislikeClass)
router.get("/upcoming-class-details",authVerify,getUpcomingClassDetails)
export default router