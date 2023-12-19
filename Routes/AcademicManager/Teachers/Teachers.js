import express from "express"

import { getAllTeachers, getTeacherById } from "../../../controllers/AcademicManager/Teacher/Teacher.js"
import { authVerify } from "../../../controllers/AcademicManager/Auth/Auth.js"
const router = express.Router()
router.get("/all-teachers",authVerify,getAllTeachers)
router.get("/teacher-by-id",authVerify,getTeacherById)

export default router