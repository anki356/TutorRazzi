import express from 'express'
const router=express.Router()
import { authVerify } from '../../../controllers/TeacherDashboard/Auth/Auth.js'
import {  clearNotification, getNotifications } from '../../../controllers/TeacherDashboard/Notification/Notification.js'
router.get('/all-notifications',authVerify,getNotifications)
router.patch('/clear-notifications',authVerify,clearNotification)
export default router