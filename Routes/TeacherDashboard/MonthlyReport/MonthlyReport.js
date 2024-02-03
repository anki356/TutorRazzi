import express  from "express";
import { authVerify } from "../../../controllers/TeacherDashboard/Auth/Auth.js";
import { addMonthlyReport, getAllSubjects, getMonthlyReport, getMonthlyReportDetails, isStudentReportPending } from "../../../controllers/TeacherDashboard/MonthlyReport/MonthlyReport.js";
import { body } from "express-validator";
import validationError from "../../../middleware/validationError.js";
const router=express.Router()
router.get("/get-monthly-report",authVerify,getMonthlyReport)
const ReportValidation=[
    body('subject').notEmpty().withMessage("Subject is required"),
    body('subject_knowledge_and_understanding').notEmpty().withMessage("Subject knowledge rating cannot be empty"),
    body('class_participation_and_engagement').notEmpty().withMessage("Class participation and engagement  rating cannot be empty"),
    body('homeworks_and_assignment_completion').notEmpty().withMessage("Homework and assignment completion rating cannot be empty"),
    body('problem_solving_and_critical_thinking_skills').notEmpty().withMessage("Problem solving and critical thinking skills rating cannot be empty"),
    body('motivation_and_enthusiasm').notEmpty().withMessage("Motivation and enthusiasm rating cannot be empty"),
    body('collaboration_and_teamwork').notEmpty().withMessage("Collaboration and teamwork rating cannot be empty"),
    body('verbal_communication').notEmpty().withMessage("Verbal Communication rating cannot be empty"),
    body('written_communication').notEmpty().withMessage("Written Communication rating cannot be empty"),
    body('time_management').notEmpty().withMessage("Time management rating cannot be empty"),
    body('organization_and_preparedness').notEmpty().withMessage("Organization and Preparedness rating cannot be empty"),
    body('responsibility_and_accountability').notEmpty().withMessage("Responsiblity and Accountability rating cannot be empty"),
    body('subject_knowledge_and_understanding_message').notEmpty().withMessage("Subject knowledge message cannot be empty"),
    body('class_participation_and_engagement_message').notEmpty().withMessage("Class participation and engagement  message cannot be empty"),
    body('homeworks_and_assignment_completion_message').notEmpty().withMessage("Homework and assignment completion message cannot be empty"),
    body('problem_solving_and_critical_thinking_skills_message').notEmpty().withMessage("Problem solving and critical thinking skills message cannot be empty"),
    body('motivation_and_enthusiasm_message').notEmpty().withMessage("Motivation and enthusiasm message cannot be empty"),
    body('collaboration_and_teamwork_message').notEmpty().withMessage("Collaboration and teamwork message cannot be empty"),
    body('verbal_communication_message').notEmpty().withMessage("Verbal Communication message cannot be empty"),
    body('written_communication_message').notEmpty().withMessage("Written Communication message cannot be empty"),
    body('time_management_message').notEmpty().withMessage("Time management message cannot be empty"),
    body('organization_and_preparedness_message').notEmpty().withMessage("Organization and Preparedness message cannot be empty"),
    body('responsibility_and_accountability_message').notEmpty().withMessage("Responsiblity and Accountability message cannot be empty"),
    body('comments').notEmpty().withMessage(" Additional Comments cannot be empty"),
    
]
router.post("/add-monthly-report",authVerify,ReportValidation,validationError,addMonthlyReport)
router.get("/all-subjects",authVerify,getAllSubjects)
router.get("/get-monthly-report-details",authVerify,getMonthlyReportDetails)
router.get("/is-student-report-pending",authVerify,isStudentReportPending)
export default router