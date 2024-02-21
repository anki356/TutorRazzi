import express from 'express'
import { authVerify } from '../../../controllers/Website/Auth/Auth.js'
import { editProfileDetails, getAllStudents, getHomework, getProfileDetails, onBoarding, onBoardingStudent, selectStudent, subscribeToNewsLetter, uploadHomework } from '../../../controllers/Website/Profile/Profile.js'
import { body } from 'express-validator'
const router=express.Router()
import validationError from '../../../middleware/validationError.js'
const editProfileValidation=[
    body('name').notEmpty().withMessage("Name is required"),
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('mobile_number').notEmpty().withMessage("Mobile Number is required"),
    body('mobile_number').isMobilePhone().withMessage("Mobile Number is not correct"),
   

]
router.get("/profile",authVerify,getProfileDetails)
router.patch("/profile",authVerify,editProfileValidation,validationError,editProfileDetails)
router.get("/homeworks",authVerify,getHomework)
router.patch("/homework/:_id",authVerify,uploadHomework)
router.post("/subscribe-newsletter",subscribeToNewsLetter)
router.get("/all-students",authVerify,getAllStudents)
router.post("/select-student",authVerify,selectStudent)
const onBoardingParentValdation=[
    body('name').notEmpty().withMessage("Name is required"),
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('password').notEmpty().withMessage("Password is required"),
]
const onBoardingStudentValdation=[
    body('name').notEmpty().withMessage("Name is required"),
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('password').notEmpty().withMessage("Password is required"),
    body('subjects').isArray().notEmpty().withMessage("Subjects is required"),
    body('curriculum').notEmpty().withMessage("Curriculum is required"),
    body('grade').notEmpty().withMessage("Grade is required"),
    body('parent_email').notEmpty().withMessage("Parent Email is required")
]
router.post("/on-boarding-parent",authVerify,onBoardingParentValdation,validationError,onBoarding)
router.post("/on-boarding-student",authVerify,onBoardingStudentValdation,validationError,onBoardingStudent)
export default router