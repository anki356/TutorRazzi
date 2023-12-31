import Class from "../../../models/Class.js"
import ResourceRequest from "../../../models/ResourceRequest.js"

import Attendance from "../../../models/Attendance.js"
import { responseObj } from "../../../util/response.js"
import mongoose from "mongoose"
import sendEmail from "../../../util/sendEmail.js"
const ObjectID=mongoose.Types.ObjectId
import { Marked, options } from "marked"
import Quote from "../../../models/Quote.js"
import moment from 'moment-timezone'
import Parent from "../../../models/Parent.js"
import Student from "../../../models/Student.js"
import Teacher from "../../../models/Teacher.js"
import Review from "../../../models/Review.js"
import { newResourceRequested } from "../../../util/EmailFormats/newResourceRequested.js"
import { adminNewResourceRequest } from "../../../util/EmailFormats/adminNewResourceRequest.js"
import HomeWork from "../../../models/HomeWork.js"
import Task from "../../../models/Task.js"
import ExtraClassRequest from "../../../models/ExtraClassRequest.js"
import Reminder from "../../../models/Reminder.js"
const requestTrialClass = async (req, res, next) => {
   
    let classResponseArray = []
    let classResponse = await Class.findOne({
        student_id: req.body.student_id,
        "subject.name": req.body.subject ,
        status: 'Done'
    })
   
    if (classResponse) {
        throw new Error("Subject Trial Class already done")




    }

    await req.body.start_time.forEach(async (element) => {
        let newClassResponse = await Class.insertMany({
            teacher_id: req.body.teacher_id,
            student_id: req.body.student_id,
            start_time: moment(element).format("YYYY-MM-DDTHH:mm:ss"),
            end_time: moment(element).add(1, 'h').format("YYYY-MM-DDTHH:mm:ss"),
            subject: { name: req.body.subject },
            curriculum: { name: req.body.curriculum },
            grade: { name: req.body.grade },
            class_type: "Trial",
            status: "Pending",
            is_rescheduled: false,
            details: req.body.details ? req.body.details : null
        })
        classResponseArray.push(newClassResponse)



    });
    res.json(responseObj(true, classResponseArray, "Trial Class request created Successfully"))




}
const getClassDetails=async(req,res,next)=>{
    let classDetails={}
    classDetails=await Class.findOne({_id:new ObjectID(req.query.class_id)},{start_time:1,end_time:1,details:1,grade:1,subject:1,teacher_id:1,notes:1,tasks:1,materials:1}).populate({path:'teacher_id',select:{
      name:1
    }})
   const exp=await Teacher.findOne({user_id:classDetails.teacher_id},{exp:1})
const reviews=await Review.findOne({teacher_id:classDetails.teacher_id}).countDocuments()
  const ratingsResponse=await Review.aggregate([
    {
        $match:{
            teacher_id:classDetails.teacher_id
        }
    },{
        $group:{
            _id:null,
            average_rating:{$avg:"$rating"}
        }
    }
  ])  
  const homework=await HomeWork.find({class_id:req.query.class_id})
  const task=await Task.find({class_id:req.query.classScheduled})
  let classReview=await Review.findOne({
    class_id:req.query.class_id,
    given_by:req.user._id
  })
  let teacherReview=await Review.findOne({
    class_id:req.query.class_id,
    given_by:req.user._id,
    teacher_id:classDetails.teacher_id
  })
return res.json(responseObj(true,{classDetails:classDetails,exp:exp,ratingsResponse:ratingsResponse,reviews:reviews,homework:homework,Task:task,classReview:classReview,teacherReview:teacherReview},null))
}
const rescheduleClass=async(req,res,next)=>{
    
    let classScheduled=await Class.find({$and:[{
        start_time:req.body.start_time,
    },{$or:[{
        teacher_id:req.body.teacher_id
    },{
        student_id:req.body.student_id
    }]}]})
        if(classScheduled.length!==0){
            throw new Error('This time slot has been already scheduled')
        }
        
        const rescheduleClassResponse=await Class.updateOne({_id:new ObjectID(req.params.id)},{$set:{
            is_rescheduled:true,
            start_time:moment(req.body.start_time).format("YYYY-MM-DDTHH:mm:ss"),
            end_time:moment(req.body.start_time).add(1,'h').format("YYYY-MM-DDTHH:mm:ss"),
            rescheduled_by:req.user._id,
            status:'Pending'
            }})
         return   res.json(responseObj(true,rescheduleClassResponse,null))

}
const reviewClass=async(req,res,next)=>{
    const reviewResponse=await Review.insertMany({
        class_id:req.body.class_id,
        message:req.body?.message,
        rating:req.body.rating,
        given_by:req.user._id
    })
   
    return res.json(responseObj(true,reviewResponse,null))
}
const getClassesBasedOnDate=async (req,res)=>{
    const start_time=moment(req.body.date).startOf('day')
    const end_time=moment(req.body.date).endOf('day')
    const classes=await Class.find({
      start_time:{$gte :start_time},
      end_time:{$lte:end_time},
      student_id:req.query.student_id
    })
    return res.json(responseObj(true,classes,null)) 
  }
