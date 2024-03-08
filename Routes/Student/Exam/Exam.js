import express from 'express'

import { addExams } from '../../../controllers/Student/Exam/Exam.js'
import { body } from 'express-validator'
import {authVerify} from "../../../controllers/Student/Auth/Auth.js"
import validationError from '../../../middleware/validationError.js'
const router = express.Router()
const examValidationChain=[
    
    body('subject').notEmpty().withMessage("Subject is necessary"),
    body('syllabus').notEmpty().withMessage("Syllabus is necessary"),
    body('start_time').notEmpty().withMessage("Start Time is required"),
    body('end_time').notEmpty().withMessage("End Time is required"),
    body('start_date').notEmpty().withMessage("Start Date is required"),

]
router.patch("/exams",authVerify,examValidationChain,validationError,addExams)
export default router