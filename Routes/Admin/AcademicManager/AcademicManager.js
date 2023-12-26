import express from 'express'
import { authVerify } from '../../../controllers/Admin/Auth/Auth.js'
import { addAcademicManager, deleteManager, getAcademicManagerDetails, getAllAcademicManager, getTotalAcademicManager } from '../../../controllers/Admin/AcademicManager/AcademicManager.js'
import { body } from 'express-validator'
const router=express.Router()
import validationError  from "../../../middleware/validationError.js"
const academicManagerValidation=[
    body('mobile_number').notEmpty().withMessage("Mobile Number is Required"),
    body('email').notEmpty().withMessage("Email is Required"),
    body('name').notEmpty().withMessage("Name is Required"),
    body('students').isArray().notEmpty().withMessage("Student Array is required"),
    body('teachers').isArray().notEmpty().withMessage("Teacher Array is required"),
    body('pincode').notEmpty().withMessage("Pincode is Required"),
    body('city').notEmpty().withMessage("City is Required"),
    body('state').notEmpty().withMessage("State is Required"),
    body('country').notEmpty().withMessage("Country is Required"),
    body('address').notEmpty().withMessage("Address is Required"),
    body('bachelor_degree_name').notEmpty().withMessage("Bachelor Degree Name is Required"),
    body('bachelor_degree_start_date').notEmpty().withMessage("Bachelor Degree Start Date is Required"),
    body('bachelor_degree_end_date').notEmpty().withMessage("Bachelor Degree End Date is Required"),
    body('bachelor_stream').notEmpty().withMessage("Bachelor Stream is Required"),
    body('bachelor_college_name').notEmpty().withMessage("Bachelor College Is Required"),
    body('master_degree_name').notEmpty().withMessage("Master Degree Name is Required"),
    body('master_degree_start_date').notEmpty().withMessage("Master Degree Start Date is Required"),
    body('master_degree_end_date').notEmpty().withMessage("Master Degree End Date is Required"),
    body('master_stream').notEmpty().withMessage("Master Stream is Required"),
    body('master_college_name').notEmpty().withMessage("Master College Is Required"),
    body('exp').notEmpty().withMessage("Experience Is Required"),
    body('gender').notEmpty().withMessage("Gender Is Required"),
    body('dob').notEmpty().withMessage("DOB Is Required"),
    body('bank_name').notEmpty().withMessage("Bank Name Is Required"),
    body('branch_name').notEmpty().withMessage("Branch Name Is Required"),
    body('ifsc_code').notEmpty().withMessage("IFSC Code Is Required"),
    body('account_number').notEmpty().withMessage("Account Number Is Required")


]
router.get("/total-academic-managers",authVerify,getTotalAcademicManager)
router.get("/all-academic-managers",authVerify,getAllAcademicManager)
router.post("/add-academic-managers",authVerify,academicManagerValidation,validationError,addAcademicManager)
router.get("/academic-manager-details",authVerify,getAcademicManagerDetails)
router.patch("/manager/:manager_id",authVerify,deleteManager)
export default router