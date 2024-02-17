import express from 'express'
import { acceptClassRequest, getClassDetails, getPastClasses, getRescheduledClasses, getTasks, getTrialClasses, getUpcomingClassDetails, getUpcomingClasses, markTaskDone, rescheduleClass, reviewTeacher, setReminder, uploadHomework } from '../../../controllers/Website/Class/Class.js'
import { authVerify } from '../../../controllers/Website/Auth/Auth.js'
import { body, param } from 'express-validator'
import { reviewClass } from '../../../controllers/Student/Class/Class.js'
import validationError from '../../../middleware/validationError.js'
import { getHomeworks } from '../../../controllers/Website/Class/Class.js'
const router=express.Router()
router.get("/get-upcoming-classes",authVerify,getUpcomingClasses)
router.get("/get-past-classes",authVerify,getPastClasses)
router.get("/Class-Details",authVerify,getClassDetails)
router.get("/upcoming-class-details",authVerify,getUpcomingClassDetails)
router.get("/rescheduled-classes",authVerify,getRescheduledClasses)
router.get("/trial-classes",authVerify,getTrialClasses)
const classReviewValidationChain=[
    body('class_id').notEmpty().withMessage("Invalid Class"),
    body('ratings').notEmpty().isFloat({ min: 1, max: 5 }).withMessage("Must be between 1 and 5")
]
router.post("/review-class",authVerify,classReviewValidationChain,validationError,reviewClass)
const teacherReviewValidationChain=[
    body('class_id').notEmpty().withMessage("Invalid Class"),
    body('ratings').notEmpty().isFloat({ min: 1, max: 5 }).withMessage("Must be between 1 and 5"),
    body('teacher_id').notEmpty().withMessage("Invalid Teacher")
]
router.post("/review-teacher",authVerify,teacherReviewValidationChain,validationError,reviewTeacher)
const rescheduleValidationChain=[
    param('_id').notEmpty().withMessage("Invalid Class"),
    body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time"),
    ]

    router.get("/homework",authVerify,getHomeworks)
    router.get("/task",authVerify,getTasks)    
const homeworkValidationChain=[

    param('_id').notEmpty().withMessage("Invalid Homework Id "),
    ]
    router.patch("/mark-task-done/:_id",authVerify,markTaskDone)
    router.patch("/upload-homework/:_id",authVerify,homeworkValidationChain,validationError,uploadHomework)
router.patch("/reschedule-class/:_id",authVerify,rescheduleValidationChain,validationError,rescheduleClass)
const acceptRescheduleValidationChain=[
    param('_id').notEmpty().withMessage("Invalid Class"),
   
]
router.post("/reminder", authVerify, setReminder)
router.patch("/accept-class/:_id",authVerify,acceptRescheduleValidationChain,validationError,acceptClassRequest)


export default router