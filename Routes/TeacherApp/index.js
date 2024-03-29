import express from "express";

const router=express.Router()
import AuthRouter from "./Auth/Auth.js"
import ProfileRouter from "./Profile/Profile.js"
import ClassRouter from "./Class/Class.js"
import StudentRouter from "./Student/Student.js"
import WalletRouter from "./Wallet/Wallet.js"
import SupportRouter from "./Support/Support.js"
import MonthlyReport from "./MonthlyReport/MonthlyReport.js"
import Notification from "./Notification/Notification.js"
import Chat from "./Chat/Chat.js"
router.use("/teacher-app/",AuthRouter)
router.use("/teacher-app/",ProfileRouter)
router.use("/teacher-app/",ClassRouter)
router.use("/teacher-app/",StudentRouter)
router.use("/teacher-app/",WalletRouter)
router.use("/teacher-app/",SupportRouter)
router.use("/teacher-app/",MonthlyReport)
router.use("/teacher-app/",Chat)
router.use("/teacher-app/",Notification)
export default router