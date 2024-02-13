import express from 'express'
import { getClassDetails, requestTrialClass,rescheduleClass,getPurchasedClasses, reviewClass,raiseRequestResource, joinClass, leaveClass, acceptRescheduledClass,  uploadHomework, getQuotes, scheduleClass, requestExtraclass, getExtraClassQuotes, getPurchasedClassesByQuoteId, likeClass, getLastTrialClass, dislikeClass, getClassesBasedOnDate, getUpcomingClassDetails } from '../../../controllers/Student/Class/Class.js'
import { authVerify } from '../../../controllers/Student/Auth/Auth.js'
import { addHomework, setReminder } from '../../../controllers/TeacherApp/Class/Class.js'
import upload from "../../../util/upload.js"
import  { body, validationResult,param,query } from "express-validator";

import validationError from '../../../middleware/validationError.js'
const router=express.Router()
const trialClassValidationChain=[
body('teacher_id').notEmpty().withMessage("Teacher ID cannot be null"),
body('subject').notEmpty().withMessage("Subject cannot be empty"),
body('curriculum').notEmpty().withMessage("Curriculum cannot be empty"),
body('grade').notEmpty().withMessage("Curriculum cannot be empty"),
body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time"),

]
const rescheduleValidationChain=[
    param('_id').notEmpty().withMessage("Invalid Class"),

    
    body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time"),
   
    ]
router.post("/request-Trial-Class",authVerify,trialClassValidationChain,validationError,requestTrialClass)
router.get("/get-Class-Details",authVerify,getClassDetails)
router.patch("/reschedule-class/:_id",authVerify,rescheduleValidationChain,validationError,rescheduleClass)
const classReviewValidationChain=[
    body('class_id').notEmpty().withMessage("Invalid Class"),
    body('ratings').notEmpty().isFloat({ min: 0, max: 5 }).withMessage("Must be between 0 and 5")
]
router.post("/review-class",authVerify,classReviewValidationChain,validationError,reviewClass)
const requestValidationChain=[
    body('class_id').notEmpty().withMessage("Invalid Class"),

    body('message').notEmpty().withMessage("Message is Required Field"),

]
router.post("/raise-request-resource",authVerify,requestValidationChain,validationError,raiseRequestResource)
const classValidatonChain=[
    body('class_id').notEmpty().withMessage("Invalid Class")
]
router.post("/join-class",authVerify,classValidatonChain,validationError,joinClass)
router.post("/leave-class",authVerify,classValidatonChain,validationError,leaveClass)
router.patch("/accept-rescheduled-class/:_id",authVerify,acceptRescheduledClass)
const homeworkValidationChain=[

param('_id').notEmpty().withMessage("Invalid Homework Id "),
]
router.patch("/upload-homework/:_id",homeworkValidationChain,validationError,authVerify,uploadHomework)

router.get("/quotes",authVerify,getQuotes)
const scheduleClassValidation=[
    param('_id').notEmpty().withMessage("Invalid Quote Id"),
    body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time")
]
router.patch("/schedule-class/:_id",authVerify,scheduleClassValidation,validationError,scheduleClass)
const extraClassValidationChain=[
    body("quote_id").notEmpty().withMessage("Invalid Quote Id"),
    body('message').notEmpty().withMessage("Message is required Field"),

]
router.post("/request-extra-class",authVerify,extraClassValidationChain,validationError,requestExtraclass)

router.get("/extra-classes-quotes",authVerify,getExtraClassQuotes)
router.get("/purchased-classes",authVerify,getPurchasedClasses)
router.get("/purchased-classes-by-quote_id",authVerify,getPurchasedClassesByQuoteId)
const classValidationChain=[
    body('class_id').notEmpty().withMessage("Invalid Class Id"),
    
]
router.post("/reminder",authVerify,classValidationChain,validationError,setReminder)
router.post("/like-class",authVerify,classValidationChain,validationError,likeClass)
router.get("/get-last-trial-class",authVerify,getLastTrialClass)
const dislikeClassValidationResult=[
    body('class_id').notEmpty().withMessage("Invalid Class Id"),
    body('reason').notEmpty().withMessage("Reason Is required Field")

]
router.post("/dislike-class",authVerify,dislikeClassValidationResult,validationError,dislikeClass)
const dateValidationChain=[
    query("date").notEmpty().withMessage("Date is Required"),
   
]
router.get("/classes-by-date",authVerify,dateValidationChain,validationError,getClassesBasedOnDate)
router.get("/upcoming-class-details",authVerify,getUpcomingClassDetails)
export default router