const raiseRequestResource=async(req,res,next)=>{

    let resourcerequestcount=await ResourceRequest.countDocuments()
   
    let response=await ResourceRequest.insertMany({
        request_id:resourcerequestcount+1,
        message:req.body.message,
        class_id:req.body.class_id,
       
    })
    const classResponse=await Class.findOne({_id:req.body.class_id},{teacher_id:1,subject:1,curriculum:1,grade:1}).populate({path:'teacher_id',select:{
        name:1
    }})
   
    
   const htmlContent = newResourceRequested(req.user.name, resourcerequestcount)
  
       sendEmail(req.user.email, "Resource Reqested", htmlContent, null)
   

console.log(req.user,classResponse)
   const adminHtmlContent = adminNewResourceRequest(req.user.name, req.body.message, classResponse)
   sendEmail("anki356@gmail.com", "Resource Reqested", adminHtmlContent, null)
   res.json(responseObj(true, response, "Resource Requested Successfully"))

}
const getExtraClassQuotes=async (req,res,next)=>{
    
    const quoteResponse=await Quote.find({
        student_id:req.query.student_id,
        class_type:'Extra'
    })
    
    res.json(responseObj(true,quoteResponse,null))
}
const getClassQuotes=async(req,res,next)=>{
    
    let Quotes=await Quote.find({student_id:req.query.student_id,status:'Pending'}).populate({
        path:"teacher_id",
select:{
    "name":1
}})
    res.json(responseObj(true,Quotes,null))
}
const joinClass=async (req,res,next)=>{
    
    let classResponse;
    classResponse=await Class.updateOne({
        _id : req.body.class_id},{

$set:{
    status:'Done'
}
    })
    let attendanceResponse=await Attendance.insertMany({
        check_in_datetime:moment().format("YYYY-MM-DDTHH:mm:ss"),
        parent_id:req.user._id,
        class_id:req.body.class_id,
        
    })
    res.json(responseObj(true,attendanceResponse,null))

}
const getPurchasedClasses=async(req,res,next)=>{
   
    let query={student_id:req.query.student_id}
    if(req.query.search){
        query={
            $and:[
                {student_id:req.body.student_id},
                {$or: [
                    { "subject.name":{
                      
                       $regex:req.query.search,
                       $options:'i'
                     }}
                   , { "curriculum.name":{
                      
                    $regex:req.query.search,
                    $options:'i'
                  }},
                  { "grade.name":{
                      
                    $regex:req.query.search,
                    $options:'i'
                  }}
                
             
             
                   ]  }
            ]
        }

    }
    let options={
        limit:Number(req.query.limit),
        page:Number(req.query.page),
        select:[
            "subject_curriculum_grade","teacher_id","class_count","class_type","schedule_status"
        ],
        populate:{
            path:'teacher_id',
            select:{
                name:1
            }
        }
            
        }
        await Quote.paginate(query,options).then((results)=>{
    
            res.json(responseObj(true,results,null))
        })
    }
    // const clearReminder=async(req,res,next)=>{
    //     const reminderResponse=await Reminder.deleteOne({class_id:new ObjectId(req.body.class_id)})
    //     res.json(responseObj(true,reminderResponse,null))
    // }
    const setReminder=async(req,res,next)=>{
        const reminderResponse=await Reminder.insertMany({
            class_id:req.body.class_id,
            user_id:req.user._id
        })
        res.json(responseObj(true,reminderResponse,null))
    }
    const getPurchasedClassesByQuoteId=async(req,res,next)=>{
        let options={
            limit:Number(req.query.limit),
            page:Number(req.query.page),
            select:[
    
                "subject" ,"start_time","status","teacher_id"
            ],
            populate:{
                path:"teacher_id",
                select:{
                    name:1
                }
            }
            
        }
        Class.paginate({quote_id:new ObjectID(req.query._id)},options).then((result,err)=>{
    
            res.json(responseObj(true,result,null))
        })
    }
