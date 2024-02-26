import express from 'express'
import { authVerify } from '../../../controllers/Admin/Auth/Auth.js'
import {  cancelClass, deleteStudent, getAllStudents, getAllTeachers, getClassDetails, getHomeworkStatistics, getStudentClasses, getStudentDetails, getStudentSchedule, getTotalClassesHoursAttended, studentData } from '../../../controllers/Admin/Student/Student.js'
import { body } from 'express-validator'
const router=express.Router()
import validationError from '../../../middleware/validationError.js'
router.get("/student-data",authVerify,studentData)
router.get("/all-students",authVerify,getAllStudents)
router.get("/all-teachers",authVerify,getAllTeachers)
router.get("/student-classes",authVerify,getStudentClasses)
router.patch("/cancel-class/:_id",authVerify,cancelClass)
router.get("/class-details",authVerify,getClassDetails)
router.get("/student-details",authVerify,getStudentDetails)
router.get("/student-schedule",authVerify,getStudentSchedule)
router.get("/student-class-hours-attended",authVerify,getTotalClassesHoursAttended)
router.get("/student-homework-statistics",authVerify,getHomeworkStatistics)
router.delete("/delete-student/:student_id",authVerify,deleteStudent)

export default router