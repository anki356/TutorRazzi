import express from 'express'
import User from '../../models/User';
import bcrypt from 'bcrypt'
const router=express.Router()
router.post("/auth/Change-password/:token",async(req,res)=>{
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