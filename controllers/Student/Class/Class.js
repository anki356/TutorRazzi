import Class from "../../../models/Class.js"
import ResourceRequest from "../../../models/ResourceRequest.js"
import Review from "../../../models/Review.js"
import Attendance from "../../../models/Attendance.js"
import { responseObj } from "../../../util/response.js"
import mongoose from "mongoose"
import sendEmail from "../../../util/sendEmail.js"
const ObjectID = mongoose.Types.ObjectId
import { marked } from "marked"
import Quote from "../../../models/Quote.js"
import moment from "moment-timezone"
import ExtraClassRequest from "../../../models/ExtraClassRequest.js"
import Document from "../../../models/Document.js"
import jwt from 'jsonwebtoken'
import Student from "../../../models/Student.js"
import { newResourceRequested } from "../../../util/EmailFormats/newResourceRequested.js"
import { adminNewResourceRequest } from "../../../util/EmailFormats/adminNewResourceRequest.js"
import unlinkFile from "../../../util/unlinkFile.js"
import HomeWork from "../../../models/HomeWork.js"
import Teacher from "../../../models/Teacher.js"
import Task from "../../../models/Task.js"
import Reminder from "../../../models/Reminder.js"
import { addNotifications } from "../../../util/addNotification.js"
import User from "../../../models/User.js"
import Report from "../../../models/Report.js"
import AcademicManager from "../../../models/AcademicManager.js"
import axios from "axios"
import MonthlyReport from "../../../models/MonthlyReport.js"
import upload from "../../../util/upload.js"
const dislikeClass = async (req, res, next) => {


let dislikeResponse=await Class.findOne({
    _id:req.body.class_id
},{
    response:1
})
if (dislikeResponse.response){
    return res.json(responseObj(false,null,"Class Response Already marked"))
}
    dislikeResponse = await Class.findOneAndUpdate({_id:req.body.class_id},{$set:{
      
        response: "Disliked",
        reason_disliking: req.body.reason
    }})
    const AcademicManangerResponse=await AcademicManager.findOne({
        students:{
             $elemMatch: {
            $eq: req.user._id
        }
        }
    })
    const teacherResponse=await Teacher.findOne({
        user_id:dislikeResponse.teacher_id
    })
    addNotifications(dislikeResponse.teacher_id,"Class has been disliked"," Class has been disliked by "+req.user.name+" for subject "+dislikeResponse.subject+" on "+ moment(dislikeResponse.start_time).format("DD-MM-YYYY")+ "at "+moment(dislikeResponse.start_time).format("HH:mm" ))
    addNotifications(AcademicManangerResponse.user_id,"Class has been disliked"," Class has been disliked by "+req.user.name+"by teacher"+teacherResponse.preferred_name  +" for subject "+dislikeResponse.subject+" on "+ moment(dislikeResponse.start_time).format("DD-MM-YYYY")+ "at "+moment(dislikeResponse.start_time).format("HH:mm" ))
    res.json(responseObj(true, [], " Dislike Response saved Successfully", []))



}

const likeClass = async (req, res, next) => {
    let dislikeResponse=await Class.findOne({
        _id:req.body.class_id
    },{
        response:1
    })
    if (dislikeResponse.response){
        return res.json(responseObj(false,null,"Class Response Already marked"))
    }
    const likeResponse = await Class.findOneAndUpdate({_id:req.body.class_id},{$set:{
      
        response: "Liked",
    }})
    const AcademicManangerResponse=await AcademicManager.findOne({
        students:{
             $elemMatch: {
            $eq: req.user._id
        }
        }
    })
    const teacherResponse=await Teacher.findOne({
        user_id:likeResponse.teacher_id
    })
    addNotifications(likeResponse.teacher_id,"Class has been Liked"," Class has been Liked by "+req.user.name+" for subject "+likeResponse.subject+" on "+ moment(likeResponse.start_time).format("DD-MM-YYYY")+ "at "+moment(likeResponse.start_time).format("HH:mm" ))
    res.json(responseObj(true, [], "Like Response Saved Successful"))
    addNotifications(AcademicManangerResponse.user_id,"Class has been Liked"," Class has been Liked by "+req.user.name+"by teacher"+teacherResponse.preferred_name  +" for subject "+likeResponse.subject+" on "+ moment(likeResponse.start_time).format("DD-MM-YYYY")+ "at "+moment(likeResponse.start_time).format("HH:mm" ))
}

const requestExtraclass = async (req, res, next) => {
   
    const extraClassRequestResponse = await ExtraClassRequest.insertMany({
        quote_id: req.body.quote_id,
        message: req.body.message,

    })
    res.json(responseObj(true, extraClassRequestResponse, "Request for Extra Class Created Successfully"))
    const AcademicManangerResponse=await AcademicManager.findOne({
        students:{
             $elemMatch: {
            $eq: req.user._id
        }
        }
    })
    addNotifications(AcademicManangerResponse.user_id,"New Extra Class Request","New Extra Class request has arrived by"+ req.user.name)
}

