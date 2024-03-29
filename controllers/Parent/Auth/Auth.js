import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../../../models/User.js";
import bcrypt from 'bcrypt'
import { responseObj } from "../../../util/response.js";
import Student from "../../../models/Student.js";

import nodemailer from "nodemailer"
import sendEmail from "../../../util/sendEmail.js";
import {newUserEmail} from "../../../util/EmailFormats/newUserEmail.js"
import {  changePasswordEmail } from "../../../util/EmailFormats/changePasswordEmail.js";
import Otp from "../../../models/Otp.js"
const ObjectId=mongoose.Types.ObjectId

const SignUp = async (req, res) => {

const { password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "parent";

    const user = await User.create(req.body);
 
    const token = user.signJWT();
    sendEmail(req.body.email,"New Account Created",newUserEmail(user.name,user.email))
    return res.json(responseObj(true,{token,user},"Login Successfully Created")) 

    



}
const SignIn=async(req,res,next)=>{
   
    const { email, password } = req.body;

    const user = await User.findOne({ email:email });
    console.log(user)
    if (!user || user.role !== 'parent') {
        throw new Error("Invalid credentials or no user exist.");
    }

    const verifyPassword = await bcrypt.compare(password, user.password);

    if (!verifyPassword) {
        throw new Error("Invalid credentials, Try again.");
    }
    const token = user.signJWT();
    res.json(responseObj(true,{
        access_token:token,
        user:user
        
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
            res.json(responseObj(true,null,"Password Changed"))
        }
    
    
    


   
        const verifyOTP=async(req,res,next)=>{

            const otpResponse=await Otp.findOne({email:req.body.email,code:Number(req.body.otp)})
            console.log(otpResponse)
            let userResponse=await User.findOne({email:otpResponse?.email,role:'parent'})
            if(!userResponse){
                throw new Error('Invalid or expired otp.')
            }
            await Otp.deleteOne({
                _id:otpResponse._id
            })
            const token = userResponse.signJWT();
            res.json(responseObj(true,{
                access_token:token
                
            },"Otp Verified") )
        
        }
const verifyEmail=async(req,res,next)=>{
    let userResponse=await User.findOne({email:req.body.email})
    //false condition before
    if(userResponse.length===null){

throw new Error("User Email not found")

    }


    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    userResponse=await Otp.create({email:req.body.email,code:verificationCode})
   // Create a transporter using the Ethereal account
  sendEmail(req.body.email,"Verification Email", "Verificaion code is "+verificationCode)
  res.json(responseObj(true,req.body.email,"Email Sent"))
      
          

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