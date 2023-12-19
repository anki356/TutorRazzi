import express from "express";
import { getTotalClasesToday,getAllExams,getHomeworks,getTotalClassesScheduled,getClassAttendedToday,getPendingPaymentClasses, getUpcomingClasses,getWatchHourweekly, getAttendance, getUserProfile, getPastClasses, getRescheduledClasses, getTrialClasses, editUserProfile, getAllPayments } from "../../../controllers/Parent/Profile/Profile.js";
import { authVerify } from "../../../controllers/Parent/Auth/Auth.js";
const router=express.Router()
router.get("/get-total-classes-today",authVerify,getTotalClasesToday)
router.get("/get-total-scheduled-classes-today",authVerify,getTotalClassesScheduled)
router.get("/get-total-attended-classes-today",authVerify,getClassAttendedToday)
router.get("/get-user-profile",authVerify,getUserProfile)
router.get("/get-pending-payment-classes",authVerify,getPendingPaymentClasses)
router.get("/get-upcoming-classes",authVerify,getUpcomingClasses)
router.get("/get-past-classes",authVerify,getPastClasses)
router.get("/get-rescheduled-classes",authVerify,getRescheduledClasses)
router.get("/get-trial-classes",authVerify,getTrialClasses)
router.get("/get-all-exams",authVerify,getAllExams)
router.get("/get-watch-hours-weekly",authVerify,getWatchHourweekly)
router.get("/attendance",authVerify,getAttendance)
router.get("/Homeworks",authVerify,getHomeworks)
router.patch("/profile",authVerify,editUserProfile)
router.get("/payments",authVerify,getAllPayments)
export default router