const requestTrialClass = async (req, res, next) => {
    const AcademicManangerResponse=await AcademicManager.findOne({
        students:{
             $elemMatch: {
            $eq: req.user._id
        }
        }
    })
    if(AcademicManangerResponse!==null){

    
    let classResponseArray = []
    let classResponse = await Class.findOne({
        student_id: req.user._id,
        "subject.name": req.body.subject ,
        
    })
    let studentResponse=await Student.findOne({
        user_id:req.user._id
    })
    if (classResponse) {
        throw new Error("Subject Trial Class already Requested or Done")




    }
    

    await req.body.start_time.forEach(async (element) => {
       if(moment().add(5,'h').add(30,'s').diff(element,'s')>0){
        return res.json(responseObj(false,null,"Start Time cannot be in past"))
       }
        let classScheduled=await Class.find({
            $and: [   { start_time:{$gte:element}},
              {start_time:{
                $lte:moment(element).add(1,'h').format("YYYY-MM-DDTHH:mm:ss")
              }},
              {end_time:{$gte:element}},
              {end_time:{
                $lte:moment(element).add(1,'h').format("YYYY-MM-DDTHH:mm:ss")
              }},{$or:[{
              teacher_id:req.body.teacher_id
          },{
              student_id:req.user._id
          }]}]})
        
              if(classScheduled.length!==0){
               throw new Error('This time slot has been already scheduled')  
              }
        
      



    });
    let newClassResponse = await Class.create({
        teacher_id: req.body.teacher_id,
        student_id: req.user._id,
       
        subject: { name: req.body.subject },
        curriculum: { name: req.body.curriculum },
        grade: { name: studentResponse.grade.name },
        class_type: "Trial",
        status: "Pending",
        is_rescheduled: false,
        details: req.body.details ? req.body.details : null,
        slots:req.body.start_time
    })

    const teacherResponse=await Teacher.findOne({
        user_id:req.body.teacher_id
    })
    addNotifications(AcademicManangerResponse.user_id,"New Trial Class Requested","New Trial Class Requested By "+ req.user.name+" by teacher "+teacherResponse.preferred_name+" of subject "+req.body.subject)
    addNotifications(req.body.teacher_id,"New Trial Class Requested","New Trial Class Requested By "+ req.user.name+" of subject "+req.body.subject)
    res.json(responseObj(true, newClassResponse, "Trial Class request created Successfully"))
    }else{
        return res.json(responseObj(false, null,"Academic Manager is not assigned to you"))
    }



} 




const getClassDetails = async (req, res, next) => {
    let classDetails = {}
    classDetails = await Class.findOne({ _id: req.query.class_id ,end_time:{
      $lte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
    }}, { teacher_id:1,start_time: 1, end_time: 1, details: 1, grade: 1, subject: 1, notes: 1,  materials: 1,student_id:1  }).populate({
        path: 'teacher_id', select: {
            profile_image: 1, name: 1
        }
    })
    if(!classDetails){
      return res.json(responseObj(false,null,"Incorrect Class"))
    }
//  let teacherResponse=await Teacher.findOne({
//     user_id:classDetails.teacher_id
//  },{
//     exp:1,
//     qualification:1
//  }) 
 const parentDetails=await Student.findOne({
  user_id:classDetails.student_id
 },{
  parent_id:1
 })
 let classRatingsResponse=await Review.findOne({
  class_id:req.query.class_id,
  given_by:classDetails.student_id,
  teacher_id:null
})
let teacherRatings=await Review.findOne({
class_id:req.query.class_id,
given_by:classDetails.student_id,
teacher_id:classDetails.teacher_id
})
let homeworkResponse=await HomeWork.find({
    class_id:req.query.class_id
}).populate({
  path:"answer_document_id"
}).limit(3)
let taskResponse=await Task.find({
    class_id:req.query.class_id
}).limit(3)


    res.json(responseObj(true, {classDetails:classDetails,ratingsResponse:classRatingsResponse?classRatingsResponse.rating:null,teacherRatings:teacherRatings?teacherRatings.rating:null,homeworkResponse,taskResponse}, "Class Details successfully fetched"))
}

const scheduleClass = async (req, res, next) => {
    if(moment().add(5,'h').add(30,'s').diff(req.body.start_time,'s')>0){
        return res.json(responseObj(false,null,"Start Time cannot be in past"))
       }
       let details=await Class.findOne({
        _id:req.params._id
      })
    let classScheduled=await Class.find({
        $and: [   { start_time:{$gte:req.body.start_time}},
          {start_time:{
            $lte:moment(req.body.start_time).add(1,'h').format("YYYY-MM-DDTHH:mm:ss")
          }},
          {end_time:{$gte:req.body.start_time}},
          {end_time:{
            $lte:moment(req.body.start_time).add(1,'h').format("YYYY-MM-DDTHH:mm:ss")
          }},{$or:[{
          teacher_id:details.teacher_id
      },{
          student_id:req.user._id
      }]}]})
    if (classScheduled.length !== 0) {
        throw new Error('This time slot has been already scheduled')
    }

    const scheduleClassResponse = await Class.findOneAndUpdate({ _id:req.params._id ,status:"Pending"}, {
        $set: {

            start_time: req.body.start_time,
            end_time: moment(req.body.start_time).add(1, 'h').format("YYYY-MM-DDTHH:mm:ss"),
            status: 'Scheduled'
        }
    })
    let purchased_classes = await Class.find({ quote_id: scheduleClassResponse.quote_id }, { status: 1 })
    let statusArray = purchased_classes.map((data) => {
        return data.status
    })

    if (!statusArray.includes('pending')) {
        await Quote.findByIdAndUpdate(scheduleClassResponse.quote_id, {
            $set: {
                schedule_status: 'done',
                due_date_class_id:req.params._id
            }
        })
    }
    const AcademicManangerResponse=await AcademicManager.findOne({
        students:{
             $elemMatch: {
            $eq: req.user._id
        }
        }
    })
    const teacherResponse=await Teacher.findOne({
        user_id:scheduleClassResponse.teacher_id
    })
    addNotifications(scheduleClassResponse.teacher_id,"Class Scheduled Successfully","Class has been scheduled for student "+req.user.name+" on "+moment(req.body.start_time).format("DD-MM-YYYY")+ " at "+moment(req.body.start_time).format("HH:mm" ))
    addNotifications(AcademicManangerResponse.user_id,"Class Scheduled Successfully","Class has been scheduled for student "+req.user.name+" on "+moment(req.body.start_time).format("DD-MM-YYYY")+ " at "+moment(req.body.start_time).format("HH:mm" )+" by teacher"+ teacherResponse.preferred_name)
    res.json(responseObj(true, scheduleClassResponse, "Class Scheduled Successfully"))



}

