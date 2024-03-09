
import Reminder from "../../../models/Reminder.js"
import { responseObj } from "../../../util/response.js"
import mongoose, { Error } from "mongoose"
const ObjectId = mongoose.Types.ObjectId
import Document from "../../../models/Document.js"
import moment from 'moment-timezone'
import Class from "../../../models/Class.js"
import Attendance from "../../../models/Attendance.js"
import HomeWork from "../../../models/HomeWork.js"
import Task from "../../../models/Task.js"
import Student from "../../../models/Student.js"
import ResourceRequest from "../../../models/ResourceRequest.js"
import Teacher from "../../../models/Teacher.js"
import { getExtraClassQuotes } from "../../Student/Class/Class.js"
import Review from "../../../models/Review.js"
import AcademicManager from "../../../models/AcademicManager.js"
import { addNotifications } from "../../../util/addNotification.js"
import User from "../../../models/User.js"
import MonthlyReport from "../../../models/MonthlyReport.js"
import axios from "axios"
import  upload  from "../../../util/upload.js"
const setReminder = async (req, res, next) => {
  const reminderResponse = await Reminder.insertMany({
    class_id: req.body.class_id,
    user_id:req.user._id
  })
  res.json(responseObj(true, reminderResponse, null))
}

const requestReUpload=async(req,res)=>{
  await HomeWork.updateOne({
   
        _id:req.params.home_work_id
      
  },{
    status:"ReUpload"
  })
  res.json(responseObj(true,[],"Request for Re Upload of Homework placed Successfully"))

}

const scheduleClass = async (req, res, next) => {
   let classDetails=await Class.findOne({
    _id:req.params._id
   })
   if(classDetails===null){
    throw new Error("No Class Found")
   }
  let classScheduled = await Class.find({
      $and: [{
          start_time: req.body.start_time,
      }, {
          $or: [{
              teacher_id: req.body.teacher_id
          }, {
              student_id: req.user._id
          }]
      }]
  })
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
              schedule_status: 'done'
          }
      })
  }
  res.json(responseObj(true, scheduleClassResponse, "Class Scheduled Successfully"))



}

