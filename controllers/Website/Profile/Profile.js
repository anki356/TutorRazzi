import User from "../../../models/User"
import Parent from "../../../models/Parent.js"
import Student from "../../../models/Student"
import { responseObj } from "../../../util/response"
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
export {getProfileDetails,editProfileDetails,getHomework,uploadHomework}