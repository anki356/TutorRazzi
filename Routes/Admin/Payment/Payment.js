import express from 'express'
import { authVerify } from '../../../controllers/Admin/Auth/Auth.js'
import { getAllPayments, getPaymentById, getStats, getWeeklyData } from '../../../controllers/Admin/Payment/Payment.js'
const router=express.Router()
router.get('/stats',authVerify,getStats)
router.get('/weekly-data',authVerify,getWeeklyData)
router.get('/all-payments',authVerify,getAllPayments)
router.get('/payment-details',authVerify,getPaymentById)
export default router