const getClassDetails = async (req, res, next) => {
  let classDetails = {}
  classDetails = await Class.findOne({ _id: req.query.class_id,end_time:{$lte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")} }, { start_time: 1, end_time: 1, details: 1, grade: 1, subject: 1, teacher_id: 1, notes: 1,  materials: { $slice: [1* 3, 3] }, recordings: 1,class_type:1 }).populate({
    path: 'teacher_id', select: {
     name: 1,profile_image:1
    }
  }).populate({
    path: 'student_id', select: {
      name: 1,profile_image:1
    }
  })
  if(classDetails===null){
    throw new Error ("Class Id is wrong")
  }
  let studentDetails=await Student.findOne({user_id:classDetails.student_id},{
    grade:1,
    curriculum:1,
    school:1
  })
  let homeworkResponse=await HomeWork.find({
    class_id:req.query.class_id
}).populate({
  path:"answer_document_id"
}).limit(3)
let taskResponse=await Task.find({
    class_id:req.query.class_id
}).limit(3)
  
  // let reminderResponse = await Reminder.findOne({ class_id: new ObjectId(req.query.class_id) })
  let resource_requests=await ResourceRequest.find({
    class_id:req.query.class_id
  })
  if(studentDetails===null){
    throw new Error("Student Details not found")
  }
  let ratings=await Review.findOne({
    class_id:req.query.class_id,
    given_by:req.user._id
   })
   
  res.json(responseObj(true, { classDetails: classDetails,resource_requests:resource_requests,studentDetails:studentDetails,homeworkResponse:homeworkResponse,taskResponse:taskResponse,ratings:ratings }, null))
}

const addNotesToClass = async (req, res, next) => {
  let notesResponseAlready=await Class.findOne({
    _id: new ObjectId(req.params._id)
  },{
    notes:1,_id:1
  })
  if(notesResponseAlready===null){
throw new Error("Class ID Is incorrect")
  }
  if(notesResponseAlready.notes!==null){
    throw new Error("Notes already added")
  }
  let notesResponse = await Class.updateOne({ _id: new ObjectId(req.params._id) }, {
    $set: {
      notes: req.body.notes
    }
  })

  res.json(responseObj(true, [], "Notes Added Successfully"))
}
const addOtherInfo=async(req,res)=>{
  const other_information=await Class.findOneAndUpdate({
    _id:req.body.class_id
  },{
    $set:{
      other_information:req.body.other_information
    }
  })
  if(other_information===null){
return res.json(responseObj(false,null,"Class Not Valid"))
  }
  return res.json(responseObj(true,null,"Other Information added"))
}
const addTask = async (req, res, next) => {
  let classDetails=await Class.findOne({
    _id : req.body.class_id,
    end_time:{
      $lte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
    }
  })
  if(classDetails===null){
    throw new Error("No class Found")
  }
  let taskResponse = await Task.create({
    title: req.body.title,
    description: req.body.description,
    due_date: req.body.due_date,
  class_id:req.body.class_id})

  const AcademicManangerResponse=await AcademicManager.findOne({
    teachers:{
         $elemMatch: {
          $eq: req.user._id
      }
    }
})
// const classDetails=await Class.findOne({_id:req.body.class_id})

  addNotifications(AcademicManangerResponse.user_id,"Task Added", "A Task has been added by "+req.user.name+" of title "+ req.body.title+" in class done on "+moment(classDetails.start_time).format("DD-MM-YYYY") +" at "+ moment(classDetails.start_time).format("HH:mm") )
  
  addNotifications(classDetails.student_id,"Task Added", "A Task has been added by "+req.user.name+" of title "+ req.body.title+" in class done on "+moment(classDetails.start_time).format("DD-MM-YYYY")+" at "+ moment(classDetails.start_time).format("HH:mm") )

  
  res.json(responseObj(true, taskResponse, "Task Created Successfully"))
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
      teacher_id:req.user._id
  },{
      student_id:details.student_id
  }]}]})
console.log(classScheduled)
      if(classScheduled.length!==0){
       throw new Error('This time slot has been already scheduled')  
      }

