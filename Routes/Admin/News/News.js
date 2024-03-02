import express from 'express'
import { authVerify } from "../../../controllers/Admin/Auth/Auth.js";
import { addNews, editNews } from '../../../controllers/Admin/News/News.js'
import { body } from 'express-validator';
import validationError from '../../../middleware/validationError.js';
const router=express.Router()
const newsValidation=[
   body('title').notEmpty().withMessage("Title is required") ,
   body('description').notEmpty().withMessage("Description is required"),
   body('category').notEmpty().withMessage("Category is required")
]

router.post("/news",authVerify,newsValidation,validationError,addNews)
router.patch("/news/:_id",authVerify,editNews)
export default router