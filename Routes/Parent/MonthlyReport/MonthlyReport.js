import express  from "express";
import { getMonthlyReport, getMonthlyReports } from "../../../controllers/Parent/MonthlyReport/MonthlyReport.js";
import { authVerify } from "../../../controllers/Parent/Auth/Auth.js";
const router=express.Router()
router.get("/get-monthly-report",authVerify,getMonthlyReport)
router.get('/monthly-reports',authVerify,getMonthlyReports)
export default router