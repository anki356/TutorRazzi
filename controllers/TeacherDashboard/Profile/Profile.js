import Teacher from "../../../models/Teacher.js"
import Testimonial from "../../../models/Testimonial.js"
import User from "../../../models/User.js"
import { responseObj } from "../../../util/response.js"

const getUserProfile=async(req,res)=>{
    const userDetails=await Teacher.findOne({
        user_id:req.user._id
    }).populate({
        path:"user_id"
    })
    const testimonialResponse=await Testimonial.find({teacher_id:req.user._id})
    return res.json(responseObj(true,{userDetails:userDetails,testimonialResponse:testimonialResponse},"User Details"))
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

export {getUserProfile,editProfile}
