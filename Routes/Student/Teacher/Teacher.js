import express from "express";
import { authVerify } from "../../../controllers/Student/Auth/Auth.js";
import { getTeacherBySubjectCurriculum,getTeacherById, getGreatTeachers, reviewTeacher, getTeachersBySubjectAndName } from "../../../controllers/Student/Teacher/Teacher.js";
import { body } from "express-validator";
import validationError from "../../../middleware/validationError.js";
const router=express.Router()
const reviewValidation=[
    body('ratings').notEmpty().withMessage("Ratings is Required Field"),
    body('teacher_id').notEmpty().withMessage("teacher Id is required"),
    body('class_id').notEmpty().withMessage("Class Id is required"),


]
router.get("/get-Teacher-By-Subject-Curriculum-Grade",authVerify,getTeacherBySubjectCurriculum)
router.get("/get-Teacher-By-Id",authVerify,getTeacherById)
router.get("/get-great-teachers",authVerify,getGreatTeachers)
router.post("/review-teacher",authVerify,reviewValidation,validationError,reviewTeacher)
router.get("/teachers-by-subject-and-name",authVerify,getTeachersBySubjectAndName)
export default  router; 