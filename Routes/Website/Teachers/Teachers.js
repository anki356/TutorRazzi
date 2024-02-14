import express from 'express'

import { getCurriculums, getFeedBacks, getGrades, getGreatTeachers, getGreatTeachersList, getReviewDetails, getReviewList, getSubjects, getTeacherDetailsById, getTestimonials, getTestimonialsOfTeacher, postAFlag, postContact, postReview, requestTrialClass } from '../../../controllers/Website/Teachers/Teachers.js'
import { body } from 'express-validator'
const router=express.Router()
import  validationError from "../../../middleware/validationError.js"
import { authVerify } from '../../../controllers/Website/Auth/Auth.js'
router.get("/great-teachers",getGreatTeachers)
router.get("/testimonials",getTestimonials)
router.get("/feedbacks",getFeedBacks)
router.get("/great-teachers-list",getGreatTeachersList)
router.get("/teacher-details-by-id",getTeacherDetailsById)
router.get("/request-trial-class",authVerify,requestTrialClass)
const reviewValidation=[
    body("rating","Rating is required").not().isEmpty(),
    body("teacher_id","Teacher ID is Required").not().isEmpty(),
    
    
]
router.post("/review",authVerify,reviewValidation,validationError,postReview)
const contactValidation=[
    body('name').notEmpty().withMessage("Name is Required"),
    body('email').notEmpty().withMessage("Email Is Required"),
    body('subject').notEmpty().withMessage("Subject is Required"),
    body('message').notEmpty().withMessage("Message is Required")
]
router.post("/contact",contactValidation,validationError,postContact)
router.get("/grades",getGrades)
router.get("/subjects",getSubjects)
router.get("/curriculums",getCurriculums)
router.get("/review-details",getReviewDetails)
router.get("/teacher-testimonials",getTestimonialsOfTeacher)
router.get("/review-list",getReviewList)
const teacherReportValidation=[
    body('flag').notEmpty().withMessage("Flag is required")
]
router.patch("/report/:id",authVerify,postAFlag)
export default router