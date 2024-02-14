import express from "express"
import { getAllStudentPayments, getAllStudents, getBundleDetails, getStudentById, getStudentClassList } from "../../../controllers/AcademicManager/Student/Student.js"
import { authVerify } from "../../../controllers/AcademicManager/Auth/Auth.js"
const router = express.Router()
router.get("/all-students",authVerify,getAllStudents)
router.get("/student-by-id",authVerify,getStudentById)

router.get("/student-classes",authVerify,getStudentClassList)
router.get("/student-payments",authVerify,getAllStudentPayments)
router.get("/bundle-details",authVerify,getBundleDetails)
export default router