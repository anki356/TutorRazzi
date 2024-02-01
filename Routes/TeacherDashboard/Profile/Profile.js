import express from 'express'
import { authVerify } from '../../../controllers/TeacherDashboard/Auth/Auth.js'
import { completeProfile, editProfile, getUserProfile } from '../../../controllers/TeacherDashboard/Profile/Profile.js'
import { body } from 'express-validator'
import validationError from '../../../middleware/validationError.js'
import upload from '../../../util/upload.js'
const router=express.Router()
const teacherValidation=[
    
   
    body('name').notEmpty().withMessage("Name is Required"),
    body('gender').notEmpty().withMessage("Gender is Required"),
    body('city').notEmpty().withMessage("City is Required"),
    body('state').notEmpty().withMessage("State is Required"),
    body('country').notEmpty().withMessage("Country is Required"),
    body('degree_details').notEmpty().withMessage("Degree Details is Required"),
    body('exp_details').notEmpty().withMessage("Exp Details is Required"),
   
    body('subject_curriculum').notEmpty().withMessage("Subject and Curriculum Is Required"),
    
    
    body('dob').notEmpty().withMessage("DOB Is Required"),
    body('bank_name').notEmpty().withMessage("Bank Name Is Required"),
    body('ifsc_code').notEmpty().withMessage("IFSC Code Is Required"),
    body('account_number').notEmpty().withMessage("Account Number Is Required"),
   
    
    body('bio').notEmpty().withMessage("Bio is Required")
]
router.get("/profile",authVerify,getUserProfile)
router.patch("/profile",authVerify,editProfile)
router.post("/complete-profile",authVerify,teacherValidation,validationError,completeProfile)
export default router