import express  from "express";
import { authVerify } from "../../../controllers/Admin/Auth/Auth.js";
import {  getMonthlyReport, getMonthlyReportDetails } from "../../../controllers/Admin/MonthlyReport/MonthlyReport.js";
import { body } from "express-validator";
import validationError from "../../../middleware/validationError.js";
const router=express.Router()
router.get("/get-monthly-report",authVerify,getMonthlyReport)
router.get("/get-monthly-report-details",authVerify,getMonthlyReportDetails)
export default router