const rescheduleClass=async(req,res,next)=>{
    if(moment().add(5,'h').add(30,'s').diff(req.body.start_time,'s')>0){
      return res.json(responseObj(false,null,"Start Time cannot be in past"))
     }
    let details=await Class.findOne({
      _id:req.params._id
    })
    let classScheduled=await Class.find({
      $and: [   { start_time:{$gte:req.body.start_time}},
        {start_time:{
          $lte:moment(req.body.start_time).add(1,'h').format("YYYY-MM-DDTHH:mm:ss")
        }},
        {end_time:{$gte:req.body.start_time}},
        {end_time:{
          $lte:moment(req.body.start_time).add(1,'h').format("YYYY-MM-DDTHH:mm:ss")
        }},{$or:[{
        teacher_id:details.teacher_id
    },{
        student_id:req.user._id
    }]}]})

        if(classScheduled.length!==0){
         throw new Error('This time slot has been already scheduled')  
        }
  
  const rescheduleClassResponse=await Class.findOneAndUpdate({_id:req.params._id},{$set:{
    is_rescheduled:true,
    start_time:moment(req.body.start_time).format("YYYY-MM-DDTHH:mm:ss"),
    end_time:moment(req.body.start_time).add(1,'h').format("YYYY-MM-DDTHH:mm:ss"),
    rescheduled_by:'student',
    status:'Pending'
    }})
    const AcademicManangerResponse=await AcademicManager.findOne({
      students:{
           $elemMatch: {
            $eq: req.user._id
        }
      }
  })
    addNotifications(rescheduleClassResponse.teacher_id,"Class Rescheduled","Class of "+details.subject.name+" which was earlier scheduled  on "+moment(details.start_time).format("DD-MM-YYYY")+" at time "+moment(details.start_time).format("HH:mm:ss")+ " has been rescheduled  on "+moment(req.body.start_time).format("DD-MM-YYYY")+" at time "+moment(req.body.start_time).format("HH:mm:ss")+" by student "+req.user.name )
    addNotifications(AcademicManangerResponse.user_id,"Class Rescheduled","Class of "+details.subject.name+" which was earlier scheduled  on "+moment(details.start_time).format("DD-MM-YYYY")+" at time "+moment(details.start_time).format("HH:mm:ss")+ " has been rescheduled  on "+moment(req.body.start_time).format("DD-MM-YYYY")+" at time "+moment(req.body.start_time).format("HH:mm:ss")+" by student "+req.user.name )
    res.json(responseObj(true,null,"Rescheduled"))
  
  }

  const reviewClass = async (req, res, next) => {
    let classDetails=await Class.findOne({
      _id : req.body.class_id
    })
    if(classDetails===null){
      throw new Error("Incorrect Class ID")
    }
    let reviewResponse=await Review.findOne({
      class_id:req.body.class_id,
      given_by:req.user._id
    })
  
    if(reviewResponse===null){
      reviewResponse = await Review.insertMany({
        class_id: req.body.class_id,
        message: req.body?.message,
        rating: req.body.ratings,
        given_by:req.user._id
    })
    }
    else{
      return res.json(responseObj(false,null,"You have already reviewed"))
    }
  
    const AcademicManangerResponse=await AcademicManager.findOne({
      students:{
           $elemMatch: {
            $eq: req.user._id
        }
      }
  })
  
 
    // addNotifications(AcademicManangerResponse.user_id,"Task Added", "A Task has been added by "+req.user.name+" of title"+ req.body.title)
    
   addNotifications(AcademicManangerResponse.user_id,"A Class Reviewed","A class of "+classDetails.subject.name+" Reviewed as "+ req.body.ratings+ "by "+req.user.name )
   addNotifications(classDetails.teacher_id, "A Class Reviewed","A class of "+classDetails.subject.name+" Reviewed as "+ req.body.ratings+ "by "+req.user.name)
    res.json(responseObj(true, reviewResponse, "Review Created Successfully"))
}
const reviewTeacher = async (req, res, next) => {
    let classDetails=await Class.findOne({
        _id : req.body.class_id
      })
      if(classDetails===null){
        throw new Error("Incorrect Class ID")
      }
    let reviewResponse=await Review.findOne({
      class_id:req.body.class_id,
      given_by:req.user._id,
      teacher_id:req.body.teacher_id
    })
    if(!reviewResponse){
      reviewResponse = await Review.insertMany({
        message: req.body.message?req.body.message:null,
        rating: req.body.ratings,
        teacher_id: req.body.teacher_id,
        class_id: req.body.class_id,
        given_by:req.user._id
    })
    }
    else{
     return res.json(responseObj(false,null,"You have already reviewed"))
    }
     
    addNotifications(classDetails.teacher_id, "You are  Reviewed","You are reviewed for class of "+classDetails.subject.name+" Reviewed as "+ req.body.ratings+ "by "+req.user.name)
    return res.json(responseObj(true,reviewResponse,"Teacher Review Recorded"))
    
  
  }
