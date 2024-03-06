import User from "../../../models/User.js"
import Parent from "../../../models/Parent.js"
import Student from "../../../models/Student.js"
import { responseObj } from "../../../util/response.js"
import Testimonial from "../../../models/Testimonial.js"
import SubscribedEmail from "../../../models/SubscribedEmail.js"
import unlinkFile from "../../../util/unlinkFile.js"
import bcrypt from "bcrypt"
import Subject from "../../../models/Subject.js"
import upload  from "../../../util/upload.js"
import { addNotifications } from "../../../util/addNotification.js"
import AcademicManager from "../../../models/AcademicManager.js"
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
      path:"parent_id",
      select:{
        "email":1,"mobile_number":1
      }
    })
}
return res.json(responseObj(true,{userDetails:userDetails,profileDetails:profileDetails},"User profile Details"))
}

const editProfileDetails=async(req,res)=>{
const userDetails=await User.findOne({
    _id:req.user._id,

})
if(req.files?.file){
unlinkFile(userDetails.profile_image)
let fileName=await upload(req.files.file)
  await User.updateOne({
    _id:req.user._id
  },{
    $set:{
      profile_image:fileName
    }
  })
}
 
  req.body.subjects=JSON.parse(req.body.subjects).map((data)=>{
    return {name:data}
  })
   let studentDetails= await Student.findOneAndUpdate({
        user_id:req.user._id
    },{
        $set:{...req.body,preferred_name:req.body.name,"grade":{name:req.body.grade},"curriculum":{name:req.body.curriculum}}
    })
    await User.updateOne({
      _id:req.user._id
    },{
      $set:{
        mobile_number:req.body.mobile_number
      }
    })
    if(req.body.parent_mobile_number){
      await User.updateOne({
        _id:studentDetails.parent_id
      },{
        $set:{
          mobile_number:req.body.parent_mobile_number
        }
      })
    }
 

res.json(responseObj(true,null,"profile Edited Successfully"))
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
  }).populate({
    path:"user_id",
    select:{
      "profile_image":1
    }
  })
  res.json(responseObj(true,students,"All Students linked to parent"))
}

const selectStudent=async(req,res)=>{
  let user=await User.findOne({
    _id:req.body.student_id
  })
  const token = user.signJWT();
  res.json(responseObj(true,{
      access_token:token,
      user:user
      
  },"Token with Student Details Attached",null) )
}
const onBoarding=async(req,res)=>{

  console.log(req.user.user)
  let user=await User.findOne({
   email:req.user.user,
   
  })
  let hash=await bcrypt.hash(req.body.password, 10);
  if(!user){
user=await User.create({
  email:req.user.user,
  password:hash,
  role:'parent',
  name:req.body.name
})
  }
  if(user.role!=='parent'){
    return res.json(responseObj(false,null,"Email Already Exist for other User"))
  }
  let parent=await Parent.findOne({
    user_id:user._id
  })
  
  if(parent){
    return res.json(responseObj(false,null,"Profile Already Complete Please Sign in"))
  }
  parent=await Parent.create({
    user_id:user._id,
    preferred_name:req.body.name
    
    
        })
        const token = user.signJWT();
        addNotifications("65891c1d69765570ec7d213a","New Parent Onboarded","New Parent Onboarded of name "+ req.body.name)
        return res.json(responseObj(true,{
          access_token:token,
          user:user
          
      },"Onboarding Done Successfully"))

  

}
const onBoardingStudent=async(req,res)=>{
  let user=await User.findOne({
    email:req.user.user
    
   })
   if(user){
    return res.json(responseObj(false,null,"Profile Already Complete Please Sign in"))
   }
   let hash=await bcrypt.hash(req.body.password, 10);
 user=  await User.create({
     email:req.user.user,
     password:hash,
     role:'student',
     name:req.body.name

   })
   await AcademicManager.updateOne({
    user_id:"656d6dc49817c1eaebfff864"
  },{
    $push:{
       students:user._id
    }
  })
   let parent_user_id=await User.findOne({
    email:req.body.parent_email,
    role:"parent"
   })
   if(!parent_user_id){
    parent_user_id=await User.create({
    email:req.body.parent_email,
role:'parent'
   })
   }
   await Student.create({
    user_id:user._id,
    preferred_name:req.body.name,
    subjects:req.body.subjects.map((data)=>{return {name:data}}),
grade:{name:req.body.grade},
curriculum:{name:req.body.curriculum},
parent_id:parent_user_id._id
   })
   const token = user.signJWT();
   addNotifications("65891c1d69765570ec7d213a","New Student Onboarded","New Student Onboarded of name "+ req.body.name)
   return res.json(responseObj(true,{
    access_token:token,
    user:user
    
},"Onboarding Done Successfully"))
}
const editPhoto=async(req,res)=>{
  const userDetails=await User.findOne({
     _id:req.user._id
   })
  if(req.files?.photo>0){
     if(userDetails.profile_image){
        await  unlinkFile(userDetails.profile_image)
        }
        req.body.profile_image=await upload(req.files.photo)
       await User.updateMany({
         _id:req.user._id
       },{
         $set:{
          ...req.body
         }
       })

       const teacherResponse=await Student.findOne({
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

export {editPhoto,onBoardingStudent,onBoarding,selectStudent,getProfileDetails,editProfileDetails,getHomework,uploadHomework,subscribeToNewsLetter,getAllStudents}