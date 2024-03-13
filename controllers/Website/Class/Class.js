import moment from "moment";
import Class from "../../../models/Class.js";
import { responseObj } from "../../../util/response.js";
import Teacher from "../../../models/Teacher.js";
import Review from "../../../models/Review.js";
import HomeWork from "../../../models/HomeWork.js";
import Task from "../../../models/Task.js";
import mongoose from "mongoose";
import Parent from "../../../models/Parent.js";
import Student from "../../../models/Student.js";
import Reminder from "../../../models/Reminder.js";
import AcademicManager from "../../../models/AcademicManager.js";
import Document from "../../../models/Document.js";
import unlinkFile from "../../../util/unlinkFile.js";
import { addNotifications } from "../../../util/addNotification.js";
import User from "../../../models/User.js";
import upload from "../../../util/upload.js";
import axios from "axios";
import Attendance from "../../../models/Attendance.js";
import Report from "../../../models/Report.js";
import MonthlyReport from "../../../models/MonthlyReport.js";
const objectId=mongoose.Types.ObjectId
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
console.log(classScheduled, "Hello");
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
const getUpcomingClasses=async(req,res,next)=>{
  
  
 
 
 
    let options={
      limit:req.query.limit?Number(req.query.limit):5,
      page:Number(req.query.page),
      populate:{
        path:'teacher_id',
        select:{'name':1}
      },
  sort:{
start_time:1
  }
    }
    let query={$and:[
     { end_time :{$gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")}},
    
      {student_id:req.user._id},
  
    
      {status:'Scheduled'}
    ]
  
     
    }
    if(req.query.search) {
      let student_ids=await User.find({
        name:{
          $regex: req.query.search, $options: 'i' 
        }
        })
        let teacher_ids=await User.find({
          name:{
            $regex: req.query.search, $options: 'i'
          }
        })
      query["$or"] = [
       
        { "subject.name": { $regex: req.query.search, $options: 'i' } },
        // {"name":  {$regex: req.query.search, $options: 'i' }
         
        // },
        // {"student_id":{
        //   $in:student_ids.map((data)=>data._id)
        // }},
        {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
      ];
    }
    const classData = await Class.paginate(query,options);
    const response = responseObj(true,classData,'')
    return res.json(response);
  
  }
  const getPastClasses=async(req,res,next)=>{
   
   
    let query={$and:[
      {
  
        start_time :{$lt:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")},
      },{
        student_id:req.user._id,
  
      },
      {
        status:'Done'
      }
    ]
  
    }
    let options={
      limit:req.query.limit?Number(req.query.limit):5,
      page:Number(req.query.page),
      populate:{
        path:'teacher_id',
        select:{
          "name":1
        }
      }
    }
    if(req.query.search) {
      let student_ids=await User.find({
        name:{
          $regex: req.query.search, $options: 'i' 
        }
        })
        let teacher_ids=await User.find({
          name:{
            $regex: req.query.search, $options: 'i'
          }
        })
      query["$or"] = [
       
        { "subject.name": { $regex: req.query.search, $options: 'i' } },
        // {"name":  {$regex: req.query.search, $options: 'i' }
         
        // },
        // {"student_id":{
        //   $in:student_ids.map((data)=>data._id)
        // }},
        {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
      ];
    }
    
    
   
    Class.paginate(query,options,(err,result)=>{
      if(result){
        res.json(responseObj(true,result,'Past Class Details are here'))
      }
     
    })
   
  }

  const getTrialClasses=async(req,res,next)=>{
 
    let query={$and:[{
      student_id:req.user._id,
      class_type:'Trial',
      end_time:{
        "$gte":moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
      },
      status:{
        $ne:"Cancelled"
      }
    }]}
    if(req.query.search) {
      let student_ids=await User.find({
        name:{
          $regex: req.query.search, $options: 'i' 
        }
        })
        let teacher_ids=await User.find({
          name:{
            $regex: req.query.search, $options: 'i'
          }
        })
      query["$or"] = [
       
        { "subject.name": { $regex: req.query.search, $options: 'i' } },
        // {"name":  {$regex: req.query.search, $options: 'i' }
         
        // },
        // {"student_id":{
        //   $in:student_ids.map((data)=>data._id)
        // }},
        {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
      ];
    }
    let options={
      limit:req.query.limit?Number(req.query.limit):5,
      page:Number(req.query.page),
      populate:{
        path:"teacher_id",
        select:{
          name:1
        }
      }
    }
    Class.paginate(query,options,(err,result)=>{
      res.json(responseObj(true,result,''))
    })
  }

  const getClassDetails = async (req, res, next) => {
    let classDetails = {}
    classDetails = await Class.findOne({ _id: req.query.class_id ,end_time:{
      $lte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
    }}, { teacher_id:1,start_time: 1, end_time: 1, description: 1, grade: 1, subject: 1, notes: 1,  materials: 1,student_id:1  }).populate({
        path: 'teacher_id', select: {
            profile_image: 1, name: 1
        }
    })
    if(!classDetails){
      return res.json(responseObj(false,null,"Incorrect Class"))
    }
 let teacherResponse=await Teacher.findOne({
    user_id:classDetails.teacher_id
 },{
    exp:1,
    qualification:1
 }) 
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



    res.json(responseObj(true, {classDetails:classDetails,teacherResponse:teacherResponse,ratingsResponse:classRatingsResponse?classRatingsResponse.rating:null,teacherRatings:teacherRatings?teacherRatings.rating:null}, "Class Details successfully fetched"))
}
const getHomeworks=async(req,res)=>{
  let homeworkResponse=await HomeWork.find({
    class_id:req.query.class_id
}).populate({
  path:"answer_document_id"
})
res.json(responseObj(true, {homeworkResponse:homeworkResponse}, "HomeWork Details successfully fetched"))
}
const getTasks=async(req,res)=>{
  let taskResponse=await Task.find({
    class_id:req.query.class_id
})
res.json(responseObj(true, {taskResponse:taskResponse}, "Task Details successfully fetched"))
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
      message: req.body.message?req.body.message:'',
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
const getUpcomingClassDetails=async(req,res)=>{
  let classDetails = {}
  classDetails = await Class.findOne({ _id: req.query.class_id,
    end_time:{
      $gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
    }
  }, { start_time: 1, end_time: 1, details: 1, grade: 1, subject: 1, teacher_id: 1, notes: 1,materials:1 }).populate({
    path: 'teacher_id', select: {
     name: 1,profile_image:1
    }
  }).populate({
    path: 'student_id', select: {
      name: 1,mobile_number:1,profile_image:1
    }
  })
  if(!classDetails){
    return res.json(responseObj(false,null,"Incorrect Class"))
  }
  let studentDetails=await Student.findOne({user_id:classDetails.student_id},{
    grade:1,
    curriculum:1,
    school:1
  })
  let teacherDetails=await Teacher.findOne({user_id:classDetails.teacher_id},{
    qualification:1,"exp_details[0].organizaton":1

  })
 
  
  let reminderResponse = await Reminder.findOne({ class_id:req.query.class_id })
  res.json(responseObj(true, { classDetails: classDetails, reminderResponse: reminderResponse,studentDetails:studentDetails,teacherDetails:teacherDetails }, null))
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

const getRescheduledClasses=async(req,res,next)=>{
 


  let options={
      limit:req.query.limit?Number(req.query.limit):5,
      page:Number(req.query.page),
      populate:{
        "path":"teacher_id",
        select:{
          "name":1
        }
      }
  
    }
    let query={$and:[
          {
  
            end_time :{$gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")},
          },{
            student_id:req.user._id,
  
          },
          {
            is_rescheduled:true
          },{
            status:"Pending"
          }]
        }
        if(req.query.search) {
          let student_ids=await User.find({
            name:{
              $regex: req.query.search, $options: 'i' 
            }
            })
            let teacher_ids=await User.find({
              name:{
                $regex: req.query.search, $options: 'i'
              }
            })
          query["$or"] = [
           
            { "subject.name": { $regex: req.query.search, $options: 'i' } },
            // {"name":  {$regex: req.query.search, $options: 'i' }
             
            // },
            // {"student_id":{
            //   $in:student_ids.map((data)=>data._id)
            // }},
            {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
          ];
        }
      Class.paginate(query,options,(err,result)=>{
        if(result){
          res.json(responseObj(true,result,'Rescheduled Classes are'))
        }
        else{
          console.log(err)
        }
      })
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
const setReminder = async (req, res, next) => {
  const reminderResponse = await Reminder.insertMany({
    class_id: req.body.class_id,
    user_id:req.user._id
  })
  res.json(responseObj(true, reminderResponse, null))
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
   res.json(responseObj(true, [], "Home work uploaded"))
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
  export {viewRec,setReminder,acceptClassRequest,rescheduleClass,getPastClasses,getUpcomingClasses,getClassDetails,getUpcomingClassDetails,getRescheduledClasses,getTrialClasses,reviewClass,markTaskDone,reviewTeacher,uploadHomework,getHomeworks,getTasks,joinClass}