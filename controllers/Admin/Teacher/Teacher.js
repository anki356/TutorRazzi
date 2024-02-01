import DegreeDetail from "../../../models/DegreeDetail.js"
import Teacher from "../../../models/Teacher.js"
import Testimonial from "../../../models/Testimonial.js";
import User from "../../../models/User.js"
import makeId from "../../../util/makeId.js";
import { responseObj } from "../../../util/response.js"
import bcrypt, { hash } from'bcrypt';
import sendEmail from "../../../util/sendEmail.js";
import { newTeacherSignup } from "../../../util/EmailFormats/newTeacherSignup.js";

const addTeacher=async(req,res,next)=>{
 let hash= await  bcrypt.hash(req.body.password, 10)
 let userResponse=await User.findOne({
   email: req.body.email,
   
 })
 if(userResponse===null){
   userResponse = await User.create({
      email: req.body.email,
      password: hash,
      mobile_number: req.body.mobile_number,
      role:"teacher",
      name:req.body.name
  })
  let content=newTeacherSignup(req.body.name,req.body.email,req.body.password)
  sendEmail(req.body.email,"New Teacher Sign In created",content)
 }else {

  return res.json(responseObj(false,"User Already Exist"))
}

           



        
         return  res.json(responseObj(true,teacherResponse,"Teacher Added Successfully"))
      
         
}

const getTotalTeachers=async(req,res)=>{
const totalTeachers=await Teacher.countDocuments()
return  res.json(responseObj(true,totalTeachers,"Total Count of Teachers"))
}

const getTeacherList=async(req,res)=>{
   let users=await User.find({
      status:true,
      role:'teacher'
  })
  let query={user_id:{
      $in:users.map((data)=>{
          return data._id
      })
  }}
   let options={
      limit:req.query.limit,
      page:req.query.page,
      populate:{
         path:'user_id',
      },
      select:{"preferred_name":1,"subject_curriculum_grade":1,"city":1,"state":1,"country":1}
      
   }

   Teacher.paginate(query,options,(err,result)=>{
      return  res.json(responseObj(true,result,"List of Teachers"))  
   })
}

const getTeacherDetails=async (req,res)=>{
   const teacherDetails=await Teacher.findOne({
      _id:req.query.teacher_id
   }).populate({path:'user_id'})
   const testimonialResponse=await Testimonial.find({teacher_id:teacherDetails.user_id})
    return res.json(responseObj(true, {teacherDetails:teacherDetails,testimonialResponse:testimonialResponse}, "Teacher Details"))
}

const deleteTeacher=async (req,res)=>{
   await User.updateOne({
_id:req.params.teacher_id
   },{
      $set:{
         status:false
      }
   })
   return  res.json(responseObj(true,[],"Teacher deleted successfullly")) 
}
export {addTeacher,getTotalTeachers,getTeacherList,getTeacherDetails,deleteTeacher}