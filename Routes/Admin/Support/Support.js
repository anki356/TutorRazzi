import express from 'express'
import { addSupport, getTicketDetails, getTickets } from '../../../controllers/Admin/Support/Support.js'
import { authVerify } from '../../../controllers/TeacherApp/Auth/Auth.js'
import { body } from 'express-validator'
import validationError from '../../../middleware/validationError.js'
import upload from '../../../util/upload.js'
import { getSupportStats } from '../../../controllers/Admin/Support/Support.js'


const router=express.Router()
const supportValidation=[
    body('file').notEmpty().withMessage("File is Required"),
    body('title').notEmpty().withMessage("Title is required"),
    body('description').notEmpty().withMessage("Description is required")
]
router.post("/support",authVerify,supportValidation,validationError,addSupport)
router.get("/tickets",authVerify,getTickets)
router.get("/ticket-details",authVerify,getTicketDetails)
router.get("/support-stats",authVerify,getSupportStats)
export default router