import express from "express";
import { authVerify } from "../../../controllers/Admin/Auth/Auth.js";
import { getLastAmountReceived, getSixMonthPayment, getTotalBookings, getTotalHoursCompleted, getTotalPaymentReceived, getTotalPaymentRemains, getTotalStudents, getTotalTrialRequests, totalProfileViews } from "../../../controllers/Admin/Dashboard/Dashboard.js";
const router=express.Router()
router.get("/total-payment-received",authVerify,getTotalPaymentReceived)
router.get("/last-payment-received",authVerify,getLastAmountReceived)
router.get("/amount-remains",authVerify,getTotalPaymentRemains)
router.get("/profile-views",authVerify,totalProfileViews)
router.get("/six-month-payment",authVerify,getSixMonthPayment)
router.get("/total-trial-requests",authVerify,getTotalTrialRequests)
router.get("/total-bookings",authVerify,getTotalBookings)
router.get("/total-students",authVerify,getTotalStudents)
router.get("/total-hours-completed",authVerify,getTotalHoursCompleted)
export default router