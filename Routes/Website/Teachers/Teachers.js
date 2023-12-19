import express from 'express'

import { getFeedBacks, getGreatTeachers, getGreatTeachersList, getTeacherDetailsById, getTestimonials, postReview, requestTrialClass } from '../../../controllers/Website/Teachers/Teachers.js'
const router=express.Router()
router.get("/great-teachers",getGreatTeachers)
router.get("/testimonials",getTestimonials)
router.get("/feedbacks",getFeedBacks)
router.get("/great-teachers-list",getGreatTeachersList)
router.get("/teacher-details-by-id",getTeacherDetailsById)
router.get("/request-trial-class",requestTrialClass)
router.post("/review",postReview)
export default router