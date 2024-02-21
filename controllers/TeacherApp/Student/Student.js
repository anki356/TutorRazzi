import mongoose from "mongoose"
import Student from "../../../models/Student.js"
import { responseObj } from "../../../util/response.js"
import Class from "../../../models/Class.js"
import Quote from "../../../models/Quote.js"
import Exam from "../../../models/Exam.js"
import User from "../../../models/User.js"
const ObjectId=mongoose.Types.ObjectId
const getBasicDetails=async (req,res,next)=>{
    const studentResponse=await Student.findOne({user_id:new ObjectId(req.query.student_id) },{preferred_name:1,user_id:1,parent_id:1,grade:1,school:1,curriculum:1,subjects:1}).populate({path:'user_id',select:{
        email:1,mobile_number:1
    }}).populate({
        path:'parent_id',select:{
            email:1,mobile_number:1,_id:0
        }
    })
    if(studentResponse===null){
        throw new Error("Student Id is incorrect")
    }
    res.json(responseObj(true,studentResponse,null))
}
const getQuotes=async (req,res,next)=>{
    let options={
        limit:req.query.limit,
        page:req.query.page,
        select:{
            "class_count":1,"schedule_status":1,"subject_curriculum_grade.subject":1
        },
        populate:{
            path:"due_date_class_id",
            select:{
                "end_time":1
            }
        }
       
    }
   let query={
    student_id:req.query.student_id,
    status:"Paid"
   }
    Quote.paginate(query,options,(err,pendingClassQuotes)=>{
if(pendingClassQuotes.docs.length===0){
    res.json(responseObj(false,[],"No Class quotes found"))
   
}
            res.json(responseObj(true,pendingClassQuotes,null))
        })
    
}
const getScheduledClasses=async (req,res,next)=>{
    let options={
        limit:req.query.limit,
        page:req.query.page,
        populate:[{
            path:'student_id',
            select:{
                name:1
            }
        },{
            path:'teacher_id',
            select:{
                name:1
            } 
        }],
        select:{
            start_time:1,
            subject:1,
           

        },
        sort:{
            start_time:-1
        }
    }
let query={status:'Scheduled',
student_id:new ObjectId(req.query.student_id)}

if(req.query.search) {
    let student_ids=await User.find({
      name:{
        $regex: req.query.search, $options: 'i' 
      }
      })
      
    query["$or"] = [
     
      { "subject.name": { $regex: req.query.search, $options: 'i' } },
      {"name":  {$regex: req.query.search, $options: 'i' }
       
      },
      {"student_id":{
        $in:student_ids.map((data)=>data._id)
      }},
      
    ];
  }

    Class.paginate(query,options,(err,scheduledClasses)=>{
       
if(scheduledClasses.docs.length===0){
  return  res.json(responseObj(true,[],"No Classes Found"))
}

      return  res.json(responseObj(true,scheduledClasses,null))
    })
    
}
const getAllExams=async(req,res,next)=>{
    let query={
      student_id:req.query.student_id
    }
    if(req.query.name){
  query["subject.name"]={$regex:req.query.name,$options:"i"}
    }
    let options={
      limit:req.query.limit,
      page:req.query.page
    }
  Exam.paginate(query,options,(err,result)=>{
    if(result.docs.length===0){
     return   res.json(responseObj(false,[],"No Exams found"))

       
    }
    return res.json(responseObj(true,result,"Exams  are here"))
  })
    
   
  }
export {getBasicDetails,getQuotes,getScheduledClasses,getAllExams}