
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
  classDetails = await Class.findOne({ _id: new ObjectId(req.query.class_id) }, { start_time: 1, end_time: 1, description: 1, grade: 1, subject: 1, teacher_id: 1, notes: 1,  materials: 1, recordings: 1,class_type:1 }).populate({
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
})
let taskResponse=await Task.find({
    class_id:req.query.class_id
})
  
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
const addTask = async (req, res, next) => {
  let classDetails=await Class.findOne({
    _id:req.body.class_id
  })
  if(classDetails===null){
    throw new Error("No class Found")
  }
  let taskResponse = await Task.create({
    title: req.body.title,
    description: req.body.description,
    due_date: req.body.due_date,
  class_id:req.body.class_id})

  
  
  res.json(responseObj(true, [], "Task Created Successfully"))
}
const rescheduleClass=async(req,res,next)=>{
  let details=await Class.findOne({
    _id:req.params._id
  })
  if(details===null){
    throw new Error("No Class Found")
  }
  let classScheduled=await Class.find({$and:[{
      start_time:req.body.start_time,
  },{$or:[{
      teacher_id:req.user._id
  },{
      student_id:details.student_id
  }]}]})

      if(classScheduled.length!==0){
       throw new Error('This time slot has been already scheduled')  
      }

const rescheduleClassResponse=await Class.updateOne({_id:new ObjectId(req.params._id)},{$set:{
  is_rescheduled:true,
  start_time:moment(req.body.start_time).format("YYYY-MM-DDTHH:mm:ss"),
  end_time:moment(req.body.start_time).add(1,'h').format("YYYY-MM-DDTHH:mm:ss"),
  rescheduled_by:"teacher",
  status:'Pending'
  }})
  res.json(responseObj(true,[],"Class Rescheduled Successfully"))

}
const getPastClasses = async (req, res, next) => {
  
  let query = {
    $and: [
      {

        start_time: { $lt: moment().format("YYYY-MM-DDTHH:mm:ss") },
      }, {
        teacher_id: new ObjectId(req.user._id),

      },
      {
        status: 'Done'
      }
    ]

  }
  let options = {
    limit: req.query.limit ? Number(req.query.limit) : 5,
    page: Number(req.query.page),
   populate:{
    "path":"student_id",
    select:{
      "name":1
    }
   }
  }
  if (req.query.search) {
    query = {
      $and: [
        {

          start_time: { $lt: moment().format("YYYY-MM-DDTHH:mm:ss") },
        }, {
          teacher_id: new ObjectId(req.user._id),

        },
        {
          status: 'Done'
        }, {
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
            },
            {
              name: {
    
                $regex: req.query.search,
                $options: 'i'
              }
            }



          ]
        },
       
      ]

    }
  }
  
  Class.paginate(query, options, (err, result) => {
    if (result) {
      if(result.docs.length===0){
        return res.json(responseObj(false, result, "No Data found"))
      }
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
    populate:{
      "path":"teacher_id",
      select:{
        "name":1
      }
    }
  }
  let query = {
    $and: [
      {

        start_time: { $gte: moment().format("YYYY-MM-DDTHH:mm:ss") },
      }, {
        teacher_id: req.user._id,

      },
      {
        is_rescheduled: true
      }, {
        status: 'Pending'
      }]
  }
  if (req.query.search) {
    query = {
      $and: [
        {

          start_time:  { $gte: moment().format("YYYY-MM-DDTHH:mm:ss") },
        }, {
          teacher_id: req.user._id,

        },
        {
          is_rescheduled: true
        }, {
          status: 'Pending'
        }, {
          $or:
            [
              {
                "subject.name": {
                  $regex: req.query.search,
                  $options: 'i'
                }
              }, {
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
              },{
                name:{
                  $regex: req.query.search,
                  $options: 'i'
                }
              }



            ]

        }
      ]


    }
  }
  Class.paginate(query, options, (err, result) => {
    if (result) {
      if(result.docs.length===0){
        return res.json(responseObj(false, result, "No Data found"))
      }
      
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
  ClassMaterials.materials.push({name:req.files[0].filename})
  let classResponse=await Class.updateOne({
    _id : req.params._id},{$set:{ materials:ClassMaterials.materials}});
  res.json(responseObj(true,[],"Class Materials Uploaded Successfully"))
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
    _id: req.body.class_id
  }, {
    start_time: 1,
    end_time: 1,
    student_id:1
  })

  if (!moment(req.body.check_in_datetime).isBetween(moment(classResponse.start_time), moment(classResponse.end_time))) {
   throw new Error("You cannot Join Class at this time")
  }
  
  attendanceResponse=await Attendance.findOne({
    student_id:classResponse.student_id,
    class_id:req.body.class_id
   })
   if(attendanceResponse!==null){
    classResponse = await Class.findOneAndUpdate({
        _id: req.body.class_id
    }, {

        $set: {
            status: 'Done'
        }
    })
   }
  attendanceResponse = await Attendance.insertMany({
    check_in_datetime: moment(req.body.check_in_datetime).format("YYYY-MM-DDTHH:mm:ss"),
    teacher_id: req.user._id,
    class_id: req.body.class_id,

  })
  return res.json(responseObj(true, attendanceResponse, null))

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
    _id : req.params.classId
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
  req.files.forEach((data)=>{

    classResponse.materials.push({
          name:data.fileName
      })
  })
  await Class.updateOne({_id:req.body.class_id},{$set:{materials:classResponse.materials}})
  await ResourceRequest.updateOne({_id:req.body.resource_request_id},{
      $set:{
          status:'Resolved'
      }
  })
  return res.json(responseObj(true,[],'Resource Request resolved'))
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
  classDetails = await Class.findOne({ _id: req.query.class_id }, { start_time: 1, end_time: 1, details: 1, grade: 1,  teacher_id: 1, notes: 1,student_id:1,subject:1 })
  if(classDetails===null){
    throw new Error("Incorrct Class Id")
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

export {getUpcomingClassDetails,scheduleClass,resolveResourceRequests, requestReUpload,getClassesBasedOnDate,reviewClass,setReminder,uploadClassMaterial, acceptRescheduledClass,getClassDetails, addTask, rescheduleClass, getRescheduledClasses, addHomework, addNotesToClass, joinClass, leaveClass, getPastClasses }