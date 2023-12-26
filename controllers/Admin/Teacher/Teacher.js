import DegreeDetail from "../../../models/DegreeDetail.js"
import Teacher from "../../../models/Teacher.js"
import Testimonial from "../../../models/Testimonial.js";
import User from "../../../models/User.js"
import makeId from "../../../util/makeId.js";
import { responseObj } from "../../../util/response.js"
import bcrypt from'bcrypt';

const addTeacher=async(req,res,next)=>{
 let password= await  bcrypt.hash(makeId(5), 10)
 let userResponse=await User.findOne({
   email: req.body.email,
   role:'Teacher'
 })
 if(userResponse===null){
   userResponse = await User.insertMany({
      email: req.body.email,
      password: password,
      mobile_number: req.body.mobile_number,
      role:"teacher",
      name:req.body.name
  })
 }else{
   await User.updateOne({
       email:req.body.email
   },{
       $set:{
           name: req.body.name,
       mobile_number:req.body.mobile_number

       }
   })
}
           



          const teacherResponse= await Teacher.insertMany({
           preferred_name:req.body.name,
          user_id:userResponse[0]._id,
          city:req.body.city,
          state:req.body.state,
          pincode:req.body.pincode,
          country:req.body.country,
          address:req.body.address,
         
          
degree:[{
   name:req.body.bachelor_degree_name,
   start_date:req.body.bachelor_degree_start_date,
   end_date:req.body.bachelor_degree_end_date,
   stream:req.body.bachelor_stream,
   college:req.body.bachelor_college_name
},{
   name:req.body.master_degree_name,
   start_date:req.body.master_degree_start_date,
   end_date:req.body.master_degree_end_date,
   stream:req.body.master_stream,
   college:req.body.master_college_name
}],
subject:{
   name:req.body.subject
},
grade:{
   name:req.body.grade
},
curriculum:{
   name:req.body.curriculum
},
exp:req.body.exp,
dob:req.body.dob,
gender:req.body.gender,
bank_name:req.body.bank_name,
branch_name:req.body.branch_name,
ifsc_code:req.body.ifsc_code,
account_number:req.body.account_number
       
       
          })
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