import express from 'express'
import User from '../../models/User.js';
import bcrypt from 'bcrypt'
import { body } from 'express-validator';
import validationError from '../../middleware/validationError.js';
const router=express.Router()
const passwordValidation=[
    body('password').notEmpty().withMessage("Password is required")
]
router.post("/auth/Change-password/:token",passwordValidation,validationError,async(req,res)=>{
    const { token } = req.params;
    const { password } = req.body;

    const tokenUser = await User.findOne({ resetToken: token });

    if (!tokenUser) {
        return res.render('reset-password', { token, errorMessage: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await tokenUser.updateOne({
        password: hashedPassword,
        token: null
    });

    // const response = responseJson(true, null, 'Password has changed successfuly', StatusCodes.OK, []);
    return res.render('reset-password-confirmed', { message: 'Password has changed successfuly.' });

    
})
export default router