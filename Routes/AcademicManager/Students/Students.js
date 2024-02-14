import express from "express"
import { getAllStudents, getStudentById, getStudentClassList } from "../../../controllers/AcademicManager/Student/Student.js"
import { authVerify } from "../../../controllers/AcademicManager/Auth/Auth.js"
const router = express.Router()
router.get("/all-students",authVerify,getAllStudents)
router.get("/student-by-id",authVerify,getStudentById)
router.get("/student-classes",authVerify,getStudentClassList)

export default router