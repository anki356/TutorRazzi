import express from "express";

const router=express.Router()
import AuthRouter from "./Auth/Auth.js"
import DashboardRouter from "./Dashboard/Dashboard.js"
import ProfileRouter from "./Profile/Profile.js"
// import ClassRouter from "./Class/Class.js"
import StudentRouter from "./Student/Student.js"
import PaymentRouter from "./Payment/Payment.js"
import SupportRouter from "./Support/Support.js"
import ClassRouter from "./Class/Class.js"
import ReportRouter from "./MonthlyReport/MonthlyReport.js"
import ChatRouter from "./Chat/Chat.js"
import Notification from "./Notification/Notification.js"
router.use("/teacher-dashboard/",AuthRouter)
router.use("/teacher-dashboard/",DashboardRouter)
router.use("/teacher-dashboard/",ProfileRouter)
router.use("/teacher-dashboard/",ClassRouter)
router.use("/teacher-dashboard/",StudentRouter)
router.use("/teacher-dashboard/",PaymentRouter)
router.use("/teacher-dashboard/",SupportRouter)
router.use("/teacher-dashboard/",ReportRouter)
router.use("/teacher-dashboard/",ChatRouter)
router.use("/teacher-dashboard/",Notification)
export default router