import express from "express";
import { getTotalClasesToday,getAllExams,getHomeworks,getTotalClassesScheduled,getClassAttendedToday,getPendingPaymentClasses, getUpcomingClasses,getWatchHourweekly, getAttendance, getUserProfile, getPastClasses, getRescheduledClasses, getTrialClasses, editUserProfile, getAllPayments, getAllStudents, selectStudent } from "../../../controllers/Parent/Profile/Profile.js";
import { authVerify } from "../../../controllers/Parent/Auth/Auth.js";
import { body } from "express-validator";
import validationError from "../../../middleware/validationError.js";
const router=express.Router()
router.get("/get-total-classes-today",authVerify,getTotalClasesToday)
router.get("/get-total-scheduled-classes-today",authVerify,getTotalClassesScheduled)
router.get("/get-total-attended-classes-today",authVerify,getClassAttendedToday)
router.get("/get-user-profile",authVerify,getUserProfile)
router.get("/get-pending-payment-classes",authVerify,getPendingPaymentClasses)
router.get("/get-upcoming-classes",authVerify,getUpcomingClasses)
router.get("/get-past-classes",authVerify,getPastClasses)
router.get("/get-rescheduled-classes",authVerify,getRescheduledClasses)
router.get("/get-trial-classes",authVerify,getTrialClasses)
router.get("/get-all-exams",authVerify,getAllExams)
router.get("/get-watch-hours-weekly",authVerify,getWatchHourweekly)
router.get("/attendance",authVerify,getAttendance)
router.get("/Homeworks",authVerify,getHomeworks)
const studentValidation=[
    body('name').notEmpty().withMessage("Name is Required"),
    // body('gender').notEmpty().withMessage("Gender is Required"),
    body('city').notEmpty().withMessage("City is Required"),
    body('state').notEmpty().withMessage("State is Required"),
    body('country').notEmpty().withMessage("Country is Required"),
    body('grade').notEmpty().withMessage("Grade is Required"),
    body('subject').isArray().notEmpty().withMessage("Subject in Array Format is Required"),
    // body('age').notEmpty().withMessage("Age is Required"),
    // body('parent_email_address').notEmpty().withMessage("Parent Email Id is required"),
    body('parent_mobile_number').notEmpty().withMessage("Parent Mobile Number is required"),
    body('school').notEmpty().withMessage("School Is Required"),
    body('address').notEmpty().withMessage("Address Is Required"),
    body('curriculum').notEmpty().withMessage("Curriculum Is Required"),
    // body('pincode').notEmpty().withMessage("Pincode is Required"),
    body('mobile_number').notEmpty().withMessage("Pincode is Required"),


]
router.patch("/profile",authVerify,studentValidation,validationError,editUserProfile)
router.get("/payments",authVerify,getAllPayments)
router.get("/all-students",authVerify,getAllStudents)

router.post("/select-student",authVerify,selectStudent)
export default router