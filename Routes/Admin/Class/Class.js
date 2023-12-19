import express from 'express'
import { authVerify } from '../../../controllers/Student/Auth/Auth'
import { getTotalBookings } from '../../../controllers/Admin/Dashboard/Dashboard'
const router=express.Router()
router.get("/all-bookings",authVerify,getTotalBookings)
export default router