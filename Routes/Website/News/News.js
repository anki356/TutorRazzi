import express from 'express'
import { getNews, getNewsById } from '../../../controllers/Website/News/News.js'
const router=express.Router()
router.get("/news",getNews)
router.get("/news-by-id",getNewsById)
export default router