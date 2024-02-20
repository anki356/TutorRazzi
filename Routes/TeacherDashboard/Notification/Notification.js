import express from 'express'
const router=express.Router()
import { authVerify } from '../../../controllers/TeacherDashboard/Auth/Auth.js'
import {   getNotificationDetails, getNotifications, markAllRead } from '../../../controllers/TeacherDashboard/Notification/Notification.js'
router.get('/all-notifications',authVerify,getNotifications)
router.get('/notification',authVerify,getNotificationDetails)
router.patch('/mark-all-read',authVerify,markAllRead)
export default router