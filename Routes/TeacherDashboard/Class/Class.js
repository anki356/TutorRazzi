import { body, param, query } from "express-validator";
import express from 'express'
import validationError from "../../../middleware/validationError.js";
import { acceptClassRequest, acceptRescheduledClass, addHomework, addNotesToClass, addTask, getClassDetails, getClassesBasedOnDate, getClasssBasedOnMonth, getPastClasses, getRescheduledClasses, getTrialClassResponse, getTrialClassesRequests, getUpcomingClassDetails, getUpcomingClasses, joinClass, leaveClass, requestReUpload, rescheduleClass, resolveResourceRequests, reviewClass, scheduleClass, setReminder, uploadClassMaterial } from "../../../controllers/TeacherDashboard/Class/Class.js";
import { authVerify } from "../../../controllers/TeacherDashboard/Auth/Auth.js";

const router = express.Router()

const acceptRescheduleValidationChain=[
    param('_id').notEmpty().withMessage("Invalid Class"),
   
]
const resourceRequestValidation=[
   
   
    body("resource_request_id").notEmpty().withMessage("Invalid Resource Request Id")

]
router.post('/resolve-request-resource', resourceRequestValidation,validationError,authVerify,resolveResourceRequests)
const rescheduleValidationChain = [
    param('_id').notEmpty().withMessage("Invalid Class"),
    body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time"),
]

router.get("/upcoming-classes",authVerify,getUpcomingClasses)

router.get("/trial-classes-requests",authVerify,getTrialClassesRequests)
router.get("/rescheduled-classes",authVerify,getRescheduledClasses)
router.get("/past-Classes",authVerify,getPastClasses)
const notesValidation = [
    body('notes').notEmpty().withMessage("Notes is required")
]
const classDetailsValidationChain=[
query("class_id").notEmpty().withMessage("Class id is Required")
]
const taskValidation=[
    body('class_id').notEmpty().withMessage("Invalid Class Id"),
    body('title').notEmpty().withMessage('Title is Required'),
    body('description').notEmpty().withMessage('DEscription is Required'),
    body('due_date').notEmpty().withMessage('Due Date is Required ').isAfter(new Date().toDateString()).withMessage("Due Date should be in future"),

]
const reUploadValiationChain=[
param("home_work_id").notEmpty().withMessage("Invalid HomeWork Id")
]
const classReviewValidationChain=[
    body('class_id').notEmpty().withMessage("Invalid Class"),
    body('rating').notEmpty().isFloat({ min: 0, max: 5 }).withMessage("Must be between 0 and 5")
]
router.patch("/accept-rescheduled-class/:_id",authVerify,acceptRescheduleValidationChain,validationError,acceptRescheduledClass)
router.post("/review-class",authVerify,classReviewValidationChain,validationError,reviewClass)
router.post("/homework",authVerify,taskValidation,validationError,addHomework)
router.post("/task",authVerify,taskValidation,validationError,addTask)
router.patch("/notes/:_id", authVerify, notesValidation, validationError, addNotesToClass)
router.post("/reminder", authVerify, setReminder)
router.patch("/reschedule-class/:_id", authVerify, rescheduleValidationChain, validationError, rescheduleClass)
router.get("/class-details", authVerify, classDetailsValidationChain, validationError, getClassDetails)
router.post("/join-class",authVerify,validationError,joinClass)
router.post("/leave-class",authVerify,validationError,leaveClass)
router.patch("/request-re-upload/:home_work_id",authVerify,reUploadValiationChain,validationError,requestReUpload)
router.get("/trial-class-response",authVerify,classDetailsValidationChain,validationError,getTrialClassResponse)
const dateValidationChain=[
    query("date").notEmpty().withMessage("Date is Required"),
   
]
router.patch("/accept-class/:_id",authVerify,acceptRescheduleValidationChain,validationError,acceptClassRequest)
const monthValidationChain=[
    query("month").notEmpty().withMessage("Month is Required"),
   
]
const classMaterialvalidationChain=[
    param('_id').notEmpty().withMessage("Invalid Class"),
   
]
router.patch("/upload-class-material/:_id",authVerify,classMaterialvalidationChain,validationError,uploadClassMaterial)
router.get("/classes-by-date",authVerify,dateValidationChain,validationError,getClassesBasedOnDate)
router.get("/classes-by-month",authVerify,monthValidationChain,validationError,getClasssBasedOnMonth)
const scheduleClassValidation=[
    param('_id').notEmpty().withMessage("Invalid Quote Id"),
    body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time")
]

router.patch("/schedule-class/:_id",authVerify,scheduleClassValidation,validationError,scheduleClass)
router.get("/upcoming-class-details",authVerify,getUpcomingClassDetails)
export default router