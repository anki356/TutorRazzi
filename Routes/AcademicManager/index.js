import express from "express";

const router=express.Router()
import QuoteROuter from "./Quote/Quote.js"
import AuthRouter from "./Auth/Auth.js"
import ClassRouter from "./Class/Class.js"
import DashboardRouter from "./Dashboard/Dashboard.js"
import StudentRouter from "./Students/Students.js"
import TeacherRouter from "./Teachers/Teachers.js"
import Support from "./Support/Support.js"
router.use("/academic-manager/",DashboardRouter)
router.use("/academic-manager/",QuoteROuter)
router.use("/academic-manager/",AuthRouter)
router.use("/academic-manager/",ClassRouter)
router.use("/academic-manager/",StudentRouter)
router.use("/academic-manager/",TeacherRouter)
router.use("/academic-manager/",TeacherRouter)
router.use("/academic-manager/",Support)

export default router