import express from "express";
import { authVerify } from "../../../controllers/Admin/Auth/Auth.js";
import { addTeacher, deleteTeacher, getTeacherDetails, getTeacherList, getTotalTeachers } from "../../../controllers/Admin/Teacher/Teacher.js";
import upload from "../../../util/upload.js";
import validationError from '../../../middleware/validationError.js'
import { body } from "express-validator";
const router=express.Router()
const teacherValidation=[
    body('mobile_number').notEmpty().withMessage("Mobile Number is Required"),
    body('email').notEmpty().withMessage("Email is Required"),
    body('name').notEmpty().withMessage("Name is Required"),
    body('gender').notEmpty().withMessage("Gender is Required"),
    body('city').notEmpty().withMessage("City is Required"),
    body('state').notEmpty().withMessage("State is Required"),
    body('country').notEmpty().withMessage("Country is Required"),
    body('bachelor_degree_name').notEmpty().withMessage("Bachelor Degree Name is Required"),
    body('bachelor_degree_start_date').notEmpty().withMessage("Bachelor Degree Start Date is Required"),
    body('bachelor_degree_end_date').notEmpty().withMessage("Bachelor Degree End Date is Required"),
    body('bachelor_stream').notEmpty().withMessage("Bachelor Stream is Required"),
    body('bachelor_college_name').notEmpty().withMessage("Bachelor College Is Required"),
    body('master_degree_name').notEmpty().withMessage("Master Degree Name is Required"),
    body('master_degree_start_date').notEmpty().withMessage("Master Degree Start Date is Required"),
    body('master_degree_end_date').notEmpty().withMessage("Master Degree End Date is Required"),
    body('master_stream').notEmpty().withMessage("Master Stream is Required"),
    body('master_college_name').notEmpty().withMessage("Master College Is Required"),
    body('subject').notEmpty().withMessage("Subject Is Required"),
    body('curriculum').notEmpty().withMessage("Curriculum Is Required"),
    body('grade').notEmpty().withMessage("Grade Is Required"),
    body('dob').notEmpty().withMessage("DOB Is Required"),
    body('bank_name').notEmpty().withMessage("Bank Name Is Required"),
    body('branch_name').notEmpty().withMessage("Branch Name Is Required"),
    body('ifsc_code').notEmpty().withMessage("IFSC Code Is Required"),
    body('account_number').notEmpty().withMessage("Account Number Is Required"),
    body('pincode').notEmpty().withMessage("Pincode is Required"),
    body('address').notEmpty().withMessage("Address is Required")
]
router.post("/add-Teacher",authVerify,teacherValidation,validationError,addTeacher)
router.get("/total-teachers",authVerify,getTotalTeachers)
router.get("/teacher-list",authVerify,getTeacherList)
router.get("/teacher-details",authVerify,getTeacherDetails)
router.patch("/teacher/:teacher_id",authVerify,deleteTeacher)
export default router