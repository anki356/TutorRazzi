import express from 'express'
import { authVerify } from '../../../controllers/TeacherDashboard/Auth/Auth.js'
import { getPaymentDetails, getPaymentWeekly, getPayments, getWalletBalance,getWithdrawls,lastWithdrawl } from '../../../controllers/TeacherDashboard/Payment/Payment.js'

const router=express.Router()
router.get("/payments-weekly",authVerify,getPaymentWeekly)
router.get("/wallet-balance",authVerify,getWalletBalance)
router.get("/last-withdrawl",authVerify,lastWithdrawl)
router.get("/payment-details",authVerify,getPaymentDetails)
router.get("/payments",authVerify,getPayments)
router.get("/withdrawls",authVerify,getWithdrawls)
export default router