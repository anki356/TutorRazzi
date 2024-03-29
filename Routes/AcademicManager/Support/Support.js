import express from 'express'



import {  addSupport, getStats, getTicketDetails, getTickets, markResolveTicket, saveResponse } from '../../../controllers/AcademicManager/Support/Support.js'
import { authVerify } from '../../../controllers/AcademicManager/Auth/Auth.js'
import { body } from 'express-validator'
import validationError from '../../../middleware/validationError.js'

const router=express.Router()


router.get("/tickets",authVerify,getTickets)
router.get("/ticket-details",authVerify,getTicketDetails)
router.get("/stats",authVerify,getStats)
const supportValidation=[
    body('title').notEmpty().withMessage("Title is required"),
    body('description').notEmpty().withMessage("Description is required")
]
router.post("/support",authVerify,supportValidation,validationError,addSupport)

router.post("/save-response",authVerify,saveResponse)
router.patch("/resolve-ticket/:support_id",authVerify,markResolveTicket)
export default router