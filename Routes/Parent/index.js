import express from "express";

const router=express.Router()
import AuthRouter from "./Auth/Auth.js"
import ProfileRouter from "./Profile/Profile.js"
import ClassRouter from "./Class/class.js";
import CurriculumRouter from "./Curriculum/Curriculum.js"
import TeacherRouter from "./Teacher/Teacher.js"
import MonthlyReportRouter from "./MonthlyReport/MonthlyReport.js"
import PaymentRouter from "./Payment/Payment.js";

import ExamRouter from "./Exam/Exam.js"
router.use("/parent/",AuthRouter)
router.use("/parent/",ProfileRouter)
router.use("/parent/",ClassRouter)
router.use("/parent",CurriculumRouter)
router.use("/parent",TeacherRouter)
router.use("/parent",MonthlyReportRouter)
router.use("/parent",PaymentRouter)
router.use("/parent",ExamRouter)
export default router