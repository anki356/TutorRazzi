import AcademicManager from "../../../models/AcademicManager.js"
import Class from "../../../models/Class.js"
import HomeWork from "../../../models/HomeWork.js"
import Reference from "../../../models/Reference.js"
import ResourceRequest from "../../../models/ResourceRequest.js"
import Support from "../../../models/Support.js"
import { responseObj } from "../../../util/response.js"
const getTotalTrialRequests=async(req,res)=>{
    console.log(req.user._id)
const academicManagerResponse=await AcademicManager.findOne({user_id:req.user._id},{teachers:1,students:1})
const classResponse=await Class.countDocuments({
    student_id:{
        $in:[...academicManagerResponse.students],
        
    },
    teacher_id:{$in:[...academicManagerResponse.teachers]},
    class_type:"Trial",
    status:"Pending"
})
return res.json(responseObj(true,classResponse,"Total Trial Classes Requests "))
}

const getTotalRescheduledRequests= async(req,res)=>{
    const academicManagerResponse= await AcademicManager.findOne({user_id:req.user._id},{teachers:1,students:1})
    const classResponse=await Class.countDocuments({
        student_id:{
            $in:[...academicManagerResponse.students],
            
        },
        teacher_id:{$in:[...academicManagerResponse.teachers]},
       is_rescheduled:true,
       status:"Pending"
    })
    return   res.json(responseObj(true,classResponse,"Total Rescheduled Classes"))

}

const getTotalResourceRequests=async (req,res)=>{
    const academicManagerResponse= await AcademicManager.findOne({user_id:req.user._id},{teachers:1,students:1})
    const classResponse=await Class.find({
        student_id:{
            $in:[...academicManagerResponse.students],
            
        },
        teacher_id:{$in:[...academicManagerResponse.teachers]},
    })
    const resourceRequests=await ResourceRequest.countDocuments({class_id:{
        $in:classResponse.map((data)=>data._id)
    }})
    return  res.json(responseObj(true,resourceRequests,"Total Resource Requests"))
}

const getTotalPendingHomeworks=async (req,res)=>{
    const academicManagerResponse= await AcademicManager.findOne({user_id:req.user._id},{teachers:1,students:1})
    const classResponse=await Class.find({
        student_id:{
            $in:academicManagerResponse.students,
            
        },
        teacher_id:{$in:academicManagerResponse.teachers},
       
    })
   let homeworks=await HomeWork.countDocuments({
class_id:{
    $in:classResponse.map((data)=>data._id),

},status:{$in:["Pending"]}
})
    return  res.json(responseObj(true,homeworks,"Total Pending Homework"))
}
   
const getTotalPendingTickets=async(req,res)=>{
    const academicManagerResponse= await AcademicManager.findOne({user_id:req.user._id},{teachers:1})
    const ticketResponse = await Support.countDocuments({
user_id:{$in:academicManagerResponse.teachers}
    })
    return  res.json(responseObj(true,ticketResponse,"Total Pending Tickets"))
}

const getHomeworks=async(req,res)=>{
    const academicManagerResponse= await AcademicManager.findOne({user_id:req.user._id},{teachers:1,students:1})
    const classResponse=await Class.find({
        student_id:{
            $in:[...academicManagerResponse.students],
            
        },
        teacher_id:{$in:[...academicManagerResponse.teachers]},
       
    })
   let homeworks=await HomeWork.find({
class_id:{
    $in:classResponse.map((data)=>data._id)},
    status:{$in:["Resolved","ReUpload"]}
},

).populate({
    path:"answer_document_id"
})
    return  res.json(responseObj(true,homeworks,"Total Homework"))

}

const referSomeone=async(req,res)=>{
    await Reference.create({
        email:req.body.email
    })
    return res.json(responseObj(true,null,"Reference Added Successfully"))
}
export {referSomeone,getHomeworks,getTotalTrialRequests,getTotalRescheduledRequests,getTotalResourceRequests,getTotalPendingHomeworks,getTotalPendingTickets}