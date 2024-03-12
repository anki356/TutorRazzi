import express from 'express'
import {  payQuote, rejectQuote } from '../../../controllers/Parent/Payment/Payment.js'
import { body,param } from 'express-validator'
import { authVerify } from '../../../controllers/Parent/Auth/Auth.js'
import validationError from '../../../middleware/validationError.js'
const router = express.Router()
const paymentValidation=[
    param('_id').notEmpty().withMessage("Invalid Quote"),  
    body('amount').notEmpty().withMessage("Amount is Required"),
    // body("tax").notEmpty().withMessage("Tax is Required"),
   body("net_amount").notEmpty().withMessage("Net Amount is Required"),
   body("trx_ref_no").notEmpty().withMessage("Transaction Reference Number is Required")
]
router.patch("/pay-quote/:_id",authVerify,paymentValidation,validationError,payQuote)
router.patch("/reject-quote/:_id",authVerify,rejectQuote)
export default router