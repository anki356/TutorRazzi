import express from 'express'
import { addSupport, getAllTickets } from '../../../controllers/Website/Support/Support'
import authVerify from "../../../controllers/Website/Auth.js"
const router=express.Router()
const supportValidation=[
    body('title').notEmpty().withMessage("Title is required"),
    body('description').notEmpty().withMessage("Description is required")
]
router.post("/support",authVerify,supportValidation,validationError,addSupport)
router.get("/tickets",authVerify,getAllTickets)
export default router