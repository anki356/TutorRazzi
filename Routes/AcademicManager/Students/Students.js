import express from "express"
import { getAllStudentPayments, getAllStudents, getBundleDetails, getPaymentDetails, getStudentById, getStudentClassList, getStudentPersonalDetails } from "../../../controllers/AcademicManager/Student/Student.js"
import { authVerify } from "../../../controllers/AcademicManager/Auth/Auth.js"
const router = express.Router()
router.get("/all-students",authVerify,getAllStudents)
router.get("/student-by-id",authVerify,getStudentById)

router.get("/student-classes",authVerify,getStudentClassList)
router.get("/student-payments",authVerify,getAllStudentPayments)
router.get("/bundle-details",authVerify,getBundleDetails)
router.get("/student-details",authVerify,getStudentPersonalDetails)
router.get("/student-payment-details",authVerify,getPaymentDetails)
export default router