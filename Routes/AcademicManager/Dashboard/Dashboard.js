import express from 'express'
import { authVerify } from '../../../controllers/AcademicManager/Auth/Auth.js'
import { getHomeworks, getTotalPendingHomeworks, getTotalPendingTickets, getTotalRescheduledRequests, getTotalResourceRequests, getTotalTrialRequests, referSomeone } from '../../../controllers/AcademicManager/Dashboard/Dashboard.js'
const router=express.Router()
router.get("/total-trial-requests",authVerify,getTotalTrialRequests)
router.get("/total-reschedule-requests",authVerify,getTotalRescheduledRequests)
router.get("/total-resource-requests",authVerify,getTotalResourceRequests)
router.get("/total-homework-pending",authVerify,getTotalPendingHomeworks)
router.get("/total-pending-tickets",authVerify,getTotalPendingTickets)
router.get("/homeworks",authVerify,getHomeworks)
router.post("/refer-someone",authVerify,referSomeone)
export default router