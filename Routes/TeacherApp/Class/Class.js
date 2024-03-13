import express from 'express'
import { addTask, addHomework,joinClass,leaveClass, acceptRescheduledClass,getClassDetails, getRescheduledClasses, rescheduleClass, setReminder, addNotesToClass, getPastClasses, uploadClassMaterial, getClassesBasedOnDate, reviewClass, requestReUpload, scheduleClass, resolveResourceRequests, getUpcomingClassDetails, addOtherInfo, acceptClassRequest, getHomeworks, getTasks, getMaterials } from '../../../controllers/TeacherApp/Class/Class.js'
import { authVerify } from '../../../controllers/TeacherApp/Auth/Auth.js'
import upload from "../../../util/upload.js"
import { body,param,query } from 'express-validator'
import validationError from '../../../middleware/validationError.js'
const router=express.Router()
const classValidationChain=[
    body('class_id').notEmpty().withMessage("Invalid Class Id"),
    
]
router.post("/set-reminder",authVerify,classValidationChain,validationError,setReminder)
router.get("/class-details",authVerify,getClassDetails)
const taskValidation=[
    body('class_id').notEmpty().withMessage("Invalid Class Id"),
    body('title').notEmpty().withMessage('Title is Required'),
    body('description').notEmpty().withMessage('DEscription is Required'),
    body('due_date').notEmpty().withMessage('Due Date is Required'),

]

router.get("/homeworks",authVerify,getHomeworks)
router.get("/tasks",authVerify,getTasks)
router.get("/materials",authVerify,getMaterials)
router.post("/task",authVerify,taskValidation,validationError,addTask)
const rescheduleValidationChain=[
    param('_id').notEmpty().withMessage("Invalid Class"),
    body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time"),
    ]
router.patch("/reschedule-class/:_id",authVerify,rescheduleValidationChain,validationError,rescheduleClass)
router.get("/rescheduled-classes",authVerify,getRescheduledClasses)
router.get("/past-Classes",authVerify,getPastClasses)
const notesValidation=[
    body('notes').notEmpty().withMessage("Notes is required")
]
const resourceRequestValidation=[
   
   
    body("resource_request_id").notEmpty().withMessage("Invalid Resource Request Id")

]
router.post('/resolve-request-resource', resourceRequestValidation,validationError,authVerify,resolveResourceRequests)
router.patch("/notes/:_id",authVerify,notesValidation,validationError,addNotesToClass)
router.post("/join-class",authVerify,classValidationChain,validationError,joinClass)
router.post("/leave-class",authVerify,classValidationChain,validationError,leaveClass)

router.post("/homework",authVerify,taskValidation,validationError,addHomework)
const acceptRescheduleValidationChain=[
    param('_id').notEmpty().withMessage("Invalid Class"),
    
]
const classReviewValidationChain=[
    body('class_id').notEmpty().custom((value)=>mongoose.Types.ObjectId.isValid(value)).withMessage("Invalid Class"),
    body('rating').notEmpty().isFloat({ min: 1, max: 5 }).withMessage("Must be between 0 and 5")
]
router.post("/review-class",authVerify,classReviewValidationChain,validationError,reviewClass)
router.patch("/accept-rescheduled-class/:_id",authVerify,acceptRescheduleValidationChain,validationError,acceptRescheduledClass)
const classMaterialvalidationChain=[
    param('_id').notEmpty().withMessage("Invalid Class"),
   
]
const dateValidationChain=[
    query("date").notEmpty().withMessage("Date is Required"),
   
]

const reUploadValiationChain=[
    param("home_work_id").notEmpty().withMessage("Invalid HomeWork Id")
    ]
router.get("/classes-by-date",authVerify,dateValidationChain,validationError,getClassesBasedOnDate)
router.patch("/upload-class-material/:_id",authVerify,classMaterialvalidationChain,validationError,uploadClassMaterial)
router.patch("/request-re-upload/:home_work_id",authVerify,reUploadValiationChain,validationError,requestReUpload)
const scheduleClassValidation=[
    param('_id').notEmpty().withMessage("Invalid Quote Id"),
    body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time")
]
router.patch("/schedule-class/:_id",authVerify,scheduleClassValidation,validationError,scheduleClass)
router.get("/upcoming-class-details",authVerify,getUpcomingClassDetails)
router.post("/other-info",authVerify,addOtherInfo)
router.patch("/accept-class/:_id",authVerify,acceptRescheduleValidationChain,validationError,acceptClassRequest)

export default router