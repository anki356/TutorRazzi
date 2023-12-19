import express from 'express'

import { addExams } from '../../../controllers/Parent/Exam/Exam.js'
import { body } from 'express-validator'
import { authVerify } from '../../../controllers/Parent/Auth/Auth.js'
import validationError from '../../../middleware/validationError.js'
const router = express.Router()
const examValidationChain=[
    body('student_id').notEmpty().withMessage("Student Id is necessary"),
    body('subject').notEmpty().withMessage("Subject is necessary"),
    body('syllabus').notEmpty().withMessage("Syllabus is necessary"),
    body('start_time').notEmpty().isAfter(new Date().toDateString()).withMessage("Start Time must be After current time"),
    body('end_time').notEmpty().isAfter(new Date().toDateString()).withMessage("End Time must be After current time"),
]
router.post("/exams",authVerify,examValidationChain,validationError,addExams)
export default router