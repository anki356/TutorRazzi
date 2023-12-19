import express from 'express'

import { body } from 'express-validator'
import validationError from '../../../middleware/validationError.js'
import upload from '../../../util/upload.js'
import { addSupport, getStats, getTicketDetails, getTickets } from '../../../controllers/TeacherDashboard/Support/Support.js'
import { authVerify } from '../../../controllers/TeacherDashboard/Auth/Auth.js'

const router=express.Router()
const supportValidation=[
    body('title').notEmpty().withMessage("Title is required"),
    body('description').notEmpty().withMessage("Description is required")
]
router.post("/support",authVerify,supportValidation,validationError,addSupport)
router.get("/tickets",authVerify,getTickets)
router.get("/ticket-details",authVerify,getTicketDetails)
router.get("/support-stats",authVerify,getStats)
export default router