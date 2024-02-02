import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../../../models/User.js";
import bcrypt from 'bcrypt'
import { responseObj } from "../../../util/response.js";

import sendEmail from "../../../util/sendEmail.js";
import {newUserEmail} from "../../../util/EmailFormats/newUserEmail.js"
import {  changePasswordEmail } from "../../../util/EmailFormats/changePasswordEmail.js";
import Teacher from "../../../models/Teacher.js";
import Testimonial from "../../../models/Testimonial.js";
const ObjectId=mongoose.Types.ObjectId

const SignUp = async (req, res) => {

const { password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "teacher";

    const user = await User.create(req.body);
 
    const token = user.signJWT();
    sendEmail(req.body.email,"New Account Created",newUserEmail(user.name,user.email))
    return res.json(responseObj(true,{token,user},"Login Successfully Created")) 

    



}
const SignIn=async(req,res,next)=>{
   
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.role !== 'teacher') {
        throw new Error("Invalid credentials or no user exist.");
    }
const teacherDetails=await Teacher.findOne({
    user_id:user._id
})
const testimonial=await Testimonial.findOne({teacher_id:user._id})
let is_complete=teacherDetails!==null
    const verifyPassword = await bcrypt.compare(password, user.password);

    if (!verifyPassword) {
        throw new Error("Invalid credentials, Try again.");
    }
    const token = user.signJWT();
    res.json(responseObj(true,{
        access_token:token,
        user:user,
        is_complete:is_complete,
        is_testimonial:testimonial!==null
        
    },"Successful Login",null) )
}
const changePassword=async(req,res,next)=>{
  
    const { password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
       

            const userResponse = await User.findOneAndUpdate({
                email: req.user.email},
                {
$set:{...req.body}
                }
            )
            //Folder,content helper

           
            
            await sendEmail(req.user.email,"Password Changed",changePasswordEmail(req.user.name))
            res.json(responseObj(true,[],"Password Changed",null))
        }
    
    
    


   
const verifyOTP=async(req,res,next)=>{

const userResponse=await User.findOne({resetToken:req.body.otp})
if(!userResponse){
    throw new Error('Invalid or expired reset token.')
}

const token = userResponse.signJWT();
res.json(responseObj(true,{
    access_token:token
    
},"Otp Verified",null) )
}
const verifyEmail=async(req,res,next)=>{
    let userResponse=await User.findOne({email:req.body.email})
   
    if(userResponse.length===null){

throw new Error("User Email not found")

    }


        const verificationCode = Math.floor(Math.random() * 1000000);
    userResponse=await User.updateOne({email:req.body.email},{resetToken:verificationCode})
   // Create a transporter using the Ethereal account
  sendEmail(req.body.email,"Verification Email", "Verificaion code is "+verificationCode)
  res.json(responseObj(true,null,"Email Sent"))
      
          

}
const authVerify = (req, res, next) => {
    let token = req.header('Authorization');

    if (!token) {
        const response = responseObj(false, null, 'Access denied. Token missing.');
        return res.status(200).json(response);
    }

    token = token.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log(err);
            const response = responseObj(false, null, 'Token has expired.');
            return res.status(200).json(response);
        }

        req.user = user.user; // Store the user data from the token
        next();
    });
}
export {SignUp,SignIn,changePassword,verifyEmail,verifyOTP,authVerify}