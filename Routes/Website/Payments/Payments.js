import express from 'express'
import { authVerify } from '../../../controllers/Website/Auth/Auth.js'
import { getAllPayments, getAllQuotes, getPaymentDetails, getQuoteDetails, payQuote, rejectQuote } from '../../../controllers/Website/Payments/Payments.js'
import { body, param } from 'express-validator'
import validationError from '../../../middleware/validationError.js'
const router=express.Router()
router.get("/all-payments",authVerify,getAllPayments)
router.get("/all-quotes",authVerify,getAllQuotes)
router.get("/payment-details",authVerify,getPaymentDetails)
const paymentValidation=[
    param('_id').notEmpty().withMessage("Invalid Quote"),  
    body('amount').notEmpty().withMessage("Amount is Required"),
    // body("tax").notEmpty().withMessage("Tax is Required"),
   body("net_amount").notEmpty().withMessage("Net Amount is Required"),
   body("trx_ref_no").notEmpty().withMessage("Transaction Reference Number is Required")
]
router.patch("/pay-quote/:_id",authVerify,paymentValidation,validationError,payQuote)
router.patch("/reject-quote/:_id",authVerify,rejectQuote)
router.get("/quote",authVerify,getQuoteDetails)

export default router