import express from 'express'
const router=express.Router()
import TeachersRouter from "./Teachers/Teachers.js"
import NewsRouter from "./News/News.js"
import AuthRouter from "./Auth/Auth.js"
import PaymentsRouter from "./Payments/Payments.js"
import ClassRouter from "./Class/Class.js"
import ProfileRouter from "./Profile/Profile.js"
import SupportRouter from "./Support/Support.js"
router.use("/website/",TeachersRouter)
router.use("/website/",NewsRouter)
router.use("/website/",AuthRouter)
router.use("/website/",PaymentsRouter)
router.use("/website/",ClassRouter)
router.use("/website/",SupportRouter)
router.use("/website/",ProfileRouter)
export default router