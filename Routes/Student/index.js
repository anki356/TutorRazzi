import express from "express";

const router=express.Router()
import AuthRouter from "./Auth/Auth.js"
import ProfileRouter from "./Profile/Profile.js"
import CurriculumRouter from "./Curriculum/Curriculum.js"
import TeacherRouter from "./Teacher/Teacher.js"
import ClassRouter from "./Class/Class.js"
import PaymentRouter from "./Payment/Payment.js"
import ExamRouter from "./Exam/Exam.js"
import SupportRouter from "./Support/Support.js"

import ChatRouter from "./Chat/Chat.js"
router.use("/student/",AuthRouter)
router.use("/student/",ProfileRouter)
router.use("/student/",CurriculumRouter)
router.use("/student/",TeacherRouter)
router.use("/student/",ClassRouter)
router.use("/student",PaymentRouter)
router.use("/student",ExamRouter)
router.use("/student",SupportRouter)

router.use("/student",ChatRouter)
export default router