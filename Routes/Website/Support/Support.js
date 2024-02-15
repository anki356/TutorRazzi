import express from 'express'
import { addSupport, getAllTickets, getTicketDetails, markResolveTicket, saveResponse } from '../../../controllers/Website/Support/Support.js'
import {authVerify} from "../../../controllers/Website/Auth/Auth.js"
import { body } from 'express-validator'
import validationError from '../../../middleware/validationError.js'
const router=express.Router()
const supportValidation=[
    body('title').notEmpty().withMessage("Title is required"),
    body('description').notEmpty().withMessage("Description is required")
]
router.post("/support",authVerify,supportValidation,validationError,addSupport)
router.get("/tickets",authVerify,getAllTickets)
router.get("/ticket-details",authVerify,getTicketDetails)
router.post("/save-response",authVerify,saveResponse)
router.patch("/resolve-ticket/:support_id",authVerify,markResolveTicket)


export default router