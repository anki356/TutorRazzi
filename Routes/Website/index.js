import express from 'express'
const router=express.Router()
import TeachersRouter from "./Teachers/Teachers.js"
import NewsRouter from "./News/News.js"
import AuthRouter from "./Auth/Auth.js"
import PaymentsRouter from "./Payments/Payments.js"
import ClassRouter from "./Class/Class.js"
import ProfileRouter from "./Profile/Profile.js"
router.get("/website",TeachersRouter)
router.get("/website",NewsRouter)
router.get("/website",AuthRouter)
router.get("/website",PaymentsRouter)
router.get("/website",ClassRouter)
router.get("/website",ProfileRouter)
export default router