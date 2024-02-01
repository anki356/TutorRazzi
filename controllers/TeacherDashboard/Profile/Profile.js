import Teacher from "../../../models/Teacher.js"
import Testimonial from "../../../models/Testimonial.js"
import User from "../../../models/User.js"
import { responseObj } from "../../../util/response.js"

const getUserProfile=async(req,res)=>{
  const profile_image_details=await User.findOne({
    _id:req.user._id
  },{
    profile_image:1
  })
    const teacherPersonalDetails=await Teacher.findOne({
        user_id:req.user._id
    },{
      preferred_name:1,gender:1,city:1,dob:1,city:1,state:1,country:1,bio:1
    }).populate({
      path:"user_id",select:{
        email:1,mobile_number:1
      }
    })
    const education_details=await Teacher.findOne({
      user_id:req.user._id
    },{
      degree:1
    })
    const experience_details=await Teacher.findOne({
      user_id:req.user._id
    },{
      exp_details:1
    })
    const subject_curriculums=await Teacher.findOne({
      user_id:req.user._id
    },{
      subject_curriculum:1
    })
    const testimonialResponse=await Testimonial.find({teacher_id:req.user._id})
 
 
    return res.json(responseObj(true,{profile_image:profile_image_details.profile_image,education_details:education_details.degree,experience_details:experience_details.exp_details,teacherPersonalDetails:teacherPersonalDetails,testimonialResponse:testimonialResponse,subject_curriculums:subject_curriculums.subject_curriculum},"User Details"))
}

const editProfile=async(req,res)=>{
    if(req.body.delete_testimonials){
        const fileResponse=await Testimonial.find({
          _id: {$in: req.body.delete_images},
        },{
          name:1
        })
    fileResponse.forEach((data)=>{
      unlinkFile(data.name)
    })
        await Testimonial.deleteMany({_id:{$in:req.body.delete_testimonials}})
      }
      if (req.files ) {
        let testimonialsResponse = await Testimonial.insertMany(
          req.files
            .map((data) => {
              return { video: data.filename, teacher_id:req.user._id,student_id:req.body.student_id };
            })
        )
       
      
     
      }
      if(req.body.name){
        req.body.preferred_name=req.body.name
        }
await Teacher.updateOne({
    user_id:req.user._id
},{
    $set:{
        ...req.body
    }
})

await User.updateOne({
    _id:req.user._id
},{
    $set:{
        ...req.body
    }
})
return res.json(responseObj(true,[],"User Profile Edited"))
}
const completeProfile=async(req,res)=>{
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
subject_grade_curriculum:req.body.subject_grade_curriculum,
exp:req.body.exp,
dob:req.body.dob,
gender:req.body.gender,
bank_name:req.body.bank_name,
branch_name:req.body.branch_name,
ifsc_code:req.body.ifsc_code,
account_number:req.body.account_number


   })
  return  res.json(responseObj(true,teacherResponse,"Teacher Profile Completed Successfully"))
}
export {getUserProfile,editProfile}