const raiseRequestResource = async (req, res, next) => {
   
    let resourcerequestcount = await ResourceRequest.countDocuments()
    let response = await ResourceRequest.insertMany({
        request_id: resourcerequestcount + 1,
        message: req.body.message,
        class_id: req.body.class_id,
      
    })
    const classResponse = await Class.findOne({ _id: req.body.class_id }, { teacher_id: 1, subject: 1, curriculum: 1, grade: 1,name:1 }).populate({
        path: 'teacher_id', select: {
            name: 1
        }
    })


    const htmlContent = newResourceRequested(req.user.name, resourcerequestcount)
    
        sendEmail(req.user.email, "Resource Reqested", htmlContent, null)
    
const teacherResponse=await User.findOne({
    _id:classResponse.teacher_id
})

    const adminHtmlContent = adminNewResourceRequest(req.user.name, req.body.message, classResponse)
    sendEmail(teacherResponse.email, "Resource Reqested", adminHtmlContent, null)
    let class_name=classResponse.name!==null&&classResponse.name!==undefined?classResponse.name:classResponse.subject.name+" of " +classResponse.grade.name

    const AcademicManangerResponse=await AcademicManager.findOne({
        students:{
             $elemMatch: {
            $eq: req.user._id
        }
        }
    })
    addNotifications(teacherResponse._id,"Resource Requested ",`${req.user.name} has requested resources for your Class ${class_name}`
    )
addNotifications(AcademicManangerResponse.user_id,"Resource Requested ",`${req.user.name} has requested resources for your Class ${class_name}`,)
    res.json(responseObj(true, response, "Resource Requested Successfully"))


}

const joinClass = async (req, res, next) => {
    let classResponse = await Class.findOne({
        _id: req.body.class_id,
        // student_id:req.user._id,
        // status:"Scheduled",
       
    },  {
      start_time: 1,
      end_time: 1,
      student_id:1,
      subject:1,
      meeting_id:1,
      teacher_id:1,
      status:1
  })
  if(classResponse===null){
  return res.json(responseObj(false,null,"Invalid Class"))
  }
  classResponse = await Class.findOne({
  _id: req.body.class_id,
  student_id:req.user._id,
  // status:"Scheduled"
  }, {
  start_time: 1,
  end_time: 1,
  student_id:1,
  subject:1,
  meeting_id:1,
  teacher_id:1,
  status:1
  })
  if(classResponse===null){
  return res.json(responseObj(false,null,"Invalid Student Id"))
  }
  if(classResponse.status!=="Scheduled"){
  return res.json(responseObj(false,null,"Class Status is "+classResponse.status))
  }
  if ((moment().utc().isBefore(moment.utc(classResponse.start_time,"YYYY-MM-DDTHH:mm:ss").subtract(5,'h').subtract(30,'m')))) {      throw new Error('Class has not Started Yet')
  }
  if ((moment().utc().isAfter(moment.utc(classResponse.end_time,"YYYY-MM-DDTHH:mm:ss").subtract(5,'h').subtract(30,'m')))) {      throw new Error('Class has been Finished')
  }
  
   
   let reportResponse=await MonthlyReport.findOne({
        student_id:req.user._id,
        teacher_id:classResponse.teacher_id,
        month:moment().month(),
        year:moment().year(),
        subject:classResponse.subject.name
   })
  let attendanceResponse=await Attendance.findOne({
    teacher_id:classResponse.teacher_id,
    class_id:req.body.class_id
   })
  
   if(reportResponse===null&&attendanceResponse!==null){
  
    const   MonthlyReportResponse=await MonthlyReport.create({
        student_id:req.user._id,
        teacher_id:classResponse.teacher_id,
        month:moment().month(),
        year:moment().year(),
        subject:classResponse.subject.name, 
        reports:[{
  
  title:"Academic Performance",
  sub_title:"Subject Knowledge and Understanding",
  
  
  
  
  
    },{
        title:"Academic Performance",
        sub_title:"Class Participation and Engagement",
        
       
        
    },{
        title:"Academic Performance",
        sub_title:"Homework and Assignments Completion",
       
       
       
    },{
        title:"Academic Performance",
        sub_title:"Problem-Solving and Critical Thinking Skills",
       
        
    },{
        title:"Learning Attitude",
        sub_title:"Motivation and Enthusiasm",
       
        
    },{  title:"Learning Attitude",
    sub_title:"Initiative and Self Direction",
   
    },{
        title:"Learning Attitude",
        sub_title:"Collaboration and Teamwork",
      
        
    },{
        title:"Communication Skills",
        sub_title:"Verbal Communication",
        
        
    },{
        title:"Communication Skills",
        sub_title:"Written Communication",
        
        
    },{
        title:"Personal Growth",
        sub_title:"Time Management",
       
        
    },{
        title:"Personal Growth",
        sub_title:"Organization and Preparedness",
        
       
    },{
        title:"Personal Growth",
        sub_title:"Responsibility and Accountability",
       
        
    }]})
   }
    attendanceResponse = await Attendance.insertMany({
        check_in_datetime: moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss"),
        student_id: req.user._id,
        class_id: req.body.class_id,
  
    })
    const organizationId = '6894d463-40a7-4240-93dc-bb30ef741dbd';
    const apiKey = 'ac00320ed5f57433dfa8';
    
    // Combine organizationId and apiKey with a colon
    const credentials = `${organizationId}:${apiKey}`;
    
    // Encode credentials to Base64
    const encodedCredentials = btoa(credentials);
    if(classResponse.meeting_id){
        console.log("hello")
        axios.post(`https://api.dyte.io/v2/meetings/${classResponse.meeting_id}/participants`,{name:'student',preset_name:'group_call_participant',custom_participant_id:req.user.email},{
            headers:{
             'Authorization': `Basic ${encodedCredentials}`,
            }
        }).then((response)=>{
            return res.json(responseObj(true, {attendanceResponse:attendanceResponse,tokenData:response.data.data}, "Class Joined"))
        }).catch(err=>{
         console.log(err)
        }) 
    }
    else{
        axios.post("https://api.dyte.io/v2/meetings",{ record_on_start:true},{
            headers:{
                'Authorization': `Basic ${encodedCredentials}`,
            }
          }).then(async(response)=>{
           await Class.updateOne({
            _id:req.body.class_id
           },{
            $set:{
                meeting_id:response.data.data.id
            }
           })
           
           axios.post(`https://api.dyte.io/v2/meetings/${response.data.data.id}/participants`,{name:'student',preset_name:'group_call_participant',custom_participant_id:req.user.email},{
               headers:{
                'Authorization': `Basic ${encodedCredentials}`,
               }
           }).then((response)=>{
               return res.json(responseObj(true, {attendanceResponse:attendanceResponse,tokenData:response.data.data}, "Class Joined"))
           }).catch(err=>{
            console.log(err)
           })
        })
    }
    
   
  
  
  }

