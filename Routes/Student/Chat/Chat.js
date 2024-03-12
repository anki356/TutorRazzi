import express from 'express'
const router=express.Router()
import { authVerify } from "../../../controllers/Student/Auth/Auth.js";
import { getAll } from '../../../controllers/Student/Chat/Chat.js';
router.get("/all",authVerify,getAll)
export default router