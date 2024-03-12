import express from 'express'
const router=express.Router()
import { authVerify } from "../../../controllers/TeacherApp/Auth/Auth.js";
import { getAll } from '../../../controllers/TeacherApp/Chat/Chat.js';
router.get("/all",authVerify,getAll)
export default router