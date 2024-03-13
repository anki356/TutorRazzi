import express  from "express";
import { getAllSubjects, getMonthlyReport, getMonthlyReportDetails } from "../../../controllers/Parent/MonthlyReport/MonthlyReport.js";
import { authVerify } from "../../../controllers/Parent/Auth/Auth.js";
const router=express.Router()
router.get("/get-monthly-report",authVerify,getMonthlyReportDetails)
router.get('/monthly-reports',authVerify,getMonthlyReport)

router.get("/all-subjects",authVerify,getAllSubjects)
export default router