import express from 'express'
import { authVerify } from '../../../controllers/TeacherDashboard/Auth/Auth.js'
import { addDegreeDetail, addExpDetail, addSubjectCurriculum, completeProfile, deleteDegreeDetail, deleteExpDetail, deleteSubjectCurriculum, deleteTestimonial, editTestimonial, editDegreeDetails, editExpDetails, editPhoto, editProfile, editSubjectCurriculum, getUserProfile, uploadTestimonial, getSubjectCurriculum, getAllCurriculums, uploadTestimonialComplete } from '../../../controllers/TeacherDashboard/Profile/Profile.js'
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

const subject_curriculum_validation=[
   
    body('subject').notEmpty().withMessage("Subject is required"),
    body('curriculum').notEmpty().withMessage("Curriculum is required")
]
const testimonial_validation=[
    body('video').notEmpty().withMessage("Video is required"),
    body('student_name').notEmpty().withMessage("Student Name is required"),
    body('grade').notEmpty().withMessage("Grade is required"),
    body('school').notEmpty().withMessage("school is required")
]
router.get("/profile",authVerify,getUserProfile)
router.patch("/profile",authVerify,editProfile)
router.post("/complete-profile",authVerify,teacherValidation,validationError,completeProfile)
router.post("/testimonial",authVerify,testimonial_validation,validationError,uploadTestimonial)
router.delete("/testimonial/:_id",authVerify,deleteTestimonial)
router.post("/subject-curriculum",authVerify,subject_curriculum_validation,validationError,addSubjectCurriculum)
router.patch("/subject-curriculum/:_id",authVerify,subject_curriculum_validation,validationError,editSubjectCurriculum)
router.delete("/subject-curriculum/:_id",authVerify,deleteSubjectCurriculum)
const degree_detail_validation=[
    body('name').notEmpty().withMessage("Degree name is required"),
    body('start_year').notEmpty().withMessage("Start Year is required"),
    body('college').notEmpty().withMessage("College is required")
]


const exp_detail_validation=[
 
    body('start_year').notEmpty().withMessage("Start Year is required"),
   
]
const uploadTestimonialCompleteValidation=[
    body('*.video').notEmpty().withMessage("Video is required"),
    body('*.student_name').notEmpty().withMessage("Student Name is required"),
    body('*.grade').notEmpty().withMessage("Grade is required"),
    body('*.school').notEmpty().withMessage("school is required")  
]
router.post("/degree-detail",authVerify,degree_detail_validation,validationError,addDegreeDetail)
router.patch("/degree-detail/:_id",authVerify,degree_detail_validation,validationError,editDegreeDetails)
router.delete("/degree-detail/:_id",authVerify,deleteDegreeDetail)
router.post("/exp-detail",authVerify,exp_detail_validation,validationError,addExpDetail)
router.patch("/exp-detail/:_id",authVerify,exp_detail_validation,validationError,editExpDetails)
router.delete("/exp-detail/:_id",authVerify,deleteExpDetail)
router.patch("/photo",authVerify,editPhoto)
router.patch("/testimonial/:_id",authVerify,editTestimonial)
router.get("/subject-by-curriculum",authVerify,getSubjectCurriculum)
router.get("/curriculums",authVerify,getAllCurriculums)
router.post("/upload-testimonial-complete",authVerify,uploadTestimonialCompleteValidation,validationError,uploadTestimonialComplete)

export default router