import express from 'express'
const router=express.Router()
import { authVerify } from '../../../controllers/AcademicManager/Auth/Auth.js'
import {   getNotificationDetails, getNotifications } from '../../../controllers/AcademicManager/Notification/Notification.js'
router.get('/all-notifications',authVerify,getNotifications)
router.get('/notification',authVerify,getNotificationDetails)
export default router