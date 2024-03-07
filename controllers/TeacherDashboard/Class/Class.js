

import Class from "../../../models/Class.js"
import HomeWork from "../../../models/HomeWork.js"
import Student from "../../../models/Student.js"
import Task from "../../../models/Task.js"
import { responseObj } from "../../../util/response.js"
import Reminder from "../../../models/Reminder.js"
import moment from "moment"
import Review from "../../../models/Review.js"
import Quote from "../../../models/Quote.js"
import ResourceRequest from "../../../models/ResourceRequest.js"
import Teacher from "../../../models/Teacher.js"
import mongoose from "mongoose"
import Attendance from "../../../models/Attendance.js"
import { addNotifications } from "../../../util/addNotification.js"
import AcademicManager from "../../../models/AcademicManager.js"
import User from "../../../models/User.js"
import MonthlyReport from "../../../models/MonthlyReport.js"
import axios from "axios"
import upload from "../../../util/upload.js"
const ObjectId=mongoose.Types.ObjectId
const getUpcomingClasses = async (req, res, next) => {
  
  
  let options = {
    limit: req.query.limit ? Number(req.query.limit) : 5,
    page: Number(req.query.page),
    populate:[{
      path:'student_id'
    },{
      path:"teacher_id"
    }]
  }
  let query = {
    $and: [
      { end_time: { $gte: moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")} },

      { teacher_id: req.user._id },


      { status: 'Scheduled' }
    ]


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
    
    query["or"]=
        [
       
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
  
  Class.paginate(query, options, (err, results) => {
    if (results) {
      res.json(responseObj(true, results, null))
    }
  })

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
      path:'student_id'
    },{
      path:"teacher_id"
    }]
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
    query["$or"]=
         [
       
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
      path:'student_id'
    },{
      path:"teacher_id"
    }]
  }
  let query = {
    $and: [
      {

        end_time: { $gte: moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")},
      }, {
        teacher_id: req.user._id,

      },
      {
        status:"Pending"
      },
      {
        is_rescheduled: true
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
    
    
      return res.json(responseObj(true,result, null))
    }
    else {
      console.log(err)
    }
  })
}

const getTrialClassesRequests = async (req, res, next) => {
  let query = {
    $and: [{
      teacher_id: req.user._id,
      class_type: 'Trial',
      end_time: {
        "$gte": moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
      },
      status:{
        $ne:"Cancelled"
      }
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
  let options = {
    limit: req.query.limit ? Number(req.query.limit) : 5,
    page: Number(req.query.page),
    populate:[{
      path:'student_id'
    },{
      path:"teacher_id"
    }]
  }
  Class.paginate(query, options, (err, result) => {
   
    res.json(responseObj(true, result, null))
  })
}
const scheduleClass = async (req, res, next) => {
   
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

const setReminder = async (req, res, next) => {
    const reminderResponse = await Reminder.insertMany({
      class_id: req.body.class_id,
      user_id:req.user._id
    })
    res.json(responseObj(true, reminderResponse, null))
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
    addNotifications(rescheduleClassResponse.student_id,"Class Rescheduled","Class of student "+studentDetails.preferred_name+" and teacher "+req.user.name+" which was earlier scheduled for on  "+ moment(details.start_time).format("DD-MM-YYYY")+" at "+ moment(details.start_time).format("HH:mm:ss")+ " has been rescheduled for on  "+ moment(req.body.start_time).format("DD-MM-YYYY")+" at "+ moment(req.body.start_time).format("HH:mm:ss"))
    addNotifications(AcademicManangerResponse.user_id,"Class Rescheduled","Class of student "+studentDetails.preferred_name+" and teacher "+req.user.name+" which was earlier scheduled for on  "+ moment(details.start_time).format("DD-MM-YYYY")+" at "+ moment(details.start_time).format("HH:mm:ss")+ " has been rescheduled for on "+ moment(req.body.start_time).format("DD-MM-YYYY")+" at "+ moment(req.body.start_time).format("HH:mm:ss"))
    res.json(responseObj(true,[],"Class Rescheduled"))
  
  }
  const addNotesToClass = async (req, res, next) => {
    let notesResponseAlready=await Class.findOne({
      _id: req.params._id
    },{
      notes:1,_id:1
    })
    if(notesResponseAlready===null){
  throw new Error("Class ID Is incorrect")
    }
    if(notesResponseAlready.notes){
      throw new Error("Notes already added")
    }
    let notesResponse = await Class.updateOne({ _id: req.params._id }, {
      $set: {
        notes: req.body.notes
      }
    })
  
    res.json(responseObj(true, [], "Notes Added Successfully"))
  }
  const getClassDetails=async(req,res)=>{
    let classDetails = {}
  classDetails = await Class.findOne({ _id: req.query.class_id,end_time:{$lte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")}}).populate({
    path: 'teacher_id', select: {
     name: 1,profile_image:1
    }
  }).populate({
    path: 'student_id', select: {
      name: 1
    }
  })
  if(classDetails===null){
  return res.json(responseObj(false,null,"No Class Found"))
  }
  let studentDetails=await Student.findOne({user_id:classDetails.student_id},{
    grade:1,
    curriculum:1,
    school:1
  })
  let homeworkResponse=await HomeWork.find({
    class_id:req.query.class_id
})
let taskResponse=await Task.find({
    class_id:req.query.class_id
})
  
  let reminderResponse = await Reminder.findOne({ class_id:req.query.class_id})
  let resource_requests=await ResourceRequest.find({
    class_id:req.query.class_id,
    status:'Pending'
  })
 let ratings=await Review.findOne({
  class_id:req.query.class_id,
  given_by:req.user._id
 })
  res.json(responseObj(true, { classDetails: classDetails, reminderResponse: reminderResponse,studentDetails:studentDetails,homeworkResponse:homeworkResponse,taskResponse:taskResponse,resource_requests:resource_requests,ratings:ratings }, null))

  }
  const joinClass = async (req, res, next) => {
    let classResponse = await Class.findOne({
        _id: req.body.class_id,
        teacher_id:req.user._id,
        status:"Scheduled"
    }, {
        start_time: 1,
        end_time: 1,
        student_id:1,
        subject:1,
        meeting_id:1
    })
  if(classResponse===null){
    return res.json(responseObj(false,null,"Invalid Class"))
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
        check_out_datetime: req.body.check_out_datetime
      }
    })
  
    let classResponse=await Class.updateOne({
      _id:req.body.class_id
  },{
      $set:{
          end_time:req.body.check_out_datetime
      }
  })
    return   res.json(responseObj(true, {response,classResponse}, "Class Left"))
  }
  const addTask = async (req, res, next) => {
    const classDetails=await Class.findOne({_id:req.body.class_id,end_time:{
      $lte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
    }})
    if(classDetails===null){
      return res.json(responseObj(fasle,null,"Invalid Class Id"))
    }
    let taskResponse = await Task.create({
      title: req.body.title,
      description: req.body.description,
      due_date: moment(req.body.due_date).format("YYYY-MM-DD"),
    class_id:req.body.class_id})
    const AcademicManangerResponse=await AcademicManager.findOne({
      teachers:{
           $elemMatch: {
            $eq: req.user._id
        }
      }
  })
  // const classDetails=await Class.findOne({_id:req.body.class_id})
  
    addNotifications(AcademicManangerResponse.user_id,"Task Added", "A Task has been added by "+req.user.name+" of title "+ req.body.title+" in class done on "+moment(classDetails.start_time).format("ll") +" at "+ moment(classDetails.start_time).format("HH:mm")+" of subject "+ classDetails.subject.name )
    
    addNotifications(classDetails.student_id,"Task Added", "A Task has been added by "+req.user.name+" of title "+ req.body.title+" in class done on "+moment(classDetails.start_time).format("ll")+" at "+ moment(classDetails.start_time).format("HH:mm")+" of subject "+ classDetails.subject.name )
    res.json(responseObj(true, taskResponse, "Task Created Successfully"))
  }
  const addHomework = async (req, res, next) => {
    const classDetails=await Class.findOne({_id:req.body.class_id,end_time:{
      $lte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
    }})
    if(classDetails===null){
      return res.json(responseObj(false,null,"Invalid Class Id"))
    }
    let homeworkResponse=await HomeWork.create(
       {title: req.body.title,
         description: req.body.description,
         due_date: moment(req.body.due_date).format("YYYY-MM-DD"),
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

    addNotifications(AcademicManangerResponse.user_id,"Home Work Added", "A Homework has been added by "+req.user.name+" of title "+ req.body.title+" in class scheduled on "+moment(classDetails.start_time).format("DD-MM-YYYY")+" at "+ moment(classDetails.start_time).format("HH:mm") +" of subject "+ classDetails.subject.name)
    
    addNotifications(classDetails.student_id,"Home Work Added", "A Homework has been added by "+req.user.name+" of title "+ req.body.title+" in class scheduled on "+moment(classDetails.start_time).format("DD-MM-YYYY")+" at "+ moment(classDetails.start_time).format("HH:mm")+" of subject "+ classDetails.subject.name )
   
     res.json(responseObj(true, homeworkResponse, null))
   } 
  const requestReUpload=async(req,res)=>{
    await HomeWork.updateOne({
     
          _id:req.params.home_work_id
        
    },{
     is_reupload:true,
     status:"Pending"
    })
    res.json(responseObj(true,[],"Request for Re Upload of Homework placed Successfully"))

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
    console.log(reviewResponse)
    if(reviewResponse===null){
       reviewResponse=await Review.insertMany({
        class_id:req.body.class_id,
        message:req.body?.message,
        rating:req.body.rating,
        given_by:req.user._id
    })
    }
    else{
      return res.json(responseObj(false,null,"You have already reviewed"))
    }
    const AcademicManangerResponse=await AcademicManager.findOne({
      teachers:{
           $elemMatch: {
            $eq: req.user._id
        }
      }
  })
  
 
    // addNotifications(AcademicManangerResponse.user_id,"Task Added", "A Task has been added by "+req.user.name+" of title"+ req.body.title)
    
   addNotifications(AcademicManangerResponse.user_id,"A Class Reviewed","A class of "+classDetails.subject.name+" Reviewed as "+ req.body.rating+ "by "+req.user.name )
   addNotifications(classDetails.student_id, "A Class Reviewed","A class of "+classDetails.subject.name+" Reviewed as "+ req.body.rating+ "by "+req.user.name)
    return res.json(responseObj(true,reviewResponse,null))
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

    let fileName=await upload(req.files.document)
    ClassMaterials.materials.push({name:fileName})
    let classResponse=await Class.updateOne({
      _id : req.params._id},{$set:{ materials:ClassMaterials.materials}});
      addNotifications(classDetails.student_id,"Class Material Uploaded", "Material for class on "+moment(classDetails.start_time).format("DD-MM-YYYY")+ " at "+moment(classDetails.end_time).format("HH:mm")+ " of subject "+classDetails.subject.name+ " has been uploaded")
      
    res.json(responseObj(true,[],"Class Materials Uploaded Successfully"))
    }
    else{
      res.json(responseObj(fals,null, "No file Found"))
    }
  }
const getTrialClassResponse=async(req,res)=>{
  const response=await Class.findOne({class_id:req.query.class_id})
  return res.json(responseObj(true,response,null))
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
const getClasssBasedOnMonth=async(req,res)=>{
  const start_time=moment().set('month',req.query.month).startOf('month')
  const end_time=moment().endOf('day')
  const classes=await Class.find({
    start_time:{$gte :start_time},
    end_time:{$lte:end_time},
    teacher_id:req.user._id
  })
  return res.json(responseObj(true,classes,null)) 
}

const resolveResourceRequests=async(req,res)=>{
  const materialResponse=await ResourceRequest.findOne({_id:req.body.resource_request_id},{class_id:1,message:1})
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
    
 
  await Class.updateOne({_id:classResponse._id},{$set:{materials:classResponse.materials}})
  await ResourceRequest.updateOne({_id:req.body.resource_request_id},{
      $set:{
          status:'Resolved'
      }
  })
  const AcademicManangerResponse=await AcademicManager.findOne({
    teachers:{
         $elemMatch: {
            $eq: req.user._id
        }
    }
})


  addNotifications(AcademicManangerResponse.user_id,"Resource Request resolved", "Resource Request resolved  by "+req.user.name+" of mesaage"+ materialResponse.message)
  
  
  return res.json(responseObj(true,[],'Resource Request resolved'))
}
else{
  return res.josn(resizeBy(false,null,"No File Found"))
}
}

const acceptRescheduledClass=async(req,res,next)=>{
  let details=await Class.findOne({
    _id:req.params._id
  })
  let classDetails= await Class.find({$and:[{
      start_time:req.body.start_time,
  },{$or:[{
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


  addNotifications(rescheduleacceptResponse.student_id,"Accepted Rescheduled Request","Accepted Rescheduled Request of subject "+rescheduleacceptResponse.subject.name+" on "+moment(rescheduleacceptResponse.start_time).format("DD-MM-YYYY")+ " at "+moment(rescheduleacceptResponse.start_time).format("HH:mm:ss")+ "by teacher"+ req.user.name)

  addNotifications(AcademicManangerResponse.user_id,"Accepted Rescheduled Request","Accepted Rescheduled Request of subject "+rescheduleacceptResponse.subject.name+" at time "+moment(rescheduleacceptResponse.start_time).format("DD-MM-YYYY")+" at "+moment(rescheduleacceptResponse.start_time).format("HH:mm:ss")+  "by teacher"+ req.user.name)


return res.json(responseObj(true,[],"Accepted Rescheduled Request"))

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

const getUpcomingClassDetails=async(req,res)=>{
  let classDetails = {}
  classDetails = await Class.findOne({ _id: req.query.class_id,end_time:{
    $gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
  } }, { start_time: 1, end_time: 1, details: 1, grade: 1, subject: 1, teacher_id: 1, notes: 1 }).populate({
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
  export {getUpcomingClassDetails,uploadClassMaterial,resolveResourceRequests,scheduleClass,acceptClassRequest,acceptRescheduledClass,getRescheduledClasses,getPastClasses,getTrialClassesRequests,getUpcomingClasses,getClasssBasedOnMonth,getClassesBasedOnDate,getTrialClassResponse,setReminder,rescheduleClass,addNotesToClass,getClassDetails,joinClass,leaveClass,addTask,addHomework,requestReUpload,reviewClass}
  