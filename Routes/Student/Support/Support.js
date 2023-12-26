import express from 'express'
import { addSupport, getAllTickets } from '../../../controllers/Website/Support/Support.js'
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
export default router