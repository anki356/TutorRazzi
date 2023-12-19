import express from 'express'
import { authVerify } from '../../../controllers/Parent/Auth/Auth.js'
import { getAllStudents, getStudentById, getTotalStudents, getTotalUpcomingClasses, getTrialRequests } from '../../../controllers/TeacherDashboard/Student/Student.js'
import {  query } from 'express-validator'
import validationError from '../../../middleware/validationError.js'

const studentValidation = [
    query("student_id").notEmpty().withMessage("Invalid Student Id")
]

const router = express.Router()

router.get("/total-students", authVerify, getTotalStudents)
router.get("/total-trial-requests", authVerify, getTrialRequests)
router.get("/total-upcoming-classes", authVerify, getTotalUpcomingClasses)
router.get("/all-students", authVerify, getAllStudents)
router.get("/student", authVerify, studentValidation, validationError, getStudentById)





export default router