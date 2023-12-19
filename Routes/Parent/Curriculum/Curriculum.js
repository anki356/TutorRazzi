import express from "express";
import {  getCurriculum,getGrades,getSubjects } from "../../../controllers/Parent/Curriculum/Curriculum.js";
import { authVerify } from "../../../controllers/Parent/Auth/Auth.js";
const router=express.Router()

router.get("/get-curriculum",authVerify,getCurriculum)
router.get("/get-subjects",authVerify,getSubjects)
router.get("/get-grades",authVerify,getGrades)
export default router