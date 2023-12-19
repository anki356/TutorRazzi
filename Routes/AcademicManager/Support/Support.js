import express from 'express'



import {  getStats, getTicketDetails, getTickets } from '../../../controllers/AcademicManager/Support/Support.js'

const router=express.Router()


router.get("/tickets",authVerify,getTickets)
router.get("/ticket-details",authVerify,getTicketDetails)
router.get("/stats",authVerify,getStats)
export default router