const leaveClass = async (req, res, next) => {
   
    let response = await Attendance.findOneAndUpdate({
        class_id: req.body.class_id,
        student_id: req.user._id
    }, {
        $set: {
            check_out_datetime:moment().format("YYYY-MM-DDTHH:mm:ss")
        }
    })
let classResponse=await Class.updateOne({
    _id:req.body.class_id
},{
    $set:{
        end_time:   moment().format("YYYY-MM-DDTHH:mm:ss")

    }
})
  return   res.json(responseObj(true, {response,classResponse}, "Class Left"))
}

const setReminder = async (req, res, next) => {
    const reminderResponse = await Reminder.insertMany({
        class_id: req.body.class_id,
        user_id: req.user._id
    })
    res.json(responseObj(true, reminderResponse, "Reminder Created Successfully"))
}

const acceptClassRequest = async (req, res, next) => {
    let details=await Class.findOne({_id:req.params._id})
  if(details.class_type==='Trial' && details.is_rescheduled===false){
    let classDetails = await Class.find({
      $and: [   { start_time:{$gte:details.start_time}},
        {start_time:{
          $lte:moment(details.start_time).add(1,'h').format("YYYY-MM-DDTHH:mm:ss")
        }},
        {end_time:{$gte:details.start_time}},
        {end_time:{
          $lte:moment(details.start_time).add(1,'h').format("YYYY-MM-DDTHH:mm:ss")
        }}, {
        $or: [{
          teacher_id: details.teacher_id
        }, {
          student_id: req.user._id
        }]
      },{
        status:"Scheduled"
      }]
    })
    if (classDetails.length > 0) {
      throw new Error("Class in this slot is booked already. Kindly Reschedule")
    }
  
    let classUpdateResponse=await  Class.updateMany({
      student_id:req.user._id,
      teacher_id:details.teacher_id,
      class_type:"Trial",
      "subject.name":details.subject.name
    },{
      $set:{
        status:"Cancelled"
      }
    })
    let classResponse = await Class.updateOne({
      _id: req.params._id
    }, {
      $set: {
        status: 'Scheduled'
      }
    })
    const AcademicManangerResponse=await AcademicManager.findOne({
      students:{
           $elemMatch: {
                $eq: req.user._id
            }
      }
    })
    addNotifications(details.teacher_id,"Accepted Class Request","Accepted Class Request of subject "+details.subject.name+" on "+moment(details.start_time).format("DD-MM-YYYY")+" at time "+moment(details.start_time).format("HH:mm:ss")+ " by student"+ req.user.name)
    
    addNotifications(AcademicManangerResponse.user_id,"Accepted Class Request","Accepted Class Request of subject "+details.subject.name+" on "+moment(details.start_time).format("DD-MM-YYYY")+ " at time "+moment(details.start_time).format("HH:mm:ss")+ " by student"+ req.user.name)
  
    return res.json(responseObj(true, null, "Accepted Class Request"))
  }else{
    let classDetails= await Class.find({
      $and: [   { start_time:{$gte:details.start_time}},
        {start_time:{
          $lte:moment(details.start_time).add(1,'h').format("YYYY-MM-DDTHH:mm:ss")
        }},
        {end_time:{$gte:details.start_time}},
        {end_time:{
          $lte:moment(details.start_time).add(1,'h').format("YYYY-MM-DDTHH:mm:ss")
        }},{$or:[{
      teacher_id:details.teacher_id
  },{
      student_id:req.user._id
  }]},{
    status:"Scheduled"
  }]})
  if(classDetails.length!==0){
  throw new Error("Slot Already Booked.Kindly Reschedule")
     
  }
  let classResponse=await Class.findOne(
  {_id:req.params._id,
  
    rescheduled_by:'student'
  
  }
  )
  
  if(classResponse!==null){
  throw new Error("You can't Accept your own Reschedule request.")
  }
  let rescheduleacceptResponse=await Class.findOneAndUpdate({_id:req.params._id},{
  $set:{
     
  status:'Scheduled'
  }
  });
  const AcademicManangerResponse=await AcademicManager.findOne({
    students:{
         $elemMatch: {
              $eq: req.user._id
          }
    }
  })
  addNotifications(rescheduleacceptResponse.teacher_id,"Accepted Rescheduled Request","Accepted Rescheduled Request of subject "+rescheduleacceptResponse.subject.name+" on "+moment(rescheduleacceptResponse.start_time).format("DD-MM-YYYY")+" at time "+moment(rescheduleacceptResponse.start_time).format("HH:mm:ss")+ " by student "+ req.user.name)
  
  addNotifications(AcademicManangerResponse.user_id,"Accepted Rescheduled Request","Accepted Rescheduled Request of subject "+rescheduleacceptResponse.subject.name+" on "+moment(rescheduleacceptResponse.start_time).format("DD-MM-YYYY")+" at time "+moment(rescheduleacceptResponse.start_time).format("HH:mm:ss")+ " by student "+ req.user.name)
  
  
  return res.json(responseObj(true,[],"Accepted Rescheduled Request"))
  
  }
    
  
  
  }

