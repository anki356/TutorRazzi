import express from "express"
import validationError from "../../../middleware/validationError.js"
const router = express.Router()

import {authVerify} from "../../../controllers/AcademicManager/Auth/Auth.js"
import { acceptClassRequest, acceptTrialClassRequest, addExtraClassQuote, getClassDetails, getHomeworks, getPastClasses, getRescheduledClasses, getResourceRequests, getTrialClassDetails, getTrialClasses, getUpcomingClassDetails, getUpcomingClasses, markTaskDone, notifyStudent, notifyTeacher, rescheduleClass, resolveHomework, reviewClass, reviewTeacher } from "../../../controllers/AcademicManager/Class/Class.js"
import { body, param } from "express-validator"
import upload from "../../../util/upload.js"

router.post("/extra-class-quote",authVerify,addExtraClassQuote)
router.get("/trial-classes",authVerify,getTrialClasses)
router.get("/resource-requests",authVerify,getResourceRequests)
const notifyTeacherValidation=[
   body('resource_request_id').notEmpty().withMessage("Resource Request Notified")
]
router.post("/notify-teacher",authVerify,notifyTeacherValidation,validationError,notifyTeacher)

const notifyStudentValidation=[
    body("homework_id").notEmpty().withMessage("Homework Id is required"),
    
]


router.patch("/mark-task-done/:_id",authVerify,markTaskDone)
router.get("/rescheduled-classes",authVerify,getRescheduledClasses)

router.post('/notify-student', notifyStudentValidation,validationError,authVerify,notifyStudent)
const homeworkResolvedValidation=[
    param('homework_id').notEmpty().custom((value)=>mongoose.Types.ObjectId.isValid(value)).withMessage("Invalid Homework Id")
]

const acceptRescheduleValidationChain=[
    param('_id').notEmpty().withMessage("Invalid Class"),
   
]
router.patch("/accept-class/:_id",authVerify,acceptRescheduleValidationChain,validationError,acceptClassRequest)
const rescheduleValidationChain=[
    param('_id').notEmpty().withMessage("Invalid Class"),
    body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time"),
    ]
router.patch("/reschedule-class/:_id",authVerify,rescheduleValidationChain,validationError,rescheduleClass)
router.patch("/accept-trial-class/:_id",authVerify,acceptRescheduleValidationChain,validationError,acceptTrialClassRequest)
router.patch("mark-homework-done/:homework_id",homeworkResolvedValidation,validationError,authVerify,resolveHomework)
router.get("/past-classes",authVerify,getPastClasses)
router.get("/upcoming-classes",authVerify,getUpcomingClasses)
router.get("/homeworks-list",authVerify,getHomeworks)
router.get("/class-details",authVerify,getClassDetails)
router.get("/trial-class-details",authVerify,getTrialClassDetails)
const classReviewValidationChain=[
    body('class_id').notEmpty().withMessage("Invalid Class"),
    body('rating').notEmpty().isFloat({ min: 0, max: 5 }).withMessage("Must be between 0 and 5")
]
const reviewValidation=[
    body('rating').notEmpty().withMessage("Ratings is Required Field"),
    body('teacher_id').notEmpty().withMessage("teacher Id is required"),
    body('class_id').notEmpty().withMessage("Class Id is required"),


]

router.post("/review-class",authVerify,classReviewValidationChain,validationError,reviewClass)
router.post("/review-teacher",authVerify,reviewValidation,validationError,reviewTeacher)
router.get("/upcoming-class-details",authVerify,getUpcomingClassDetails)
export default router