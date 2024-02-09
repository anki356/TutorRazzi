import User from "../../../models/User.js"
import Parent from "../../../models/Parent.js"
import Student from "../../../models/Student.js"
import { responseObj } from "../../../util/response.js"
import Testimonial from "../../../models/Testimonial.js"
import SubscribedEmail from "../../../models/SubscribedEmail.js"
import unlinkFile from "../../../util/unlinkFile.js"
const getProfileDetails=async(req,res)=>{
    let user_id=req.user._id
    let userDetails=await User.findOne({_id:user_id})
    let profileDetails=null
if(userDetails.role==='parent'){
    profileDetails=await Parent.findOne({
        user_id:req.user._id
    })
}
else if(userDetails.role==='student'){
    profileDetails=await Student.findOne({
        user_id:req.user._id
    }).populate({
      path:"parent_id"
    })
}
return res.json(responseObj(true,{userDetails:userDetails,profileDetails:profileDetails},"User profile Details"))
}

const editProfileDetails=async(req,res)=>{
const userDetails=await User.findOneAndUpdate({
    _id:req.user._id
},{
    $set:{...req.body}
})
if(req.files){
unlinkFile(userDetails.profile_image)
  await User.updateMany({
    _id:req.user._id
  },{
    $set:{
      profile_image:req.files[0].filename
    }
  })
}
if(userDetails.role==='parent'){
    await Parent.updateOne({
        user_id:req.user._id
    },{
        $set:{...req.body}
    })
}
else if(userDetails.role==='student'){
    await Student.updateOne({
        user_id:req.user._id
    },{
        $set:{...req.body}
    })
 
}
res.json(responseObj(true,[],"profile Edited Successfully"))
}
const getHomework=async(req,res,next)=>{
 
    let query={
      student_id:req.query.student_id
    }
    let ClassResponse=await Class.find(query,{_id:1})
    const options={
      limit:Number(req.query.limit),
      page:Number(req.query.page),
     
    }
  query={
    class_id:{
      $in:ClassResponse
    },
    status:'pending'
  }
  
     HomeWork.paginate(query,options,(err,result)=>{
    
      res.json(responseObj(true,{result:result},null))
     })
    
    res.json(responseObj(true,homeworks,''))
  }

  const uploadHomework = async (req, res, next) => {
    let documentResponse = await Document.create({
        name: req.files[0].filename
    })
let homeworkResponse=await HomeWork.findOne({
    _id:req.params._id
})
if(homeworkResponse.answer_document_id!==null){
  let  documentTobeDeleted=await Document.findOne(
        {_id:homeworkResponse.answer_document_id}
    )
  unlinkFile(documentTobeDeleted.name)  
}
   homeworkResponse=await HomeWork.updateOne({
    _id:req.params._id
  },{
    $set:{
        status:"Done",
        answer_document_id:documentResponse._id
    }
  })

    res.json(responseObj(true, [], "Home work uploaded"))
}

const subscribeToNewsLetter=async(req,res)=>{
const newsletterResponse=await SubscribedEmail.create({
  email:req.body.email
})
res.json(responseObj(true,newsletterResponse,"News Letter Subscribed"))
}
const getAllStudents=async(req,res)=>{
  let students=await Student.find({
    parent_id:req.user._id
  },{
    user_id:1,preferred_name:1
  })
  res.json(responseObj(true,students,"All Students linked to parent"))
}

const selectStudent=async(req,res)=>{
  let user=await User.findOne({
    user_id:req.body.student_id
  })
  const token = user.signJWT();
  res.json(responseObj(true,{
      access_token:token,
      
  },"Token with Student Details Attached",null) )
}
const onBoarding=async(req,res)=>{

}
export {selectStudent,getProfileDetails,editProfileDetails,getHomework,uploadHomework,subscribeToNewsLetter,getAllStudents}