const acceptRescheduledClass = async (req, res, next) => {
let classDetails=await Class.findOne({
    _id:req.params._id
})
    classDetails = await Class.find({
        $and: [{
            start_time: classDetails.start_time,
        }, {
            $or: [{
                teacher_id: req.body.teacher_id
            }, {
                student_id: req.user._id
            }]
        },{
            status:"Scheduled"
        }]
    })
    if (classDetails.length !== 0) {
        throw new Error("Slot Already Booked")

    }
    let classResponse=await Class.findOne(
        {_id:req.params._id,
        
          rescheduled_by:'student'
        }
       )
       console.log(classResponse)
       if(classResponse!==null){
        throw new Error("You can't Accept your own Reschedule request.")
       }
    let rescheduleacceptResponse = await Class.findOneAndUpdate({ _id: new ObjectID(req.params._id) }, {
        $set: {
            status: 'Scheduled'
        }
    });
    const AcademicManangerResponse=await AcademicManager.findOne({
        students:{
             $elemMatch: {
            $eq: req.user._id
        }
        }
    })
    
        addNotifications(AcademicManangerResponse.user_id,"Class rescheduled by You for student "+req.user.name+" for subject "+rescheduleacceptResponse.subject+" on "+moment(rescheduleacceptResponse.start_time).format("DD-MM-YYYY")+ " at "+moment(rescheduleacceptResponse.start_time).format("HH:mm" )+" has been accepted")
   
        addNotifications(req.body.teacher_id,"Class rescheduled by You for student "+req.user.name+" for subject "+rescheduleacceptResponse.subject+" on "+moment(rescheduleacceptResponse.start_time).format("DD-MM-YYYY")+ " at "+moment(rescheduleacceptResponse.start_time).format("HH:mm" )+" has been accepted")
    
   
    res.json(responseObj(true, rescheduleacceptResponse, "Rescheduled Class Accepted Successfully"))
}

const markTaskDone = async (req, res, next) => {
    let taskResponse=await Task.findOneAndUpdate({
     _id:req.params._id
    },{
     $set:{
         status:"Done"
     }
    })
    if(taskResponse===null){
      return res.json(responseObj(false,null,"Invalid Task Id"))
    }
    const teacherDetails=await Class.findOne({
     _id:taskResponse.class_id
  })
  const AcademicManangerResponse=await AcademicManager.findOne({
     students:{
          $elemMatch: {
             $eq: req.user._id
         }
     }
  })
  addNotifications(teacherDetails.teacher_id,"Task marked Done"," Task has been marked as done given to "+req.user.name+ " in class for subject "+teacherDetails.subject.name+" on "+ moment(teacherDetails.start_time).format("DD-MM-YYYY")+ " at "+moment(teacherDetails.start_time).format("HH:mm:ss" )+ " with name "+taskResponse.title)
  addNotifications(AcademicManangerResponse.user_id,"Task marked Done"," Task has been marked as done given to "+req.user.name+ " in class for subject "+teacherDetails.subject.name+" on "+ moment(teacherDetails.start_time).format("DD-MM-YYYY")+ " at "+moment(teacherDetails.start_time).format("HH:mm:ss" )+ " with name "+taskResponse.title)
     res.json(responseObj(true, [], "Task Marked Done"))
    
  }
const uploadHomework = async (req, res, next) => {

    if(!req.files?.document){
      return res.json(responseObj(false,null,"No File Found"))
    }
    let homeworkResponse=await HomeWork.findOne({
      _id:req.params._id
   })
   if(homeworkResponse===null){
     return res.json(responseObj(false,null,"Invalid Homework Id"))
   }
    let fileName=await upload(req.files.document)
  
     let documentResponse = await Document.create({
         name: fileName
     })
  
  if(homeworkResponse.answer_document_id!==null&&homeworkResponse.answer_document_id!==undefined ){
   let  documentTobeDeleted=await Document.findOne(
         {_id:homeworkResponse.answer_document_id}
     )
   unlinkFile(documentTobeDeleted.name)  
  }
    homeworkResponse=await HomeWork.findOneAndUpdate({
     _id:req.params._id
   },{
     $set:{
         status:"Resolved",
         answer_document_id:documentResponse._id,
         is_reupload:false
     }
   })
   const teacherDetails=await Class.findOne({
     _id:homeworkResponse.class_id
  })
  const AcademicManangerResponse=await AcademicManager.findOne({
     students:{
          $elemMatch: {
             $eq: req.user._id
         }
     }
  })
  addNotifications(teacherDetails.teacher_id,"Home work uploaded"," Home work uploaded given to "+req.user.name+" in class for subject "+teacherDetails.subject.name+" on "+ moment(teacherDetails.start_time).format("DD-MM-YYYY")+ " at "+moment(teacherDetails.start_time).format("HH:mm:ss" )+ " with name "+homeworkResponse.title )
  addNotifications(AcademicManangerResponse.user_id,"Home work uploaded"," Home work uploaded given to "+req.user.name+" in class for subject "+teacherDetails.subject.name+" on "+ moment(teacherDetails.start_time).format("DD-MM-YYYY")+ " at "+moment(teacherDetails.start_time).format("HH:mm:ss")+ " with name "+homeworkResponse.title )
     res.json(responseObj(true, null, "Home work uploaded"))
  }

