import express from "express";
import {getUserProfile,getAllPayments, getTotalClasses, getTotalClassesAttended,getHomework,getUpcomingClasses, getWatchTime, getAllReports,getAllExams, getPastClasses, getRescheduledClasses, getTrialClasses, editUserProfile } from "../../../controllers/Student/Profile/Profile.js";
import { authVerify } from "../../../controllers/Student/Auth/Auth.js";
import { body } from "express-validator";
import validationError from "../../../middleware/validationError.js";
import upload from "../../../util/upload.js";
const router=express.Router()
router.get("/get-total-classes",authVerify,getTotalClasses)
router.get("/get-total-classes-attended",authVerify,getTotalClassesAttended)
router.get("/get-homework",authVerify,getHomework)
router.get("/get-upcoming-classes",authVerify,getUpcomingClasses)
router.get("/get-watch-time",authVerify,getWatchTime)
router.get("/get-user-profile",authVerify,getUserProfile)
router.get("/get-all-payments",authVerify,getAllPayments)
router.get("/get-all-reports",authVerify,getAllReports)
router.get("/get-all-exams",authVerify,getAllExams)
router.get("/get-past-classes",authVerify,getPastClasses)
router.get("/get-rescheduled-classes",authVerify,getRescheduledClasses)
router.get("/get-trial-classes",authVerify,getTrialClasses)
const studentValidation=[
    body('name').notEmpty().withMessage("Name is Required"),
    body('gender').notEmpty().withMessage("Gender is Required"),
    body('city').notEmpty().withMessage("City is Required"),
    body('state').notEmpty().withMessage("State is Required"),
    body('country').notEmpty().withMessage("Country is Required"),
    body('grade').notEmpty().withMessage("Grade is Required"),
    body('subject').isArray().notEmpty().withMessage("Subject in Array Format is Required"),
    body('age').notEmpty().withMessage("Age is Required"),
    // body('parent_email_address').notEmpty().withMessage("Parent Email Id is required"),
    // body('parent_mobile_number').notEmpty().withMessage("Parent Mobile Number is required"),
    body('school').notEmpty().withMessage("School Is Required"),
    body('address').notEmpty().withMessage("Address Is Required"),
    body('curriculum').notEmpty().withMessage("Curriculum Is Required"),
    // body('pincode').notEmpty().withMessage("Pincode is Required"),
    body('mobile_number').notEmpty().withMessage("Pincode is Required"),


]
router.post("/profile",authVerify,studentValidation,validationError,editUserProfile)
export default router