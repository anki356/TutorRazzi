import express from "express";
import { authVerify } from "../../../controllers/Admin/Auth/Auth.js";
import { addTeacher, deleteTeacher, getTeacherDetails, getTeacherList, getTotalTeachers } from "../../../controllers/Admin/Teacher/Teacher.js";
import upload from "../../../util/upload.js";
import validationError from '../../../middleware/validationError.js'
import { body } from "express-validator";
const router=express.Router()
const teacherValidation=[
    body('mobile_number').notEmpty().isMobilePhone('en-IN').withMessage("Mobile Number is Required"),
    body('email').notEmpty().isEmail().withMessage("Email is Required"),
    body('name').notEmpty().withMessage("Name is Required"),
   body('password').notEmpty().withMessage("Password Is Required")
]
router.post("/add-Teacher",authVerify,teacherValidation,validationError,addTeacher)
router.get("/total-teachers",authVerify,getTotalTeachers)
router.get("/teacher-list",authVerify,getTeacherList)
router.get("/teacher-details",authVerify,getTeacherDetails)
router.patch("/teacher/:teacher_id",authVerify,deleteTeacher)
export default router