const getQuotes = async (req, res, next) => {
   
    const quoteResponse = await Quote.find({
        student_id: req.user._id,
        status: 'Pending'
    }, { teacher_id: 1,class_name : 1, amount: 1, class_count: 1 }).populate({
        path: "teacher_id", select: {
            name: 1
        }
    })
    res.json(responseObj(true, quoteResponse, 'Quotes are fetched successfully'))
}
const getQuoteById = async (req, res, next) => {
   
    const quoteResponse = await Quote.findOne({
       _id:req.query.id
    }, { teacher_id: 1,class_name : 1, amount: 1, class_count: 1 })
    const teacherDetails =await Teacher.aggregate([{
        $match: {
            user_id:new ObjectID(quoteResponse.teacher_id)
        }
    },
    //  {
    //     $lookup: {
    //         from: "classes",
    //         foreignField: "teacher_id",
    //         localField: "user_id",
    //         as: "classes",
    //         pipeline: [
    //             { $match: {$and:[{ status: "Done" },{
    //                 "subject.name":req.query.subject
    //             }]} }  // Add a $match stage to filter documents in the "from" collection
    //             // Additional stages for the "from" collection aggregation pipeline if needed
    //         ]
    //     }
    //     },
    
    {
        $lookup: {
            from: "reviews",
            foreignField: "teacher_id",
            localField: "user_id",
            as: "reviews"

        }

    },{
        $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "users"
        }
    },
    {
        $unwind:"$users"
    },
    {
        $unwind: "$exp_details" // Unwind the array of experience details
    }, {
        $project: {
            user_id: 1,
            preferred_name: 1,
            exp: { $sum: "$exp_details.exp" },
            ratings: {
                $avg: {
                    $cond: [
                        { $eq: [{ $size: "$reviews" }, 0] },
                        0,
                        { $avg: "$reviews.rating" }
                    ]
                }
            },
            reviews: {
                $size: "$reviews"
            },
            // no_of_classes: {
            //     $size: "$classes"
            // },
            "users.profile_image":{ $cond: {
                if: { $eq: ["$users.profile_image", null] },
                then: null,
                else: { $concat: [process.env.CLOUD_API+"/", "$users.profile_image"] }
            }},

        }
    }])
    res.json(responseObj(true, {quoteResponse,teacherDetails:teacherDetails[0]}, 'Quotes are fetched successfully'))
}
const getExtraClassQuotes = async (req, res, next) => {
    
    const quoteResponse = await Quote.find({
        student_id: req.user._id,
        class_type: 'Extra'
    })

    res.json(responseObj(true, quoteResponse, 'Extra CLass Quotes are fetched properly'))
}

const getPurchasedClasses = async (req, res, next) => {
   
    let query = { student_id: req.user._id ,status:"Paid"}
    if (req.query.search) {
        query = {
            $and: [
                { student_id: req.user._id },
                {status:"Paid"},
                {
                    $or: [
                        {
                            "subject.name": {

                                $regex: req.query.search,
                                $options: 'i'
                            }
                        }
                        , {
                            "curriculum.name": {

                                $regex: req.query.search,
                                $options: 'i'
                            }
                        },
                        {
                            "grade.name": {

                                $regex: req.query.search,
                                $options: 'i'
                            }
                        }



                    ]
                }
            ]
        }

    }
    let options = {
        limit: Number(req.query.limit),
        page: Number(req.query.page),
        select: [
            "subject_curriculum_grade", "teacher_id", "hours", "class_type", "schedule_status"
        ],
        populate: [{
            path: 'teacher_id',
            select: {
                name: 1
            }
        },{
            path: "due_date_class_id",
            select: {
                end_time: 1
            }
        }]

    }
    await Quote.paginate(query, options).then((results) => {

        res.json(responseObj(true, results, ''))
    })
}

const getPurchasedClassesByQuoteId = async (req, res, next) => {
    let options = {
        limit: Number(req.query.limit),
        page: Number(req.query.page),
        select: [

            "subject", "start_time", "status", "teacher_id","is_rescheduled","rescheduled_by"
        ],
        populate: [{
            path: "teacher_id",
            select: {
                name: 1
            }
        }]

    }
    Class.paginate({ quote_id: new ObjectID(req.query._id) }, options).then((result, err) => {
        res.json(responseObj(true, result, 'Purchased Class Quotes are fetched successfully'))
    })
}



