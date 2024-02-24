import moment from "moment"
import Teacher from "../../../models/Teacher.js"
import Testimonial from "../../../models/Testimonial.js"
import User from "../../../models/User.js"
import { responseObj } from "../../../util/response.js"
import unlinkFile from "../../../util/unlinkFile.js"
import Curriculum from "../../../models/Curriculum.js"
import SubjectCurriculum from "../../../models/SubjectCurriculum.js"

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
   
 const bank_details=await Teacher.findOne({
  user_id:req.user._id
 },{
  bank_name:1,
ifsc_code:1,
account_number: 1,
 })
 const testimonials=await Testimonial.find({
   teacher_id:req.user._id
 })
    return res.json(responseObj(true,{testimonials:testimonials,profile_image:profile_image_details.profile_image_url,education_details:education_details.degree,experience_details:experience_details.exp_details,teacherPersonalDetails:teacherPersonalDetails,subject_curriculums:subject_curriculums.subject_curriculum,bank_details},"User Details"))
}
const getTestimonialsOfTeacher=async(req,res)=>{
   let query={teacher_id:req.user._id}
   let options={
       limit:req.query.limit,
       page:req.query.page
   }
   Testimonial.paginate(query,options,(err,result)=>{
       return res.json(responseObj(true,result,"Testimonials"))
   })
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
   if(data.end_year===undefined||data.end_year===null||data.end_year===''){
      data.exp=moment().year()-Number(data.start_year)
   }
   else if(Number(data.end_year)>Number(data.start_year)){
      data.exp=Number(data.end_year)-Number(data.start_year)
   }
   else if(Number(data.start_year)>moment().year()||Number(data.end_year)>moment().year()){
      return res.json(responseObj(false ,null,"end_year and start year cannot be in future"))
   }
   else{
      return res.json(responseObj(false ,null,"end_year should be greater than start_year"))
   }
   
   
   
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
   const teacherDetails=await Teacher.findOne({
      user_id:req.user._id
  })
  const testimonial=await Testimonial.findOne({teacher_id:req.user._id})
  let is_complete=teacherDetails!==null
  return  res.json(responseObj(true,{teacherResponse:teacherResponse,is_complete:is_complete,testimonial:testimonial},"Teacher Profile Completed Successfully"))
}

