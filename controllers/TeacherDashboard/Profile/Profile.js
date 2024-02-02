import moment from "moment"
import Teacher from "../../../models/Teacher.js"
import Testimonial from "../../../models/Testimonial.js"
import User from "../../../models/User.js"
import { responseObj } from "../../../util/response.js"
import unlinkFile from "../../../util/unlinkFile.js"

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
 const bank_details=await Teacher.findOne({
  user_id:req.user._id
 },{
  bank_name:1,
ifsc_code:1,
account_number: 1,
 })
 
    return res.json(responseObj(true,{profile_image:profile_image_details.profile_image_url,education_details:education_details.degree,experience_details:experience_details.exp_details,teacherPersonalDetails:teacherPersonalDetails,testimonialResponse:testimonialResponse,subject_curriculums:subject_curriculums.subject_curriculum,bank_details},"User Details"))
}

const editProfile=async(req,res)=>{
    
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
  console.log(req.files)
  await User.updateOne({
    _id:req.user._id
  },{
    $set:{
      ...req.body,
      profile_image:req.files?.length>0?req.files[0].filename:null
    }
  })
  req.body.exp_details=JSON.parse(req.body.exp_details)
  req.body.exp_details=req.body.exp_details.map((obj)=>{
   const { id, ...rest } = obj;
  return rest;

  })

  req.body.exp_details.forEach((data)=>{
   
    data.exp=Number(data.end_year)-Number(data.start_year)
   
  })
  req.body.degree_details=JSON.parse(req.body.degree_details)
  req.body.subject_curriculum=JSON.parse(req.body.subject_curriculum)
  req.body.degree_details=req.body.degree_details.map((obj)=>{
   const { id, ...rest } = obj;
  return rest;

  })
  req.body.subject_curriculum=req.body.subject_curriculum.map((obj)=>{
   const { id, ...rest } = obj;
  return rest;

  })
  const teacherResponse= await Teacher.create({
    preferred_name:req.body.name,
   user_id:req.user._id,
   city:req.body.city,
   state:req.body.state,
   country:req.body.country,
  
   
degree:req.body.degree_details,
exp_details:req.body.exp_details,
subject_curriculum:req.body.subject_curriculum,
exp:req.body.exp,
dob:req.body.dob,
gender:req.body.gender,
bank_name:req.body.bank_name,
ifsc_code:req.body.ifsc_code,
account_number:req.body.account_number,
bio:req.body.bio

   })
  return  res.json(responseObj(true,teacherResponse,"Teacher Profile Completed Successfully"))
}

const uploadTestimonial=async(req,res)=>{
   const testimonialArray=req.body.testData.map((data)=>{
      const { id, ...rest } = data
     return{
...rest,
teacher_id:req.user._id
     }
   })
  const testimonialResponse=await Testimonial.insertMany(
   testimonialArray
  )
  return res.json(responseObj(true,testimonialResponse,"Testimonial Uploaded"))
}
const deleteTestimonial=async(req,res)=>{
  await Testimonial.deleteOne({
    _id:req.params._id
  })
  return res.json(responseObj(true,null,"Testimonial Deleted"))
}

const editSubjectCurriculum=async(req,res)=>{
 await Teacher.updateOne(
    { "user_id": req.user._id, "subject_curriculum._id": req.params._id },
    {
       $set: {
          "subject_curriculum.$.subject": req.body.subject,
          "subject_curriculum.$.curriculum": req.body.curriculum,

          // Add other fields if necessary
       }
    }
 );
 return res.json(responseObj(true,null,"Subject Curriculum Edited"))
 
}
const deleteSubjectCurriculum=async(req,res)=>{
 await Teacher.updateOne(
    { "user_id": req.user._id },
    {
       $pull: {
          "subject_curriculum": { "_id": req.params._id }
          // Add other conditions if necessary
       }
    }
 );
 return res.json(responseObj(true,null,"Subject Curriculum Deleted")) 
}
const addSubjectCurriculum=async(req,res)=>{
 await Teacher.updateOne(
    { "user_id": req.user._id },
    {
       $push: {
          "subject_curriculum": {
             "subject": req.body.subject,
             "curriculum":req.body.curriculum
          }
       }
    }
 );
 return res.json(responseObj(true,null,"Subject Curriculum Added")) 
}
const editDegreeDetails=async(req,res)=>{
  await Teacher.updateOne(
     { "user_id": req.user._id, "degree._id": req.params._id },
     {
        $set: {
           "degree.$.name": req.body.name,
           "degree.$.start_year": req.body.start_year,
           "degree.$.end_year": req.body?.end_year,
          
           "degree.$.college": req.body.college,
 
           // Add other fields if necessary
        }
     }
  );
  return res.json(responseObj(true,null,"Degree Detail Edited"))
  
 }
 const deleteDegreeDetail=async(req,res)=>{
  await Teacher.updateOne(
     { "user_id": req.user._id },
     {
        $pull: {
           "degree": { "_id": req.params._id }
           // Add other conditions if necessary
        }
     }
  );
  return res.json(responseObj(true,null,"Degree Detail Deleted")) 
 }
 const addDegreeDetail=async(req,res)=>{
  await Teacher.updateOne(
     { "user_id": req.user._id },
     {
        $push: {
           "degree": {
           ...req.body
           }
        }
     }
  );
  return res.json(responseObj(true,null,"Degree Detail Added")) 
 }
 const editExpDetails=async(req,res)=>{
  await Teacher.updateOne(
     { "user_id": req.user._id, "exp_details._id": req.params._id },
     {
        $set: {
           "exp_details.$.exp":req.body.end_year? Number(req.body.end_year)-Number( req.body.start_year):moment().year()-Number( req.body.start_year),
           "exp_details.$.start_year": req.body.start_year,
           "exp_details.$.end_year": req.body?.end_year,
          
           "exp_details.$.subject_curriculum": req.body?.subject_curriculum,
           "exp_details.$.description": req.body?.description,
 
           // Add other fields if necessary
        }
     }
  );
  return res.json(responseObj(true,null,"Exp Detail Edited"))
  
 }
 const deleteExpDetail=async(req,res)=>{
  await Teacher.updateOne(
     { "user_id": req.user._id },
     {
        $pull: {
           "exp_details": { "_id": req.params._id }
           // Add other conditions if necessary
        }
     }
  );
  return res.json(responseObj(true,null,"EXp Details Deleted")) 
 }
 const addExpDetail=async(req,res)=>{
  await Teacher.updateOne(
     { "user_id": req.user._id },
     {
        $push: {
           "exp_details": {
           ...req.body
           }
        }
     }
  );
  return res.json(responseObj(true,null,"Exp Details Added")) 
 }
 const editPhoto=async(req,res)=>{
  const userDetails=await User.findOne({
    _id:req.user._id
  })
  if(userDetails.profile_image){
  await  unlinkFile(userDetails.profile_image)
  }
  await User.updateOne(
    {_id:req.user._id},{
      $set:{profile_image:req.files[0].filename}
    }
  )
  return res.json(responseObj(true,null,"Photo edited")) 
 }
export {editPhoto,addExpDetail,editExpDetails,deleteExpDetail,editDegreeDetails,deleteDegreeDetail,addDegreeDetail,addSubjectCurriculum,deleteSubjectCurriculum,getUserProfile,editProfile,completeProfile,uploadTestimonial,deleteTestimonial,editSubjectCurriculum}