const leaveClass=async (req,res,next)=>{
   
    let response = await Attendance.findOneAndUpdate({
        class_id : req.body.class_id,
        parent_id:req.user._id 
    },{
        $set:{
            check_out_datetime:moment().format("YYYY-MM-DDTHH:mm:ss")        }
    })
    let classResponse=await Class.updateOne({
        _id:req.body.class_id
    },{
        $set:{
            end_time:moment().format("YYYY-MM-DDTHH:mm:ss"),
            status:"Done"
    }})
      return   res.json(responseObj(true, {response,classResponse}, "Class Left"))
   
}
const scheduleClass=async(req,res,next)=>{
    
    let classScheduled=await Class.find({$and:[{
        start_time:req.body.start_time,
    },{$or:[{
        teacher_id:req.body.teacher_id
    },{
        student_id:req.body.student_id
    }]},{
        status:"Scheduled"
    }]})
        if(classScheduled.length!==0){
throw new Error("This time slot has been already scheduled")
          
        }

const scheduleClassResponse=await Class.updateOne({_id:req.params.id},{$set:{
                
    start_time:req.body.start_time,
    end_time:moment(req.body.start_time).add(1,'h').format("YYYY-MM-DDTHH:mm:ss"),
    status:'Scheduled'
    }})
    let purchased_classes=await Class.find({quote_id:new ObjectID(req.body.quote_id)},{status:1})
    let statusArray=purchased_classes.map((data)=>{
        return data.status
    })
  
    if(!statusArray.includes('pending')){
        await Quote.findByIdAndUpdate(req.body.quote_id,{
            $set:{
                schedule_status:'done'
            }
        })
    }
   return res.json(responseObj(true,scheduleClassResponse,null))
   

}
const requestExtraclass=async (req,res,next)=>{
    
    const extraClassRequestResponse=await ExtraClassRequest.insertMany({
     quote_id:req.body.quote_id,
     message:req.body.message,
     
 
    }) 
    res.json(responseObj(true,extraClassRequestResponse,null))
 }
 const acceptRescheduledClass=async(req,res,next)=>{
    
    let classDetails= await Class.find({$and:[{
        start_time:req.body.start_time,
    },{$or:[{
        teacher_id:req.body.teacher_id
    },{
        student_id:req.body.student_id
    
    }]}]})
   if(classDetails.length!==0){
throw new Error("Slot Already Booked")
}
let classResponse=await Class.findOne(
    {_id:new ObjectID(req.params._id)},
    {
      rescheduled_by:req.body.student_id
    }
   )
   if(classResponse){
    throw new Error("You can't Accept your own Reschedule request.")
   }
let rescheduleacceptResponse=await Class.findOneAndUpdate({_id:new ObjectID(req.params._id)},{
    $set:{
        status:'Scheduled'
    }
});
res.json(responseObj(true,rescheduleacceptResponse,null))
}
const getLastTrialClass = async (req, res, next) => {
   
    const lastClassResponse = await Attendance.findOne({ student_id: req.query.student_id }).populate({'path':'class_id',select:{
        start_time:1,subject:1,teacher_id:1,
    },populate:{
        path:"teacher_id",
        select:{
        "name":1
        }
    },match:{
        class_type:"Trial"
    }}).sort({ _id: -1 })
    
    if(lastClassResponse!==null){

        const TrialResponse=await Class.findOne({
            _id:lastClassResponse.class_id,
            response:{
                $ne : null
            }
        })
       
        if(TrialResponse!==null){
            return res.json(responseObj(true,null,"Trial Class already responded"))
        }
        
        res.json(responseObj(true, lastClassResponse.class_id, 'Last trial class details are fetched successfully'))
    }
    else{
        return res.json(responseObj(true,null,"No Trial Class"))
    }
    


}
const dislikeClass = async (req, res, next) => {




    const dislikeResponse = await Class.updateOne({_id:req.body.class_id},{$set:{
      
        response: "Disliked",
        reason_disliking: req.body.reason
    }})
    res.json(responseObj(true, [], " Dislike Response saved Successfully", []))



}

const likeClass = async (req, res, next) => {
    const likeResponse = await Class.updateOne({_id:req.body.class_id},{$set:{
      
        response: "Liked",
    }})
    res.json(responseObj(true, [], "Like Response Saved Successful"))
}

const getUpcomingClassDetails=async(req,res)=>{
    let classDetails = {}
    classDetails = await Class.findOne({ _id: req.query.class_id }, { start_time: 1, end_time: 1, details: 1, grade: 1, subject_id: 1, teacher_id: 1, notes: 1 }).populate({
      path: 'teacher_id', select: {
       name: 1,profile_image:1
      }
    }).populate({
      path: 'student_id', select: {
        name: 1,mobile_number:1,profile_image:1
      }
    })
    let studentDetails=await Student.findOne({user_id:classDetails.student_id},{
      grade:1,
      curriculum:1,
      school:1
    })
    let teacherDetails=await Teacher.findOne({user_id:classDetails.teacher_id},{
      qualification:1,
  
    })
   
    
    let reminderResponse = await Reminder.findOne({ class_id:req.query.class_id })
    res.json(responseObj(true, { classDetails: classDetails, reminderResponse: reminderResponse,studentDetails:studentDetails,teacherDetails:teacherDetails }, null))
  }

export {getUpcomingClassDetails,likeClass,dislikeClass,getLastTrialClass,getClassesBasedOnDate,acceptRescheduledClass,requestExtraclass,getExtraClassQuotes,requestTrialClass,scheduleClass,setReminder,getPurchasedClassesByQuoteId,getClassDetails,rescheduleClass,reviewClass,raiseRequestResource,getClassQuotes,joinClass,leaveClass,getPurchasedClasses,}