const uploadTestimonial=async(req,res)=>{
   // if(req.body.length===0){
   //    return res.json(responseObj(false,null,"Testimonial Not There"))
   //   }
   // const testimonialArray=req.body.map((data)=>{
      const { id,isEditing, ...rest } = req.body
//      return{
// ...rest,
// teacher_id:req.user._id
//      }
//    })
  const testimonialResponse=await Testimonial.create(
   {
      ...rest,
      teacher_id:req.user._id
   }
  )
  return res.json(responseObj(true,testimonialResponse,"Testimonial Uploaded"))
}
const editTestimonial=async(req,res)=>{
   const { id,isEditing, student_name,createdAt,_id,grade,school,video } = req.body 
  const testimonialResponse=await Testimonial.updateOne({
   _id:req.params._id
  },{
   $set:{
      student_name,
      school,
      grade,
      video
   }
  }
   
  )
  return res.json(responseObj(true,testimonialResponse,"Testimonial Edited"))
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
          
       }
    }
 );
 return res.json(responseObj(true,null,"Subject Curriculum Deleted")) 
}
const addSubjectCurriculum=async(req,res)=>{
   // if(req.body.length===0){
   //  return res.json(responseObj(false,null,"Subject Curriculum Not There"))
   // }
   // const subject_curriculum_array=req.body.map((data)=>{
      const { id,isEditing, ...rest } = req.body
//      return{
// ...rest,

//      }
//    })

 await Teacher.updateOne(
    { "user_id": req.user._id },
    {
       $push: {
          "subject_curriculum": 
            {
               ...req.body
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
   // if(req.body.length===0){
   //    return res.json(responseObj(false,null,"Degree Detail Not There"))
   //   }
   // const degree_detail_array=req.body.map((data)=>{
      const { id,isEditing, ...rest } = req.body
//      return{
// ...rest,

//      }
//    })
  await Teacher.updateOne(
     { "user_id": req.user._id },
     {
        $push: {
           "degree": 
           {
            ...rest
           }
           
        }
     }
  );
  return res.json(responseObj(true,null,"Degree Detail Added")) 
 }
 const editExpDetails=async(req,res)=>{
   if(req.body.end_year!==undefined&&req.body.end_year!==null&& req.body.end_year!==''&&Number(req.body.end_year)-Number(req.body.start_year)<0){
      return res.json(responseObj(false,null,"End year should be greater than start year"))
    }
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
   // if(req.body.length===0){
   //    return res.json(responseObj(false,null,"EXp Detail Not There"))
   //   }
// const exp_detail_array=req.body.map((data)=>{
   const { id,isEditing, ...rest } = req.body
//   return{
// ...rest,

//   }
// })
if(rest.end_year!==undefined&&rest.end_year!==null&& rest.end_year!==''&&Number(rest.end_year)-Number(rest.start_year)<0){
  return res.json(responseObj(false,null,"End year should be greater than start year"))
}
rest.exp=rest.end_year!==undefined&&rest.end_year!==null&& rest.end_year!==''?Number(rest.end_year)-Number(rest.start_year):moment().year-Number(rest.start_year)
  await Teacher.updateOne(
     { "user_id": req.user._id },
     {
        $push: {
           "exp_details": {...rest}
           
        }
     }
  );
  
  return res.json(responseObj(true,null,"Exp Details Added")) 
 }
 const editPhoto=async(req,res)=>{
   const userDetails=await User.findOne({
      _id:req.user._id
    })
    if (req.files?.profile_image) {
       if(userDetails.profile_image){
           await  unlinkFile(userDetails.profile_image)
           }

       req.body.profile_image = await upload(req.files.profile_image)
   
  
     
        await User.updateMany({
          _id:req.user._id
        },{
          $set:{
            ...req.body
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
 const getAllCurriculums=async (req,res)=>{
  const curriculums=await Curriculum.find({})
  return res.json(responseObj(true,curriculums,"All Curriculums"))
 }
 const getSubjectCurriculum=async(req,res)=>{
  const subject_curriculum=await SubjectCurriculum.find({
     curriculum:req.query.curriculum
  })
  let subjects=subject_curriculum.map((data)=>data.subject)
  return res.json(responseObj(true,subjects,"Subject Curriculum"))
 }
 const uploadTestimonialComplete=async(req,res)=>{
     if(req.body.length===0){
      return res.json(responseObj(false,null,"Testimonial Not There"))
     }
   const testimonialArray=req.body.map((data)=>{
      const { id,isEditing, ...rest } = data
     return{
...rest,
teacher_id:req.user._id
     }
   })
  const testimonialResponse=await Testimonial.insertMany(
   
     ...testimonialArray
   
  )
  const teacherDetails=await Teacher.findOne({
   user_id:req.user._id
})
const testimonial=await Testimonial.findOne({teacher_id:req.user._id})
let is_complete=teacherDetails!==null
return  res.json(responseObj(true,{teacherResponse:teacherDetails,is_complete:is_complete,testimonial:testimonial,is_testimonial:testimonial!==null},"Teacher Profile Completed Successfully"))
  
 }
export {uploadTestimonialComplete,getSubjectCurriculum,editTestimonial,editPhoto,addExpDetail,editExpDetails,deleteExpDetail,editDegreeDetails,deleteDegreeDetail,addDegreeDetail,addSubjectCurriculum,deleteSubjectCurriculum,getUserProfile,editProfile,completeProfile,uploadTestimonial,deleteTestimonial,editSubjectCurriculum,getAllCurriculums,getTestimonialsOfTeacher}
