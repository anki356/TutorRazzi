import express from 'express'
import { authVerify } from '../../../controllers/TeacherApp/Auth/Auth.js'
import { getStatement,getPaymentDetails,  withdraw, getStats } from '../../../controllers/TeacherApp/Wallet/Wallet.js'
import { body } from 'express-validator'
import validationError from '../../../middleware/validationError.js'

const router=express.Router()
router.get("/wallet-stats",authVerify,getStats)
const withdrawValidationChain=[
body('amount').notEmpty().withMessage('Amount is required')
]
router.post("/withdraw",authVerify,withdrawValidationChain,validationError,withdraw)
// router.get("/last-week-earnings",authVerify,lastWeekEarnings)
// router.get("/last-withdrawl",authVerify,lastWithdrawl)
router.get("/statement",authVerify,getStatement)
router.get("/payment-details",authVerify,getPaymentDetails)
export default router