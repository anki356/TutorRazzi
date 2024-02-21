import express from 'express'
const router = new express.Router()
import upload from '../../../util/upload.js'
import  {getTotalStudents, getTrialClassesRequests, getUpcomingClasses,overallPerformance,acceptTrialClassRequest, getTrialClasses, getMyProfile, editPhoto, editProfile, viewProfileMain, getDetails, editSubjectCurriculum, getSubjectCurriculum, getAllCurriculums} from "../../../controllers/TeacherApp/Profile/Profile.js"
import { authVerify } from '../../../controllers/TeacherApp/Auth/Auth.js'
import validationError from '../../../middleware/validationError.js'
import { body,param } from 'express-validator'
import { getAllExams } from '../../../controllers/TeacherApp/Student/Student.js'
router.get("/trial-classes-requests",authVerify,getTrialClassesRequests)
router.get("/upcoming-classes",authVerify,getUpcomingClasses)
router.get("/overall-performance",authVerify,overallPerformance)
router.get("/total-students",authVerify,getTotalStudents)
const acceptRescheduleValidationChain=[
    param('_id').notEmpty().withMessage("Invalid Class"),
   
]
const editProfileValidation=[
    body('name').notEmpty().withMessage("Name is required"),
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('mobile_number').notEmpty().withMessage("Mobile Number is required"),
    body('mobile_number').isMobilePhone().withMessage("Mobile Number is not correct"),
   

]
const subject_curriculum_validation=[
    body('subject_curriculum').isArray().withMessage('Subject curriculum must be an array'),

    // Custom validation for each subject in the array
    body('subject_curriculum.*.subject')
      .trim()
      .notEmpty().withMessage('Subject is required'),
      
  
    // Custom validation for each curriculum in the array
    body('subject_curriculum.*.curriculum')
      .trim()
      .notEmpty().withMessage('Curriculum is required')
]

router.get("/subject-by-curriculum",authVerify,getSubjectCurriculum)
router.get("/curriculums",authVerify,getAllCurriculums)
router.patch("/accept-trial-class/:_id",authVerify,acceptRescheduleValidationChain,validationError,acceptTrialClassRequest)
router.get("/get-all-exams",authVerify,getAllExams)
router.get("/trial-classes",authVerify,getTrialClasses)
router.get("/my-profile",authVerify,getMyProfile)
router.get("/view-main-profile",authVerify,viewProfileMain)
router.get("/details",authVerify,getDetails)

router.patch("/subject-curriculum",authVerify,subject_curriculum_validation,validationError,editSubjectCurriculum)

router.patch("/profile",authVerify,editProfileValidation,validationError,editProfile)
export default router