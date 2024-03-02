import express from 'express'
import { authVerify } from "../../../controllers/Admin/Auth/Auth.js";
import { addNews, deleteNews, editNews, getNews, getNewsById } from '../../../controllers/Admin/News/News.js'
import { body } from 'express-validator';
import validationError from '../../../middleware/validationError.js';
const router=express.Router()
const newsValidation=[
   body('title').notEmpty().withMessage("Title is required") ,
   body('description').notEmpty().withMessage("Description is required"),
   body('category').notEmpty().withMessage("Category is required").isIn(['Educational ','Strategies','Technology','Professional','Career','Parental'])
]

router.post("/news",authVerify,newsValidation,validationError,addNews)
router.patch("/news/:_id",authVerify,editNews)
router.get("/news",authVerify,getNews)
router.get("/news-by-id",authVerify,getNewsById)
router.delete("/news/:news_id",authVerify,deleteNews)

export default router