import DegreeDetail from "../../../models/DegreeDetail.js"
import Teacher from "../../../models/Teacher.js"
import Testimonial from "../../../models/Testimonial.js";
import User from "../../../models/User.js"
import makeId from "../../../util/makeId.js";
import { responseObj } from "../../../util/response.js"
import bcrypt, { hash } from'bcrypt';
import sendEmail from "../../../util/sendEmail.js";
import { newTeacherSignup } from "../../../util/EmailFormats/newTeacherSignup.js";
import Class from "../../../models/Class.js";
import ResourceRequest from "../../../models/ResourceRequest.js";
import HomeWork from "../../../models/HomeWork.js";
import AcademicManager from "../../../models/AcademicManager.js";
import moment from "moment";

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
  await AcademicManager.updateOne({
   user_id:"656d6dc49817c1eaebfff864"
 },{
   $push:{
      teachers:userResponse._id
   }
 })
  let content=newTeacherSignup(req.body.name,req.body.email,req.body.password)
  sendEmail(req.body.email,"New Teacher Sign In created",content)
 }else {

  return res.json(responseObj(false,"User Already Exist"))
}

           



        
         return  res.json(responseObj(true,userResponse,"Teacher Added Successfully"))
      
         
}

const getTotalTeachers=async(req,res)=>{
const totalTeachers=await Teacher.countDocuments()
return  res.json(responseObj(true,totalTeachers,"Total Count of Teachers"))
}

const getTeacherList=async(req,res)=>{
  let query={
   role:"teacher"
  }
  if(req.query.search){
   query.name={
     $regex: req.query.search,
     $options:"i"
   }
  }
   let options={
      limit:req.query.limit,
      page:req.query.page,
      select:{
         "name":1,"email":1,"mobile_number":1,"status":1
      }
      
      
   }

   User.paginate(query,options,(err,result)=>{
      return  res.json(responseObj(true,result,"List of Teachers"))  
   })
}
const getTeacherData=async(req,res)=>{
   const new_trial_requests=await Class.countDocuments({
      class_type:"Trial",
        end_time:{
            $gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
        } 
   })
   const upcomingClassRequests=await Class.countDocuments({
      end_time:{
         $gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
     } ,
     status:"Scheduled"
   })
   let users=await User.countDocuments({
      role:'teacher'
   })
   return  res.json(responseObj(true,{new_trial_requests,upcomingClassRequests,users},"Teacher Data"))  
}

const getTeacherDetails=async (req,res)=>{
   const teacherDetails=await Teacher.findOne({
      user_id:req.query.teacher_id
   }).populate({path:'user_id'})
   if(teacherDetails===null){
      throw new Error("No Teacher Found")
   }
   const testimonialResponse=await Testimonial.find({teacher_id:teacherDetails.user_id})
   const new_trial_requests=await Class.countDocuments({
    
     teacher_id:req.query.teacher_id,
     class_type:"Trial",
     end_time:{
         $gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
     }
   })
   const rescheduledClasses=await Class.countDocuments({
     
     teacher_id:req.query.teacher_id,
    is_rescheduled:true,
    status:"Pending"
   })
   const classes=await Class.find({
      teacher_id:req.query.teacher_id
   })
   const resourceRequests=await ResourceRequest.countDocuments({
      class_id:{
         $in:classes.map((data)=>data._id)
      },
      status:"Resolved"
   })
   const homeworkRequests=await HomeWork.countDocuments({
      class_id:{
         $in:classes.map((data)=>data._id)
      },
      status:"Resolved"
   })

    return res.json(responseObj(true, {teacherDetails:teacherDetails,testimonialResponse:testimonialResponse,new_trial_requests,rescheduledClasses,resourceRequests,homeworkRequests}, "Teacher Details"))
}

const updateTeacher=async (req,res)=>{
   let details= await User.findById(req.params.teacher_id)
   await User.updateOne({
_id:req.params.teacher_id
   },{
      $set:{
         status:!details.status
      }
   })
   return  res.json(responseObj(true,[],"Teacher Status updated successfullly")) 
}
const deleteTeacher=async (req,res)=>{
  await User.deleteById(req.params.teacher_id)
 await  Teacher.delete({
      user_id:req.params.teacher_id
   })
   return  res.json(responseObj(true,[],"Teacher deleted successfullly")) 
}
export {addTeacher,getTotalTeachers,getTeacherList,getTeacherDetails,updateTeacher,getTeacherData,deleteTeacher}