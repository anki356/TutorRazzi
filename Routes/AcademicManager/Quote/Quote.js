import express from "express"
const router = express.Router()
import {addQuote, getSubjectCurriculum} from "../../../controllers/AcademicManager/Quote/Quote.js"
import {authVerify} from "../../../controllers/AcademicManager/Auth/Auth.js"
import { body } from "express-validator"
import validationError from "../../../middleware/validationError.js"
const QuoteValidation=[
    body('class_name').notEmpty().withMessage("Class name is Required"),
    body('student_id').notEmpty().withMessage("Student Id is required"),
    body('teacher_id').notEmpty().withMessage("Teacher Id Is Required"),
    body('class_count').notEmpty().withMessage("Teacher Id Is Required"),
    body('amount').notEmpty().withMessage("Amount is Required")
]
router.post("/Quote",authVerify,QuoteValidation,validationError,addQuote)

router.get("/subject-by-curriculum",authVerify,getSubjectCurriculum)
export default router