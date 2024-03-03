import express from 'express'
const router=express.Router()
import { authVerify } from "../../../controllers/Admin/Auth/Auth.js";
import { getAll } from '../../../controllers/Admin/Chat/Chat.js';
router.get("/all",authVerify,getAll)
export default router