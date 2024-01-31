import express from 'express'
const router=express.Router()
import { authVerify } from "../../../controllers/TeacherDashboard/Auth/Auth.js";
import { getAll } from '../../../controllers/TeacherDashboard/Chat/Chat.js';
router.get("/all",authVerify,getAll)
export default router