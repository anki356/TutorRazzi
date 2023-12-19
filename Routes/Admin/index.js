import express from "express";

const router=express.Router()

import CurriculumRouter from "./Curriculum/Curriculum.js"
import TeacherRouter from "./Teacher/Teacher.js"
import AuthRouter from './Auth/Auth.js'
import DashboardRouter from "./DashBoard/Dashboard.js"
import StudentRouter from "./Student/Student.js"
import AcademicManagerRouter from "./AcademicManager/AcademicManager.js"
import PaymentRouter from "./Payment/Payment.js"
import SupportRouter from "./Support/Support.js"
import RoleRouter from "./Role/Role.js"
router.use("/admin/",CurriculumRouter)
router.use("/admin/",TeacherRouter)
router.use("/admin/",AuthRouter)
router.use("/admin/",DashboardRouter)
router.use("/admin/",StudentRouter)
router.use("/admin/",AcademicManagerRouter)
router.use("/admin/",PaymentRouter)
router.use("/admin/",SupportRouter)
router.use("/admin/",RoleRouter)
export default router