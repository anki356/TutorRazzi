import express from "express"
import { getAllStudents, getStudentById } from "../../../controllers/AcademicManager/Student/Student.js"
import { authVerify } from "../../../controllers/AcademicManager/Auth/Auth.js"
const router = express.Router()
router.get("/all-students",authVerify,getAllStudents)
router.get("/student-by-id",authVerify,getStudentById)

export default router