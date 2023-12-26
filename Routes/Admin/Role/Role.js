import express from 'express'
import { authVerify } from '../../../controllers/Admin/Auth/Auth.js'
import {  deleteUser, getAllRoles, getRoleDetails } from '../../../controllers/Admin/Role/Role.js'
const router=express.Router()
router.get("/roles",authVerify,getAllRoles)
router.get("/role-details",authVerify,getRoleDetails)
router.delete("/user/:_id",authVerify,deleteUser)

export default router