const getLastTrialClass = async (req, res, next) => {
   
    const lastClassResponse = await Attendance.findOne({ student_id: req.user._id }).populate({'path':'class_id',select:{
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
            return res.json(responseObj(false,null,"Trial Class already responded"))
        }
        
        res.json(responseObj(true, lastClassResponse.class_id, 'Last trial class details are fetched successfully'))
    }
    else{
        return res.json(responseObj(false,null,"No Trial Class"))
    }
    


}
const getClassesBasedOnDate=async (req,res)=>{
    const start_time=moment(req.body.date).startOf('day')
    const end_time=moment(req.body.date).endOf('day')
    const classes=await Class.find({
      start_time:{$gte :start_time},
      end_time:{$lte:end_time},
      student_id:req.user._id
    })
    return res.json(responseObj(true,classes,null)) 
  }
  const getUpcomingClassDetails=async(req,res)=>{
    let classDetails = {}
    classDetails = await Class.findOne({ _id: req.query.class_id }, { start_time: 1, end_time: 1, details: 1, grade: 1, subject: 1, teacher_id: 1, notes: 1,other_information:1 }).populate({
      path: 'teacher_id', select: {
       name: 1,profile_image:1
      }
    }).populate({
      path: 'student_id', select: {
        name: 1,mobile_number:1,profile_image:1
      }
    })
   
    const teacherDetails =await Teacher.aggregate([{
        $match: {
            user_id:new ObjectID(classDetails.teacher_id)
        }
    },
    //  {
    //     $lookup: {
    //         from: "classes",
    //         foreignField: "teacher_id",
    //         localField: "user_id",
    //         as: "classes",
    //         pipeline: [
    //             { $match: {$and:[{ status: "Done" },{
    //                 "subject.name":req.query.subject
    //             }]} }  // Add a $match stage to filter documents in the "from" collection
    //             // Additional stages for the "from" collection aggregation pipeline if needed
    //         ]
    //     }
    //     },
    
    {
        $lookup: {
            from: "reviews",
            foreignField: "teacher_id",
            localField: "user_id",
            as: "reviews"

        }

    },{
        $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "users"
        }
    },
    {
        $unwind:"$users"
    },
    {
        $unwind: "$exp_details" // Unwind the array of experience details
    }, {
        $project: {
            user_id: 1,
            preferred_name: 1,
            exp: { $sum: "$exp_details.exp" },
            ratings: {
                $avg: {
                    $cond: [
                        { $eq: [{ $size: "$reviews" }, 0] },
                        0,
                        { $avg: "$reviews.rating" }
                    ]
                }
            },
            reviews: {
                $size: "$reviews"
            },
            // no_of_classes: {
            //     $size: "$classes"
            // },
            "users.profile_image":{ $cond: {
                if: { $eq: ["$users.profile_image", null] },
                then: null,
                else: { $concat: [process.env.CLOUD_API+"/", "$users.profile_image"] }
            }},

        }
    }])
   
    
    // let reminderResponse = await Reminder.findOne({ class_id:req.query.class_id })
    res.json(responseObj(true, { classDetails: classDetails,teacherDetails:teacherDetails[0] }, null))
  }
  const getHomeworks=async(req,res)=>{
    let query={
     class_id:req.query.class_id
    }
    let {limit,page}=req.query
    let options={
     limit,page
    }
    HomeWork.paginate(query,options,(err,result)=>{
     if(result.docs.length===0){
       return res.json(responseObj(false,null,"No Homework Found"))
     }
     return res.json(responseObj(true,result,"All Homeworks in the Class"))
    })
   // res.json(responseObj(true, {homeworkResponse:homeworkResponse}, "HomeWork Details successfully fetched"))
   }
   const getTasks=async(req,res)=>{
     let query={
       class_id:req.query.class_id
      }
      let {limit,page}=req.query
      let options={
       limit,page
      }
      Task.paginate(query,options,(err,result)=>{
       if(result){
         if(result.docs.length===0){
           return res.json(responseObj(false,null,"No Task Found"))
         }
         return res.json(responseObj(true,result,"All tasks in the Class"))
       }
      
      })
   }
   const getMaterials=async(req,res)=>{
   let classMaterials=await Class.findOne({
     _id:req.query.class_id
   }).select({"materials":1})
   if(classMaterials===null){
     return res.json(responseObj(false,null,"Invalid Class Id"));
   }
   if (!classMaterials.materials.length>0) {
     return res.json(responseObj(false,null,"No Materials Found"));
   }
   let {limit,page}=req.query
   
   let totalDocs=classMaterials.materials.length
   classMaterials = await Class.findOne(
     { _id: req.query.class_id }, // Query
     { materials: { $slice: [(Number(page - 1)) * Number(limit), Number(limit)] } } // Projection
   );
   let docs=classMaterials
   let totalPages=Math.ceil(totalDocs/Number(limit))
   let hasPrevPage=Number(page)>1
   let hasNextPage=Number(page)<totalPages
   let prevPage=hasPrevPage?Number(page)-1:null
   let nextPage=hasNextPage?Number(page)+1:null
   
   return res.json(responseObj(true,{docs,totalDocs,totalPages,hasPrevPage,hasNextPage,prevPage,nextPage,limit:Number(limit),page:Number(page),pagingCounter:Number(page)},"All Class Materials"))
   
   }
   const viewRec=async(req,res)=>{
    const meetingDetails=await Class.findOne({
      _id:req.query.id
    },{meeting_id:1})
    const organizationId = '6894d463-40a7-4240-93dc-bb30ef741dbd';
    const apiKey = 'ac00320ed5f57433dfa8';
    
    // Combine organizationId and apiKey with a colon
    const credentials = `${organizationId}:${apiKey}`;
    console.log(meetingDetails.meeting_id)
    // Encode credentials to Base64
    const encodedCredentials = btoa(credentials);
    axios.get(`https://api.dyte.io/v2/recordings?meeting_id=${meetingDetails.meeting_id}`,{
      headers:{
       'Authorization': `Basic ${encodedCredentials}`,
      }
    }).then((response)=>{
    
    let downloadLink=response.data.data.map((data)=>data.download_url)
      return res.json(responseObj(true,downloadLink,null))
    })
    }
export {viewRec,getHomeworks,getTasks,getMaterials,acceptClassRequest, getUpcomingClassDetails,getClassesBasedOnDate,dislikeClass, getLastTrialClass, likeClass, setReminder, getExtraClassQuotes, requestExtraclass,  uploadHomework, scheduleClass, requestTrialClass, getClassDetails, rescheduleClass, reviewClass, raiseRequestResource, joinClass, leaveClass, acceptRescheduledClass, getQuotes, getPurchasedClasses, getPurchasedClassesByQuoteId,markTaskDone,reviewTeacher,getQuoteById }