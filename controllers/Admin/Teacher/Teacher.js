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

           



        
         return  res.json(responseObj(true,userResponse,"Teacher Added Successfully"))
      
         
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
      select:{"preferred_name":1,"subject_curriculum":1,"city":1,"state":1,"country":1}
      
   }
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

   Teacher.paginate(query,options,(err,result)=>{
      return  res.json(responseObj(true,{result,new_trial_requests,upcomingClassRequests,totalTeachers:result.totalDocs},"List of Teachers"))  
   })
}

const getTeacherDetails=async (req,res)=>{
   const teacherDetails=await Teacher.findOne({
      user_id:req.query.teacher_id
   }).populate({path:'user_id'})
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