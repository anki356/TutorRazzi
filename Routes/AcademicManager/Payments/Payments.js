import express from 'express'
import { authVerify } from '../../../controllers/AcademicManager/Auth/Auth.js'
import { getPayments, getPaymentStats } from '../../../controllers/AcademicManager/Payments/Payments.js'
const router=express.Router()
router.get("/payments",authVerify,getPayments)
router.get("/payment-stats",authVerify,getPaymentStats)
export default router