const rescheduleClassResponse=await Class.findOneAndUpdate({_id:req.params._id},{$set:{
  is_rescheduled:true,
  start_time:moment(req.body.start_time).format("YYYY-MM-DDTHH:mm:ss"),
  end_time:moment(req.body.start_time).add(1,'h').format("YYYY-MM-DDTHH:mm:ss"),
  rescheduled_by:'teacher',
  status:'Pending'
  }})
  const studentDetails=await Student.findOne({
    user_id:details.student_id
  })
  const AcademicManangerResponse=await AcademicManager.findOne({
    teachers:{
         $elemMatch: {
          $eq: req.user._id
      }
    }
})
  addNotifications(rescheduleClassResponse.student_id,"Class Rescheduled","Class of student "+studentDetails.preferred_name+" and teacher "+req.user.name+" which was earlier scheduled at "+ moment(details.start_time).format("DD-MM-YYYYTHH:mm:ss")+ "has been rescheduled for on  "+ moment(req.body.start_time).format("DD-MM-YYYY")+" at "+ moment(req.body.start_time).format("HH:mm:ss"))
  addNotifications(AcademicManangerResponse.user_id,"Class Rescheduled","Class of student "+studentDetails.preferred_name+" and teacher "+req.user.name+" which was earlier scheduled at "+ moment(details.start_time).format("DD-MM-YYYYTHH:mm:ss")+ "has been rescheduled for on "+ moment(req.body.start_time).format("DD-MM-YYYY")+" at "+ moment(req.body.start_time).format("HH:mm:ss"))
  res.json(responseObj(true,[],"Class Rescheduled"))

}
const getPastClasses = async (req, res, next) => {
  
  let query = {
    $and: [
      {

        start_time: { $lt:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss") },
      }, {
        teacher_id: req.user._id,

      },
      {
        status: 'Done'
      }
    ]

  }
  let options = {
    limit: req.query.limit ? Number(req.query.limit) : 5,
    page: Number(req.query.page),
    populate:[{
      path:'student_id',
      select:{
        name:1
      }
    }],
    select:{
      "subject":1,"name":1,"start_time":1,"end_time":1
    }
  }
  if(req.query.search){
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
    query["$or"]= [
       
          { "subject.name": { $regex: req.query.search, $options: 'i' } },
          {"name":  {$regex: req.query.search, $options: 'i' }
           
          },
          {"student_id":{
            $in:student_ids.map((data)=>data._id)
          }},
          // {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
        ]
      
    
  }
  if(req.query.date){
    query["$and"].push({
      start_time:{$gte:moment(req.query.date).format("YYYY-MM-DD")},
      end_time:{
        $lt:moment(req.query.date).add(1,'d').format("YYYY-MM-DD")
      }
    })
  }
  Class.paginate(query, options, (err, result) => {
    if (result) {
      res.json(responseObj(true, result, null))
    }
    else {
      console.log(err)
    }
  })

}
const getRescheduledClasses = async (req, res, next) => {
  
  let options = {
    limit: req.query.limit ? Number(req.query.limit) : 5,
    page: Number(req.query.page),
    populate:[{
      path:'student_id',
      select:{
        name:1
      }
    }],
    select:{
      "subject":1,"name":1,"start_time":1,"end_time":1,"recheduled_by":1,"status":1
    }
  }
  let query = {
    $and: [
      {

        end_time: { $gte: moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")},
      }, {
        teacher_id: req.user._id,

      },
      {
        is_rescheduled: true
      },
   { status:"Pending"}
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
      {"name":  {$regex: req.query.search, $options: 'i' }
       
      },
      {"student_id":{
        $in:student_ids.map((data)=>data._id)
      }},
      // {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
    ];
  }
  if(req.query.date){
    query["$and"].push({
      start_time:{$gte:moment(req.query.date).format("YYYY-MM-DD")},
      end_time:{
        $lt:moment(req.query.date).add(1,'d').format("YYYY-MM-DD")
      }
    })
  }
  Class.paginate(query, options, (err, result) => {
 
    if (result) {
    
    
      res.json(responseObj(true,result, null))
    }
    else {
      console.log(err)
    }
  })
}
const uploadClassMaterial=async (req,res,next)=>{
  let classDetails=await Class.findOne({
    _id : req.params._id
  })
  if(classDetails===null){
    throw new Error("Incorrect Class ID")
  }
  const classId = req.params._id;
  let ClassMaterials=await Class.findOne({
    _id:req.params._id
  },{materials:1})
  if(req.files?.document){

    const fileName=await upload(req.files.document)
    ClassMaterials.materials.push({name:fileName})
    let classResponse=await Class.updateOne({
      _id : req.params._id},{$set:{ materials:ClassMaterials.materials}});
      addNotifications(classDetails.student_id,"Class Material Uploaded", "Material for class on "+moment(classDetails.start_time).format("DD-MM-YYYY")+ " at "+moment(classDetails.end_time).format("HH:mm")+ " of subject "+classDetails.subject.name+ " has been uploaded")
     
    res.json(responseObj(true,null,"Class Materials Uploaded Successfully"))
  }
  else{
    res.json(responseObj(false,null,"No File Found"))
  }
}
const reviewClass=async(req,res,next)=>{
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
     reviewResponse=await Review.insertMany({
      class_id:req.body.class_id,
      message:req.body?.message,
      rating:req.body.rating,
      given_by:req.user._id
  })
  }
  else{
reviewResponse=await Review.updateOne({
  _id:reviewResponse._id
},{
  $set:{
    message:req.body?.message,
    rating:req.body.rating,
  }
})
  }
 
 
  return res.json(responseObj(true,reviewResponse,null))
}
const joinClass = async (req, res, next) => {
  let classResponse = await Class.findOne({
      _id: req.body.class_id,
      // teacher_id:req.user._id,
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
  return res.json(responseObj(false,null,"Invalid Class"))
}
if(classResponse.teacher_id!==req.user.id){
  return res.json(responseObj(false,null,"Invalid Teacher Id"))
}
if(classResponse.status!=="Scheduled"){
  return res.json(responseObj(false,null,"Class Status is "+classResponse.status))
}
if (!(moment().utc().isBetween(moment.utc(classResponse.start_time,"YYYY-MM-DDTHH:mm:ss").subtract(5,'h').subtract(30,'m'), moment.utc(classResponse.end_time,"YYYY-MM-DDTHH:mm:ss").subtract(5,'h').subtract(30,'m')))) {      throw new Error('You cannot Join Class at this time')
  }
  console.log(classResponse.subject.name);
 let reportResponse=await MonthlyReport.findOne({
      student_id:classResponse.student_id,
      teacher_id:req.user._id,
      month:moment().month(),
      year:moment().year(),
      subject:classResponse.subject.name
 })
let attendanceResponse=await Attendance.findOne({
  student_id:classResponse.student_id,
  class_id:req.body.class_id
 })

 
 if(reportResponse===null&&attendanceResponse!==null){

  const   MonthlyReportResponse=await MonthlyReport.create({
      student_id:classResponse.student_id,
      teacher_id:req.user._id,
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
      teacher_id: req.user._id,
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
    axios.post(`https://api.dyte.io/v2/meetings/${classResponse.meeting_id}/participants`,{name:'teacher',preset_name:'group_call_host',custom_participant_id:req.user.email},{
         headers:{
          'Authorization': `Basic ${encodedCredentials}`,
         }
     }).then((response)=>{
         return res.json(responseObj(true, {attendanceResponse:attendanceResponse,tokenData:response.data.data}, "Class Joined"))
     }).catch(err=>{
      console.log(err)
     })
  }else{
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
     
     axios.post(`https://api.dyte.io/v2/meetings/${response.data.data.id}/participants`,{name:'teacher',preset_name:'group_call_host',custom_participant_id:req.user.email},{
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
    teacher_id: req.user._id
  }, {
    $set: {
      check_out_datetime:moment().format("YYYY-MM-DDTHH:mm:ss")

    }
  })
  let classResponse=await Class.updateOne({
    _id:req.body.class_id
},{
    $set:{
        end_time:moment().format("YYYY-MM-DDTHH:mm:ss")
    }
})
  return   res.json(responseObj(true, {response,classResponse}, "Class Left"))
}
const addHomework = async (req, res, next) => {
  let classDetails=await Class.findOne({
    _id : req.body.class_id,
    end_time:{
      $lte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
    }
  })
  if(classDetails===null){
    throw new Error("Incorrect Class ID")
  }
 let homeworkResponse=await HomeWork.create(
    {title: req.body.title,
      description: req.body.description,
      due_date: moment(req.body.due_date).tz("Asia/Kolkata").format("YYYY-MM-DD:HH:mm:ss"),
      class_id:req.body.class_id
    }
  )
  const AcademicManangerResponse=await AcademicManager.findOne({
    teachers:{
         $elemMatch: {
          $eq: req.user._id
      }
    }
})

// const classDetails=await Class.findOne({_id:req.body.class_id})

  addNotifications(AcademicManangerResponse.user_id,"Home Work Added", "A Homework has been added by "+req.user.name+" of title "+ req.body.title+" in class done on "+moment(classDetails.start_time).format("DD-MM-YYYY")+" at "+ moment(classDetails.start_time).format("HH:mm") +" of subject "+ classDetails.subject.name)
  
  addNotifications(classDetails.student_id,"Home Work Added", "A Homework has been added by "+req.user.name+" of title "+ req.body.title+" in class done on "+moment(classDetails.start_time).format("DD-MM-YYYY")+" at "+ moment(classDetails.start_time).format("HH:mm")+" of subject "+ classDetails.subject.name )
  
  
  res.json(responseObj(true, homeworkResponse, null))
}

const resolveResourceRequests=async(req,res)=>{
  const materialResponse=await ResourceRequest.findOne({_id:req.body.resource_request_id},{class_id:1})
  if(materialResponse===null){
    throw new Error("Resource requst ID is incorrect")
  }
  let classResponse=await Class.findOne({
    _id:materialResponse.class_id
  },{
    materials:1
  })
  if(req.files?.materials){

  let fileName=await upload(req.files?.materials)

    classResponse.materials.push({
          name:fileName
      })
  
  await Class.updateOne({_id:req.body.class_id},{$set:{materials:classResponse.materials}})
  await ResourceRequest.updateOne({_id:req.body.resource_request_id},{
      $set:{
          status:'Resolved'
      }
  })
  return res.json(responseObj(true,null,'Resource Request resolved'))
}
else{
  return res.json(responseObj(false,null,'No File Found'))
}
}
const acceptRescheduledClass=async(req,res,next)=>{
  let details=await Class.findOne({
    _id:req.params._id
  })
  if(details===null){
    throw new Error("Incorrect class ID")
  }
  let classDetails= await Class.find({$and:[{
      start_time:req.body.start_time,
  },{$or:[{
      teacher_id:details.teacher_id
  },{
      student_id:details.student_id
  }]},{
    status:"Scheduled"
  }]})
 if(classDetails.length!==0){
throw new Error("Slot Already Booked")
     
 }
 let classResponse=await Class.findOne(
  {_id:new ObjectId(req.params._id),
    rescheduled_by:"Teacher"
  
  },

 )
 
 if(classResponse!==null){
  throw new Error("You can't Accept your own Reschedule request.")
 }
 let rescheduleacceptResponse=await Class.findOneAndUpdate({_id:new ObjectId(req.params._id)},{
  $set:{
     
  status:'Scheduled'
  }
});
return res.json(responseObj(true,[],null))

}
const getClassesBasedOnDate=async (req,res)=>{
  const start_time=moment(req.body.date).startOf('day')
  const end_time=moment(req.body.date).endOf('day')
  const classes=await Class.find({
    start_time:{$gte :start_time},
    end_time:{$lte:end_time},
    teacher_id:req.user._id
  })
  return res.json(responseObj(true,classes,null)) 
}
const getUpcomingClassDetails=async(req,res)=>{
  let classDetails = {}
  classDetails = await Class.findOne({ _id: req.query.class_id,end_time:{$gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")} }, { start_time: 1, end_time: 1, details: 1, grade: 1,  teacher_id: 1, notes: 1,student_id:1,subject:1 ,other_information:1})
  if(classDetails===null){
    throw new Error("Incorrect Class Id")
  }
  let studentDetails=await Student.findOne({user_id:classDetails.student_id},{
    grade:1,
    curriculum:1,
    school:1,
    
  }).populate({
    path:"user_id",
    select:{
      name:1,profile_image:1
    }
  })
  console.log(studentDetails)
  if(studentDetails===null){
    throw new Error("Student Details not found in the database")
  }
  let teacherDetails=await Teacher.findOne({user_id:classDetails.teacher_id},{
    qualification:1,

  }).populate({
    path:"user_id",
    select:{
      name:1,profile_image:1
    }
  })
 if(teacherDetails===null){
  throw new Error("No Teacher Details found in Database")
 }
  
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
        teacher_id: req.user._id
      }, {
        student_id: details.student_id
      }]
    },{
      status:"Scheduled"
    }]
  })
  if (classDetails.length > 0) {
    throw new Error("Class in this slot is booked already. Kindly Reschedule")
  }

  let classUpdateResponse=await  Class.updateMany({
    student_id:details.student_id,
    teacher_id:req.user._id,
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
    teachers:{
         $elemMatch: {
            $eq: req.user._id
        }
    }
  })
  
  
  // addNotifications(,"Task Added", "A Task has been added by "+req.user.name+" of title"+ req.body.title)
  
  
    addNotifications(details.student_id,"Accepted Class Request","Accepted Class Request of subject "+details.subject.name+" on "+moment(details.start_time).format("DD-MM-YYYY")+" at "+moment(details.start_time).format("HH:mm:ss")+  " by teacher "+ req.user.name)
  
    addNotifications(AcademicManangerResponse.user_id,"Accepted Class Request","Accepted Class Request of subject "+details.subject.name+" at time "+moment(details.start_time).format("DD-MM-YYYY")+" at "+moment(details.start_time).format("HH:mm:ss")+" by teacher "+ req.user.name)
  
  
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
    teacher_id:req.user._id
},{
    student_id:details.student_id
}]},{
  status:"Scheduled"
}]})
if(classDetails.length!==0){
throw new Error("Slot Already Booked")
   
}
let classResponse=await Class.findOne(
{_id:req.params._id,

  rescheduled_by:'teacher'

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
  teachers:{
       $elemMatch: {
            $eq: req.user._id
        }
  }
})


