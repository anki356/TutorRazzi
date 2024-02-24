import moment from "moment"
import Class from "../../../models/Class.js"
import { responseObj } from "../../../util/response.js"
import Student from "../../../models/Student.js"
import User from "../../../models/User.js"
const getTotalStudents=async(req,res)=>{
    let classResponse=await Class.find({
        teacher_id:req.user._id,
        class_type:"Non-Trial"
    },{
        student_id:1
    })
    let query={
        user_id:{
            $in:classResponse.map((data)=>data.student_id)
        }
    }
    
    
    let totalStudents=await Student.countDocuments(query)
    res.json(responseObj(true,{"totalStudents":totalStudents},"Total Students"))

}
const getTotalUpcomingClasses=async(req,res)=>{

    let upComingClassesCount= await Class.countDocuments({start_time:{$gte:moment().format("YYYY-MM-DDTHH:mm:ss")},status:'Scheduled'})
    res.json(responseObj(true,{"upComingClassesCount":upComingClassesCount},"upComingClasses"))
}
const getTrialRequests=async(req,res)=>{
    const trialRequests=await Class.countDocuments({
        class_type:"Trial",
        teacher_id:req.user._id,
        status:'Pending'
            })
            res.json(responseObj(true,{"trialRequests":trialRequests},"No of Trials Requested are"))
}
const getAllStudents=async(req,res)=>{
    let classResponse=await Class.find({
        teacher_id:req.user._id,
        class_type:"Non-Trial"
    },{
        student_id:1
    })
    let query={
        user_id:{
            $in:classResponse.map((data)=>data.student_id)
        }
    }
    let options={
        limit:req.query.limit,
        page:req.query.page,
        select:{
            grade:1,
preferred_name:1,
user_id:1
        }
    }
    if(req.query.search){
        query["$or"]=[
            {
preferred_name:{
    $regex:req.query.search,
    $options:"i"
}
            },{
"grade.name":{
    $regex:req.query.search,
    $options:"i"
}
            }
        ]
    }
   Student.paginate(query,options,(err,allStudents)=>{
    return res.json(responseObj(true,allStudents,"All Students List"))
   })
   
}
const getStudentById=async(req,res)=>{
  let studentsDetails=  await Student.findOne({user_id:req.query.student_id},{grade:1,curriculum:1,preferred_name:1})
  let profile_photo=await User.findOne({
_id:req.query.student_id
  },{profile_image:1})
  let query={
    student_id:req.query.student_id,
    teacher_id:req.user._id,
    start_time:{
        $ne:null
    },
class_type:"Non-Trial"
  }
  let options={
    limit:req.query.limit,
    page:req.query.page,
    select:{
       "subject" :1,"details":1,"start_time":1,"end_time":1,"status":1,"is_rescheduled":1,"class_type":1
    }
  }
   Class.paginate(query,options,(err,classDetails)=>{

      return res.json(responseObj(true,{studentsDetails:studentsDetails,classDetails:classDetails,"profile_image":profile_photo?.profile_image_url},"Student Details"))
  })

}

export {getTotalStudents,getTrialRequests,getTotalUpcomingClasses,getAllStudents,getStudentById}