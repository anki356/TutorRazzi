import express from 'express'

import { addExams } from '../../../controllers/Student/Exam/Exam.js'
import { body } from 'express-validator'
import {authVerify} from "../../../controllers/Student/Auth/Auth.js"
import validationError from '../../../middleware/validationError.js'
const router = express.Router()
const examValidationChain=[
    
    body('subject').notEmpty().withMessage("Subject is necessary"),
    body('syllabus').notEmpty().withMessage("Syllabus is necessary"),
    body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time"),
    body('end_time').notEmpty().isAfter(new Date().toDateString()).withMessage("End Time must be After current time"),
]
router.patch("/exams",authVerify,examValidationChain,validationError,addExams)
export default router