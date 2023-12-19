import express from 'express'
import { getPendingHomeworks, getPendingResourceRequests, getStats } from '../../../controllers/TeacherDashboard/Dashboard/DashBoard.js'
import { authVerify } from '../../../controllers/TeacherDashboard/Auth/Auth.js'
const router=express.Router()
router.get("/stats",authVerify,getStats)
router.get("/pending-homeworks",authVerify,getPendingHomeworks)
router.get("/pending-resource-requests",authVerify,getPendingResourceRequests)
export default router