import express from "express";
import { addSubjectCurriculum, getCurriculum } from "../../../controllers/Admin/Curriculum/Curriculum.js";
import { authVerify } from "../../../controllers/Student/Auth/Auth.js";
const router=express.Router()
router.post("/add-Curriculum",authVerify,addSubjectCurriculum)
router.get("/getCurriculum",authVerify,getCurriculum)
export default router