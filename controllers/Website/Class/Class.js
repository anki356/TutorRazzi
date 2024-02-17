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
const objectId=mongoose.Types.ObjectId
const rescheduleClass=async(req,res,next)=>{
  let details=await Class.findOne({
    _id:req.params._id
  })
  let classScheduled=await Class.find({$and:[{
      start_time:req.body.start_time,
  },{$or:[{
      teacher_id:details.teacher_id
  },{
      student_id:details.student_id
  }]}]})

      if(classScheduled.length!==0){
       throw new Error('This time slot has been already scheduled')  
      }

const rescheduleClassResponse=await Class.updateOne({_id:req.params._id},{$set:{
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
  addNotifications(rescheduleClassResponse.teacher_id,"Class Rescheduled","Class of "+details.subject.name+" which was earlier scheduled at "+ moment(details.start_time).format("DD-MM-YYYYTHH:mm:ss")+ "has been rescheduled at "+ moment(req.body.start_time).format("DD-MM-YYYYTHH:mm:ss")+"by student "+req.user.name )
  addNotifications(AcademicManangerResponse.user_id,"Class Rescheduled","Class of "+details.subject.name+" which was earlier scheduled at "+ moment(details.start_time).format("DD-MM-YYYYTHH:mm:ss")+ "has been rescheduled at "+ moment(req.body.start_time).format("DD-MM-YYYYTHH:mm:ss")+"by student "+req.user.name )
  res.json(responseObj(true,[],null))

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
     { start_time :{$gte:moment().format("YYYY-MM-DDTHH:mm:ss")}},
    
      {student_id:req.user._id},
  
    
      {status:'Scheduled'}
    ]
  
     
    }
    if(req.query.search){
      query={$and:[
        { start_time :{$gte:moment().format("YYYY-MM-DDTHH:mm:ss")}},
       
         {student_id:req.user._id},
     
       
         {status:'Scheduled'},{
          $or:
            [
              { "subject.name":{
                 $regex:req.query.search,
                 $options:'i'
               }}, { "curriculum.name":{
              
                $regex:req.query.search,
                $options:'i'
              }},
              { "grade.name":{
                  
                $regex:req.query.search,
                $options:'i'
              }},
             { name:{
                $regex:req.query.search,
                $options:'i'
              }}
             
       
       
             ]
          
         }
       ]
     
        
       }
    }
    const classData = await Class.paginate(query,options);
    const response = responseObj(true,classData,'')
    return res.json(response);
  
  }
  const getPastClasses=async(req,res,next)=>{
   
   
    let query={$and:[
      {
  
        start_time :{$lt:moment().format("YYYY-MM-DDTHH:mm:ss")},
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
    if(req.query.search){
      query={$and:[
        {
    
          start_time :{$lt:new Date()},
        },{
          student_id:req.user._id,
    
        },
        {
          status:'Done'
        },{
          $or: [
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
          }},
          {
            name:{
              $regex:req.query.search,
              $options:'i'
            }
          }
        
     
     
           ]
        }
      ]
    
      }
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
      start_time:{
        "$gte":moment().format("YYYY-MM-DDTHH:mm:ss")
      }
    }]}
    if(req.query.search){
      query={$and:[{
        student_id:req.user._id,
        class_type:'Trial',
        start_time:{
          "$gte":moment().format("YYYY-MM-DDTHH:mm:ss")
        },$or:
          [
            { "subject.name":{
               $regex:req.query.search,
               $options:'i'
             }}, { "curriculum.name":{
            
              $regex:req.query.search,
              $options:'i'
            }},
            { "grade.name":{
                
              $regex:req.query.search,
              $options:'i'
            }},{
              name:{
                
                $regex:req.query.search,
                $options:'i'
              }
            }
           
     
     
           ]
        
      }]}
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
      $lte:moment().format("YYYY-MM-DDTHH:mm:ss")
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
let classReview=await Review.findOne({
  class_id:req.query.class_id,
  given_by:parentDetails.parent_id
})
let teacherReview=await Review.findOne({
  class_id:req.query.class_id,
  given_by:parentDetails.parent_id,
  teacher_id:classDetails.teacher_id
})



    res.json(responseObj(true, {classDetails:classDetails,homeworkResponse:homeworkResponse,taskResponse:taskResponse,teacherResponse:teacherResponse,classReview:classReview,teacherReview:teacherReview}, "Class Details successfully fetched"))
}
const getHomeworks=async(req,res)=>{
  let homeworkResponse=await HomeWork.find({
    class_id:req.query.class_id
})
res.json(responseObj(true, {homeworkResponse:homeworkResponse}, "HomeWork Details successfully fetched"))
}
const getTasks=async(req,res)=>{
  let taskResponse=await Task.find({
    class_id:req.query.class_id
})
res.json(responseObj(true, {taskResponse:taskResponse}, "Task Details successfully fetched"))
}

const getUpcomingClassDetails=async(req,res)=>{
  let classDetails = {}
  classDetails = await Class.findOne({ _id: req.query.class_id,
    start_time:{
      $gte:moment().format("YYYY-MM-DDTHH:mm:ss")
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
    $and: [{
      start_time: req.body.start_time,
    }, {
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
  addNotifications(classDetails.teacher_id,"Accepted Class Request","Accepted Class Request of subject "+classDetails.subject.name+" on "+moment(classDetails.start_time).format("DD-MM-YYYY")+"at time "+moment(classDetails.start_time).format("HH:mm:ss")+ " by student"+ req.user.name)
  
  addNotifications(AcademicManangerResponse.user_id,"Accepted Class Request","Accepted Class Request of subject "+classDetails.subject.name+" on "+moment(classDetails.start_time).format("DD-MM-YYYY")+ "at time "+moment(classDetails.start_time).format("HH:mm:ss")+ " by student"+ req.user.name)

  return res.json(responseObj(true, null, "Acceped Class Request"))
}else{
  let classDetails= await Class.find({$and:[{
    start_time:req.body.start_time,
},{$or:[{
    teacher_id:details.teacher_id
},{
    student_id:req.user._id
}]},{
  status:"Scheduled"
}]})
if(classDetails.length!==0){
throw new Error("Slot Already Booked")
   
}
let classResponse=await Class.findOne(
{_id:req.params._id,

  rescheduled_by:'academic_manager'

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
const AcademicManangerResponse=await AcademicMananger.findOne({
  students:{
       $elemMatch: {
            $eq: req.user._id
        }
  }
})
addNotifications(rescheduleacceptResponse.teacher_id,"Accepted Rescheduled Request","Accepted Rescheduled Request of subject "+rescheduleacceptResponse.subject.name+" on "+moment(rescheduleacceptResponse.start_time).format("DD-MM-YYYY")+"at time "+moment(rescheduleacceptResponse.start_time).format("HH:mm:ss")+ " by student "+ req.user.name)

addNotifications(AcademicManangerResponse.user_id,"Accepted Rescheduled Request","Accepted Rescheduled Request of subject "+rescheduleacceptResponse.subject.name+" on "+moment(rescheduleacceptResponse.start_time).format("DD-MM-YYYY")+"at time "+moment(rescheduleacceptResponse.start_time).format("HH:mm:ss")+ "  student "+ req.user.name)


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
  
            start_time :{$gte:new Date().toLocaleDateString()},
          },{
            student_id:req.user._id,
  
          },
          {
            is_rescheduled:true
          },{
            status:'Pending'
          }]
        }
    if(req.query.search){
        query={$and:[
          {
  
            start_time :{$gt:new Date().toLocaleDateString()},
          },{
            student_id:req.user._id,
  
          },
          {
            is_rescheduled:true
          },{
            status:'Pending'
          },{
            $or:
              [
                { "subject.name":{
                   $regex:req.query.search,
                   $options:'i'
                 }}, { "curriculum.name":{
                
                  $regex:req.query.search,
                  $options:'i'
                }},
                { "grade.name":{
                    
                  $regex:req.query.search,
                  $options:'i'
                }},{
                  name:{
                    
                    $regex:req.query.search,
                    $options:'i'
                  }
                }
               
         
         
               ]
            
           }
         ]
       
          
         }
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
   const parentResponse=await Student.findOne({
    user_id:req.user._id
   },{parent_id:1})
    const reviewResponse = await Review.insertMany({
        class_id: req.body.class_id,
        message: req.body?.message,
        rating: req.body.ratings,
        given_by:parentResponse.parent_id
    })

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
const AcademicManangerResponse=await AcademicMananger.findOne({
   students:{
        $elemMatch: {
           $eq: req.user._id
       }
   }
})
addNotifications(teacherDetails.teacher_id,"Task marked Done"," Task has been marked as done given to "+req.user.name+ " in class for subject "+teacherDetails.subject+" on "+ moment(teacherDetails.start_time).format("DD-MM-YYYY")+ " at "+moment(teacherDetails.start_time).format("HH:mm:ss" )+ " with name "+taskResponse.title)
addNotifications(AcademicManangerResponse.user_id,"Task marked Done"," Task has been marked as done given to "+req.user.name+ " in class for subject "+teacherDetails.subject+" on "+ moment(teacherDetails.start_time).format("DD-MM-YYYY")+ " at "+moment(teacherDetails.start_time).format("HH:mm:ss" )+ " with name "+taskResponse.title)
   res.json(responseObj(true, [], "Task Marked Done"))
  
}
const uploadHomework = async (req, res, next) => {
   let documentResponse = await Document.create({
       name: req.files[0].filename
   })
let homeworkResponse=await HomeWork.findOne({
   _id:req.params._id
})
if(homeworkResponse===null){
  return res.json(responseObj(false,null,"Invalid Homework Id"))
}
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
       answer_document_id:documentResponse._id
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
addNotifications(teacherDetails.teacher_id,"Home work uploaded"," Home work uploaded given to "+req.user.name+" in class for subject "+teacherDetails.subject+" on "+ moment(teacherDetails.start_time).format("DD-MM-YYYY")+ " at "+moment(teacherDetails.start_time).format("HH:mm:ss" )+ " with name "+homeworkResponse.title )
addNotifications(AcademicManangerResponse.user_id,"Home work uploaded"," Home work uploaded given to "+req.user.name+" in class for subject "+teacherDetails.subject+" on "+ moment(teacherDetails.start_time).format("DD-MM-YYYY")+ " at "+moment(teacherDetails.start_time).format("HH:mm:ss")+ " with name "+homeworkResponse.title )
   res.json(responseObj(true, [], "Home work uploaded"))
}
  export {setReminder,acceptClassRequest,rescheduleClass,getPastClasses,getUpcomingClasses,getClassDetails,getUpcomingClassDetails,getRescheduledClasses,getTrialClasses,reviewClass,markTaskDone,uploadHomework,getHomeworks,getTasks}