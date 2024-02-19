import AcademicManager from "../../../models/AcademicManager.js"
import Student from "../../../models/Student.js"
import Teacher from "../../../models/Teacher.js"
import User from "../../../models/User.js"
import { responseObj } from "../../../util/response.js"

const getProfileDetails=async(req,res)=>{
    let user_id=req.user._id
    let userDetails=await User.findOne({_id:user_id})
    let profileDetails=null
profileDetails=await AcademicManager.findOne({
    user_id:req.user._id
})
const studentsDetails=await Student.find({
    user_id:{
        $in :profileDetails.students
    }
},{
    "preferred_name":1,"curriculum":1
})
const teachersDetails=await Teacher.find({
    user_id:{
        $in :profileDetails.teachers
    }
},{
    "preferred_name":1,"curriculum":1
})
return res.json(responseObj(true,{userDetails:userDetails,profileDetails:profileDetails,studentsDetails:studentsDetails,teachersDetails:teachersDetails},"User profile Details"))
}

const editProfileDetails=async(req,res)=>{
const userDetails=await User.findOneAndUpdate({
    _id:req.user._id
},{
    $set:{...req.body}
})

await AcademicManager.updateOne({
user_id:req.user._id
},{
    $set:{
        preferred_name:req.body.name,...req.body
    }
})
res.json(responseObj(true,null,"profile Edited Successfully"))
}
const editPhoto=async(req,res)=>{
    const userDetails=await User.findOne({
       _id:req.user._id
     })
    if(req.files?.length>0){
       if(userDetails.profile_image){
          await  unlinkFile(userDetails.profile_image)
          }
         await User.updateMany({
           _id:req.user._id
         },{
           $set:{
             profile_image:req.files[0].filename
           }
         })
 
         const teacherResponse=await AcademicManager.findOne({
          user_id:req.user._id
        }).populate({
         path:"user_id"
        })
         return res.json(responseObj(true,teacherResponse,"Photo edited")) 
       }
   else{
    return res.json(responseObj(false,null,"Please give photo"))
   }
   
   
  }
  const deletePhoto=async(req,res)=>{
    const userDetails=await User.findOneAndUpdate({
        _id:req.user._id
      },{
        $set:{
            profile_image:null
        }
      })
      if(userDetails.profile_image){
        await  unlinkFile(userDetails.profile_image)
        }
return res.json(responseObj(true,null,"Photo deleted"))
  }
export {getProfileDetails,editProfileDetails,editPhoto,deletePhoto}