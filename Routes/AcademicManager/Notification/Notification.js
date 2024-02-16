import express from 'express'
const router=express.Router()
import { authVerify } from '../../../controllers/AcademicManager/Auth/Auth.js'
import {  clearNotification, getNotifications } from '../../../controllers/AcademicManager/Notification/Notification.js'
router.get('/all-notifications',authVerify,getNotifications)
router.patch('/clear-notifications',authVerify,clearNotification)
export default router