import express from 'express'
const router=express.Router()
import { authVerify } from "../../../controllers/Parent/Auth/Auth.js";
import { getAll } from '../../../controllers/Parent/Chat/Chat.js';
router.get("/all",authVerify,getAll)
export default router