// addNotifications(,"Task Added", "A Task has been added by "+req.user.name+" of title"+ req.body.title)


  addNotifications(rescheduleacceptResponse.student_id,"Accepted Rescheduled Request","Accepted Rescheduled Request of subject "+rescheduleacceptResponse.subject.name+" on "+moment(rescheduleacceptResponse.start_time).format("DD-MM-YYYY")+ " at "+moment(rescheduleacceptResponse.start_time).format("HH:mm:ss")+" by teacher "+ req.user.name)

  addNotifications(AcademicManangerResponse.user_id,"Accepted Rescheduled Request","Accepted Rescheduled Request of subject "+rescheduleacceptResponse.subject.name+" at time "+moment(rescheduleacceptResponse.start_time).format("DD-MM-YYYY")+ " at "+moment(rescheduleacceptResponse.start_time).format("HH:mm:ss")+" by teacher "+ req.user.name)

return res.json(responseObj(true,null,"Accepted Rescheduled Request"))

}
  


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
    return res.json(false,null,"No Homework Found")
  }
  return res.json(true,result,"All Homeworks in the Class")
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
    if(result.docs.length===0){
      return res.json(false,null,"No Task Found")
    }
    return res.json(true,result,"All tasks in the Class")
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
classMaterials = await Class.findOne({  _id:req.query.class_id}, { materials: { $slice: [(page - 1) * limit, limit] } });
let docs=classMaterials
let totalPages=Math.ceil(totalDocs/Number(limit))
let hasPrevPage=page>1
let hasNextPage=page<totalPages
let prevPage=hasPrevPage?Number(page)-1:null
let nextPage=hasNextPage?Number(page)+1:null

return res.json(responseObj(true,{docs,totalDocs,totalPages,hasPrevPage,hasNextPage,prevPage,nextPage},"All Class Materials"))

}
export {acceptClassRequest,getUpcomingClassDetails,scheduleClass,resolveResourceRequests,getHomeworks,getTasks,getMaterials, requestReUpload,getClassesBasedOnDate,reviewClass,setReminder,uploadClassMaterial, acceptRescheduledClass,getClassDetails, addTask, rescheduleClass, getRescheduledClasses, addHomework, addNotesToClass, joinClass, leaveClass, getPastClasses,addOtherInfo }