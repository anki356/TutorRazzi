import express from 'express'
const router=express.Router()
import { authVerify } from "../../../controllers/AcademicManager/Auth/Auth.js";
import { getAll } from '../../../controllers/AcademicManager/Chat/Chat.js';
router.get("/all",authVerify,getAll)
export default router