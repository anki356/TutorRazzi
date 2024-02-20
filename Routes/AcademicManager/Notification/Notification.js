import express from 'express'
const router=express.Router()
import { authVerify } from '../../../controllers/AcademicManager/Auth/Auth.js'
import {   getNotificationDetails, getNotifications, markAllRead } from '../../../controllers/AcademicManager/Notification/Notification.js'
router.get('/all-notifications',authVerify,getNotifications)
router.get('/notification',authVerify,getNotificationDetails)
router.patch('/mark-all-read',authVerify,markAllRead)
export default router