import AcademicManager from "../../../models/AcademicManager.js"
import User from "../../../models/User.js"

const getProfileDetails=async(req,res)=>{
    let user_id=req.user._id
    let userDetails=await User.findOne({_id:user_id})
    let profileDetails=null
profileDetails=await AcademicManager.findOne({
    user_id:req.user._id
})
return res.json(responseObj(true,{userDetails:userDetails,profileDetails:profileDetails},"User profile Details"))
}

const editProfileDetails=async(req,res)=>{
const userDetails=await User.findOneAndUpdate({
    _id:req.user._id
},{
    $set:{...req.body}
})
if(req.files?.length>0){
unlinkFile(userDetails.profile_image)
  await User.updateMany({
    _id:req.user._id
  },{
    $set:{
      profile_image:req.files[0].filename
    }
  })
}
await AcademicManager.updateOne({
user_id:req.user._id
},{
    $set:{
        preferred_name:req.body.name,...req.body
    }
})
res.json(responseObj(true,null,"profile Edited Successfully"))
}
export {getProfileDetails,editProfileDetails}