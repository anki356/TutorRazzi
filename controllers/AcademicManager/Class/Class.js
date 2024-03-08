import moment from "moment"
import AcademicManager from "../../../models/AcademicManager.js"
import Class from "../../../models/Class.js"
import ExtraClassRequest from "../../../models/ExtraClassRequest.js"
import HomeWork from "../../../models/HomeWork.js"
import Payment from "../../../models/Payment.js"
import Quote from "../../../models/Quote.js"
import ResourceRequest from "../../../models/ResourceRequest.js"
import { adminNewResourceRequest } from "../../../util/EmailFormats/adminNewResourceRequest.js"
import { homeworkEmail } from "../../../util/EmailFormats/homeworkEmail.js"
import { teacherResourceRequests } from "../../../util/EmailFormats/teacherResourceRequests.js"
import { responseObj } from "../../../util/response.js"
import sendEmail from "../../../util/sendEmail.js"
import Student from "../../../models/Student.js"
import Teacher from "../../../models/Teacher.js"
import Task from "../../../models/Task.js"
import Reminder from "../../../models/Reminder.js"
import User from "../../../models/User.js"
import Review from "../../../models/Review.js"
import {addNotifications} from "../../../util/addNotification.js"
import Attendance from "../../../models/Attendance.js"
import axios from "axios"
const joinClass = async (req, res, next) => {
  let classResponse = await Class.findOne({
      _id: req.body.class_id,
      status:"Scheduled"
  }, {
      start_time: 1,
      end_time: 1,
      student_id:1,
      subject:1,
      meeting_id:1,
      teacher_id:1
  })
if(classResponse===null){
  return res.json(responseObj(false,null,"Invalid Class"))
}
if (!(moment().utc().isBetween(moment.utc(classResponse.start_time,"YYYY-MM-DDTHH:mm:ss").subtract(5,'h').subtract(30,'m'), moment.utc(classResponse.end_time,"YYYY-MM-DDTHH:mm:ss").subtract(5,'h').subtract(30,'m')))) {      throw new Error('You cannot Join Class at this time')
  }
  console.log(classResponse.subject.name);
 


 
 
  let attendanceResponse = await Attendance.insertMany({
      check_in_datetime: moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss"),
      academic_manager_id: req.user._id,
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
    axios.post(`https://api.dyte.io/v2/meetings/${classResponse.meeting_id}/participants`,{name:'academic_manager',preset_name:'group_call_participant',custom_participant_id:req.user.email},{
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
     
     axios.post(`https://api.dyte.io/v2/meetings/${response.data.data.id}/participants`,{name:'academic_manager',preset_name:'group_call_participant',custom_participant_id:req.user.email},{
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

const markTaskDone=async(req,res)=>{
  const taskDetails=await Task.findOne({
_id:req.params._id
  })
  if(taskDetails===null){
    return res.json(responseObj(false,null,"Task is not present"))
  }
  await Task.updateOne({
    _id:req.params._id
  },{
    $set:{
      status:"Done"
    }
  })
  return res.json(responseObj(true,null,"Task Mark as done"))
}
const acceptTrialClassRequest = async (req, res, next) => {
  let details=await Class.findOne({_id:req.params._id})
  let classDetails = await Class.find({
    $and: [{
      start_time: details.start_time,
    }, {
      $or: [{
        teacher_id: details.teacher_id
      }, {
        student_id: details.student_id
      }]
    },{
      status:{
        $in:'Scheduled'
      }
    }]
  })
  if (classDetails.length > 0) {
    throw new Error("Class in this slot is booked already")
  }
 
  let classUpdateResponse=await  Class.updateMany({
    student_id:details.student_id,
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
  
   return res.json(responseObj(true, [], "Class Request Accepted"))


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
 
  addNotifications(details.student_id,"Accepted Class Request","Accepted Class Request of subject "+details.subject.name+" on "+moment(details.start_time).format("DD-MM-YYYY")+ " at "+moment(classDetails.start_time).format("HH:mm:ss")+ " by Academic Manager")
  
  addNotifications(details.teacher_id,"Accepted Class Request","Accepted Class Request of subject "+details.subject.name+" on "+moment(classDetails.start_time).format("DD-MM-YYYY")+" at "+moment(classDetails.start_time).format("HH:mm:ss")+" by Academic Manager")

  return res.json(responseObj(true, [],"Accepted Class Request"))
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
    student_id:details.student_id
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

addNotifications(rescheduleacceptResponse.student_id,"Accepted Rescheduled Request","Accepted Rescheduled Request of subject "+rescheduleacceptResponse.subject.name+" on  "+moment(rescheduleacceptResponse.start_time).format("DD-MM-YYYY")+" at "+moment(rescheduleacceptResponse.start_time).format("HH:mm:ss")+ " by Academic Manager")

addNotifications(rescheduleacceptResponse.teacher_id,"Accepted Rescheduled Request","Accepted Rescheduled Request of subject "+rescheduleacceptResponse.subject.name+" on "+moment(rescheduleacceptResponse.start_time).format("DD-MM-YYYY")+ " at "+moment(rescheduleacceptResponse.start_time).format("HH:mm:ss")+" by Academic Manager")

return res.json(responseObj(true,[],"Accepted Rescheduled Request"))

}
  


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
      student_id:details.student_id
  }]}]})

      if(classScheduled.length!==0){
       throw new Error('This time slot has been already scheduled')  
      }

const rescheduleClassResponse=await Class.findOneAndUpdate({_id:req.params._id},{$set:{
  is_rescheduled:true,
  start_time:moment(req.body.start_time).format("YYYY-MM-DDTHH:mm:ss"),
  end_time:moment(req.body.start_time).add(1,'h').format("YYYY-MM-DDTHH:mm:ss"),
  rescheduled_by:'academic_manager',
  status:'Pending'
  }})

  addNotifications(rescheduleClassResponse.student_id,"Class Rescheduled","Class of "+details.subject.name+" earlier scheduled for on  "+ moment(details.start_time).format("DD-MM-YYYY")+" at "+ moment(details.start_time).format("HH:mm:ss")+ " has been rescheduled for on  "+ moment(req.body.start_time).format("DD-MM-YYYY")+" at "+ moment(req.body.start_time).format("HH:mm:ss")+" by academic manager ")
  addNotifications(rescheduleClassResponse.teacher_id,"Class Rescheduled","Class of "+details.subject.name+" earlier scheduled for on  "+ moment(details.start_time).format("DD-MM-YYYY")+" at "+ moment(details.start_time).format("HH:mm:ss")+ " has been rescheduled at "+ moment(req.body.start_time).format("DD-MM-YYYY")+" at "+ moment(req.body.start_time).format("HH:mm:ss")+" by academic manager ")
  res.json(responseObj(true,[],"Class Rescheduled"))

  

}

const addExtraClassQuote = async (req, res, next) => {
  const gradeDetails=await Student.findOne({
    user_id:req.body.student_id
   },{
    grade:1
   })
    const extraClassQuoteResponse = await Quote.insertMany({
        class_count: req.body.class_count,
        amount: req.body.amount,
        teacher_id: req.body.teacher_id,
        student_id: req.body.student_id,
        subject_curriculum_grade: {
          subject: req.body.subject,
          curriculum:req.body.curriculum,
          grade:gradeDetails.grade.name

        },
        class_type: 'Extra',
        class_name:req.body.class_name

    })
    const paymentResponse=await Payment.create({
      amount:Number(req.body.amount)*Number(req.body.class_count),
      net_amount:Number(req.body.amount)*Number(req.body.class_count),
      sender_id:req.body.student_id,
      payment_type:"Credit",
      quote_id:extraClassQuoteResponse[0]._id
  })
addNotifications(req.body.student_id,"Extra Class Quotes added","Extra Class Quotes added for class_name "+req.body.class_name)
   return res.json(responseObj(true, {extraClassQuoteResponse,paymentResponse}, "Extra Class Quotes created"))
}

const getTrialClasses = async (req, res) => {
  const academicManagerResponse = await AcademicManager.findOne({ user_id: req.user._id }, { teachers: 1, students: 1 })
   
let options = {
    limit: req.query.limit,
    page: req.query.page,
    populate: [{
        path: "teacher_id",
        select: {
          name: 1
        }
    }, {
        path: "student_id",  // Assuming "student_id" is the correct field name to populate
        select: {
          name: 1
        },
        
    }],
    select: {
      subject: 1, start_time: 1, name: 1, status: 1, class_type: 1, student_id: 1, teacher_id: 1,"end_time":1,"is_rescheduled":1,"rescheduled_by":1
    }
};

let query = {
  student_id: { $in: academicManagerResponse.students },
  teacher_id: { $in: academicManagerResponse.teachers },
  class_type: "Trial",
  $or:[{
    status:{
    $nin:["Scheduled","Pending"]
    }
      },{
        status:{
          $in:["Scheduled","Pending"]
        },
        end_time:{
          $gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
        }
      }]
  
};


if(req.query.date) {
  query["start_time"] = {
    $gte: moment(req.query.date).format("YYYY-MM-DDTHH:mm:ss"),
    $lt: moment(req.query.date).add(1,'d').format("YYYY-MM-DDTHH:mm:ss")
  }
}

console.log(academicManagerResponse.students);

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
    {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
  ];
}
console.log("Query:", JSON.stringify(query, null, 2));
Class.paginate(query, options, (err, classResponse) => {
  if(err) {
    console.error(err);
    return res.status(500).json(responseObj(false, null, "Error retrieving classes"));
  }
  return res.json(responseObj(true, classResponse, "Trial Classes"));
});


}

const getRescheduledClasses=async (req, res) => {
    const academicManagerResponse = await AcademicManager.findOne({ user_id: req.user._id }, { teachers: 1, students: 1 })
    let options = {
        limit: req.query.limit,
        page: req.query.page,
        populate: [{
            path: "teacher_id",
            select:{
              name:1
            }
        }, {
            path: "student_id",
            select:{
              name:1
            }
        }],
        select:{
          "name":1,"subject":1,start_time:1,status:1, class_type:1,rescheduled_by:1
        }
    }

    let query = {
        student_id: {
            $in: academicManagerResponse.students
        },
        teacher_id: { $in: academicManagerResponse.teachers },
        is_rescheduled:true,
        end_time:{
          $gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
        },
        status:"Pending"

    }
  
  if(req.query.date){
    
query["start_time"]={
$gte : moment(req.query.date).format("YYYY-MM-DD"),$lt:moment(req.query.date).add(1,'d').format("YYYY-MM-DD")
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
        {"name":  {$regex: req.query.search, $options: 'i' }
         
        },
        {"student_id":{
          $in:student_ids.map((data)=>data._id)
        }},
        {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
      ];
    }
    Class.paginate(query, options, (err,classResponse) => {

        return  res.json(responseObj(true, classResponse, "Rescheduled Classes"))
    })

}

const getResourceRequests=async(req,res)=>{
    const academicManagerResponse= await AcademicManager.findOne({user_id:req.user._id},{teachers:1,students:1})
    const classResponse=await Class.find({
        student_id:{
            $in:academicManagerResponse.students,
            
        },
        teacher_id:{$in:academicManagerResponse.teachers},
    })
   let query={
    class_id:{$in:classResponse.map((data)=>data._id)},
   
   }
   if(req.query.search){
    query["$or"]=[
      {"message": {$regex: req.query.search,$options: 'i'}},
      {
        "class_id.subject.name":{$regex: req.query.search,$options: 'i'}
      },
     { "class_id.student_id.name":{$regex: req.query.search,$options: 'i'}},
     { "teacher_id.name":{$regex: req.query.search,$options: 'i'}},
     
    ]
      }
      if(req.query.date){
        query["createdAt"]={$gte:moment(req.query.date).format("YYYY-MM-DD"),$lte:moment(req.query.date).add(1,'d').format("YYYY-MM-DD")}
      }
      console.log(query)
   let options={
    limit:req.query.limit,
    page:req.query.page,
    populate:{
        path:'class_id',
        select:{
          student_id:1,subject:1,teacher_id:1,name:1
        },
        populate:[{
            path:'student_id',
            select:{
              name:1
            }
        },{
            path:"teacher_id",
            select:{
              name:1
            }
        }]
    }
   }
ResourceRequest.paginate(query,options,(err,result)=>{
    return res.json(responseObj(true,result,"Resource Requested"))
})

}

const notifyTeacher=async(req,res)=>{
  let details=await ResourceRequest.findOne({
    _id:req.body.resource_request_id
  })
  let classDetails=await Class.findOne({
    _id:details.class_id
  }).populate({
    path:"student_id",
    select:{
      "name":1
    }
  }).populate({
    path:"teacher_id",
    select:{
      "name":1
    }
  })
    const content=teacherResourceRequests(classDetails.student_id.name,details.message,classDetails.teacher_id.name,classDetails.subject.name,classDetails.grade.name)
    const teacherResponse=await User.findOne({_id:classDetails.teacher_id},{email:1})
    console.log(teacherResponse)
    addNotifications(classDetails.teacher_id,"Resource Requested",`Resource Requested by ${classDetails.student_id.name}. Resource:${details.message}, Class Name:${classDetails.subject.name}`)
    await sendEmail(teacherResponse.email,"Resource Requested",content)
    return  res.json(responseObj(true,[],"Successfully Notified teacher"))
}



const notifyStudent=async(req,res)=>{
  let details=await HomeWork.findOne({
    _id:req.body.homework_id
  })
  let classDetails=await Class.findOne({
    _id:details.class_id
  }).populate({
    path:"student_id",
    select:{
      "name":1
    }
  }).populate({
    path:"teacher_id",
    select:{
      "name":1
    }
  })
    const content=homeworkEmail(classDetails.student_id.name,details.title,classDetails.teacher_id.name,classDetails.subject.name,classDetails.grade.name)
    const studentResponse=await User.findOne({_id:classDetails.student_id},{email:1})
    await sendEmail(studentResponse.email,"Home Work Pending",content)
    addNotifications(classDetails.student_id,"Home Work Pending",`Homework: ${details.title} is given in Class Name: ${classDetails.subject.name}  By ${classDetails.teacher_id.name} is pending.Kindly Upload the Solution`)
    return  res.json(responseObj(true,[],"Successfully Notified Student for the homework"))
}

const resolveHomework=async(req,res)=>{
    const homeworkResponse=await HomeWork.findOneAndUpdate({
        _id:req.params.homework_id
    },{
        $set:{status:'Resolved'}
    })
    if(homeworkResponse===null){
      return res.json(responseObj(false,null,"Incorrect homework Id"))
    }
    const teacherDetails=await Class.findOne({
      _id:homeworkResponse.class_id
    })
addNotifications(teacherDetails.teacher_id,"Home Work Mark Comleted","HomeWork with title "+homeworkResponse.title+ " has been marked completed by Academic Manager")
    return res.json(responseObj(true,[],"Homework mark Completed"))
}

const getHomeworks=async(req,res)=>{
    const academicManagerResponse = await AcademicManager.findOne({ user_id: req.user._id }, { teachers: 1, students: 1 })   

    let query = {
        student_id: {
            $in: academicManagerResponse.students
        },
        teacher_id: { $in: academicManagerResponse.teachers },
        
    }
    let classResponse=await Class.find(query,{_id:1})
    query={
        class_id:{
            $in:classResponse.map((data=>{
                return data._id
            }))
        }
    }
    if(req.query.search){
      query["$or"]=[
        {
          title:{
            $regex: req.query.search,
            $options:'i'
          }
        },{
          description:{
              $regex: req.query.search,
            $options:'i'
          }
        }
      ]
    }
    if(req.query.date){
      query["createdAt"]={$gte:moment(req.query.date).format("YYYY-MM-DD"),$lte:moment(req.query.date).add(1,'d').format("YYYY-MM-DD")}

    }
    let options={
limit:req.query.limit,
page:req.query.page,
populate:{
    "path":"class_id",populate:[{
        path:"student_id"
    },{
        path:'teacher_id'
    }]},
   

    }
    HomeWork.paginate(query,options,(err,result)=>{
       
        return res.json(responseObj(true,result,"Homeworks"))
    }
    )

}

const getUpcomingClasses=async(req,res,next)=>{
  
  
    const academicManagerResponse = await AcademicManager.findOne({ user_id: req.user._id }, { teachers: 1, students: 1 })  
 
 
    let options={
      limit:req.query.limit?Number(req.query.limit):5,
      page:Number(req.query.page),
      populate:[{
        path:'teacher_id',
        select:{'name':1}
      },{
        path:'student_id',
        select:{'name':1}
      }],
      select:{
        "start_time":1,"subject":1,"name":1,"end_time":1,
        class_type:1
      }
  
    }
    let query={$and:[
     { end_time :{$gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")}},
      {student_id:{$in:academicManagerResponse.students}},
      {teacher_id:{$in:academicManagerResponse.teachers}},
      {status:'Scheduled'}
    ]
  
     
    }
    if(req.query.date&&req.query.date!==''){
      query["$and"].push({
        start_time:{$gte:moment(req.query.date).format("YYYY-MM-DD")},
        end_time:{
          $lt:moment(req.query.date).add(1,'d').format("YYYY-MM-DD")
        }
      })
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
      
      query ["$or"]=
         
          [
         
            { "subject.name": { $regex: req.query.search, $options: 'i' } },
            {"name":  {$regex: req.query.search, $options: 'i' }
             
            },
            {"student_id":{
              $in:student_ids.map((data)=>data._id)
            }},
            {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
          ]
         
       
     
        
       }
    
    if(req.query.student_id){
      query['student_id']=req.query.student_id;
    }
    if(req.query.teacher_id){
      query['teacher_id']=req.query.teacher_id;
    }

    const classData = await Class.paginate(query,options);
    const response = responseObj(true,classData,'')
    return res.json(response);
  
  }
  const getPastClasses=async(req,res,next)=>{
    const academicManagerResponse = await AcademicManager.findOne({ user_id: req.user._id }, { teachers: 1, students: 1 })  
   
    let query={$and:[
      {
  
        start_time :{$lt:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")},
      },
        {student_id:{$in:academicManagerResponse.students}},
        {teacher_id:{$in:academicManagerResponse.teachers}},
      {
        status:'Done'
      }
    ]
  
    }
    let options={
      limit:req.query.limit?Number(req.query.limit):5,
      page:Number(req.query.page),
      populate:[{
        path:'teacher_id',
        select:{'name':1}
      },{
        path:'student_id',
        select:{'name':1}
      }],
      select:{
        "start_time":1,"subject":1,"name":1, class_type:1
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
            {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
          ]
    }
    if(req.query.date&&req.query.date!==''){
      query["$and"].push({
        start_time:{$gte:moment(req.query.date).format("YYYY-MM-DD")},
        end_time:{
          $lt:moment(req.query.date).add(1,'d').format("YYYY-MM-DD")
        }
      })
    }
    if(req.query.student_id){
      query['student_id']=req.query.student_id;
    }
    if(req.query.teacher_id){
      query['teacher_id']=req.query.teacher_id;
    }
   
    Class.paginate(query,options,(err,result)=>{
      if(result){
        res.json(responseObj(true,result,'Past Class Details are here'))
      }
      
    })
   
  }
  const getClassDetails = async (req, res, next) => {
    let classDetails = {}
    classDetails = await Class.findOne({ _id: req.query.class_id,end_time:{
      $lte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
    } }, { start_time: 1, end_time: 1, details: 1, grade: 1, subject: 1, teacher_id: 1, notes: 1,  materials: 1, recordings: 1,response:1,reason_disliking:1,curriculum:1 }).populate({
      path: 'teacher_id', select: {
       name: 1,profile_image:1
      }
    }).populate({
      path: 'student_id', select: {
        name: 1,mobile_number:1,profile_image:1
      }
    })
    if(classDetails===null){
      return res.json(responseObj(false,null,"Invalid Class Id"))
    }
    let studentDetails=await Student.findOne({user_id:classDetails.student_id},{
      grade:1,
      curriculum:1,
      school:1,
      user_id:1
    })
    let teacherDetails=await Teacher.findOne({user_id:classDetails.teacher_id},{
    preferred_name:1,
    exp_details:1
  
    }).populate({
      path: 'user_id', select: {
        'profile_image': 1
      }
    })
    let homeworkResponse=await HomeWork.find({
      class_id:req.query.class_id
  }).populate({
    path:"answer_document_id"
  })
  let taskResponse=await Task.find({
      class_id:req.query.class_id
  })
    
    let reminderResponse = await Reminder.findOne({ class_id:req.query.class_id })
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

    res.json(responseObj(true, { classDetails: classDetails, reminderResponse: reminderResponse,studentDetails:studentDetails,homeworkResponse:homeworkResponse,taskResponse:taskResponse,teacherDetails:teacherDetails,ratingsResponse:classRatingsResponse?classRatingsResponse.rating:0,teacherRatings:teacherRatings?teacherRatings.rating:0 }, null))
  }
  const getTrialClassDetails = async (req, res, next) => {
    let classDetails = {}
    classDetails = await Class.findOne({ _id: req.query.class_id,class_type:"Trial" }, { start_time: 1, end_time: 1, details: 1, grade: 1, subject: 1, teacher_id: 1, notes: 1,  materials: 1, recordings: 1,response:1,reason_disliking:1,curriculum:1 }).populate({
      path: 'teacher_id', select: {
       name: 1,profile_image:1
      }
    }).populate({
      path: 'student_id', select: {
        name: 1,mobile_number:1,profile_image:1
      }
    })
    if(classDetails===null){
      return res.json(responseObj(false,null,"Invalid Class Id"))
    }
    let studentDetails=await Student.findOne({user_id:classDetails.student_id},{
      grade:1,
      curriculum:1,
      school:1,
      user_id:1
    })
    let teacherDetails=await Teacher.findOne({user_id:classDetails.teacher_id},{
    preferred_name:1,
    exp_details:1
  
    }).populate({
      path: 'user_id', select: {
        'profile_image': 1
      }
    })
    let homeworkResponse=await HomeWork.find({
      class_id:req.query.class_id
  }).populate({
    path:"answer_document_id"
  })
  let taskResponse=await Task.find({
      class_id:req.query.class_id
  })
    
    let reminderResponse = await Reminder.findOne({ class_id:req.query.class_id })
    
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
  
    res.json(responseObj(true, { classDetails: classDetails, reminderResponse: reminderResponse,studentDetails:studentDetails,homeworkResponse:homeworkResponse,taskResponse:taskResponse,teacherDetails:teacherDetails ,ratingsResponse:classRatingsResponse?classRatingsResponse.rating:0,teacherRatings:teacherRatings?teacherRatings.rating:0}, null))
  }
  const getQuotes=async(req,res)=>{
    let classDetails = {}
    classDetails = await Class.findOne({ _id: req.query.class_id,class_type:"Trial" }, { start_time: 1, end_time: 1, details: 1, grade: 1, subject_id: 1, teacher_id: 1, notes: 1,  materials: 1, recordings: 1,response:1,reason_disliking:1,curriculum:1 }).populate({
      path: 'teacher_id', select: {
       name: 1,profile_image:1
      }
    }).populate({
      path: 'student_id', select: {
        name: 1,mobile_number:1,profile_image:1
      }
    })
    if(classDetails===null){
      return res.json(responseObj(false,null,"Invalid Class Id"))
    }
    let query={
      student_id:classDetails.student_id,
      "subject_curriculum_grade.curriculum":classDetails.curriculum.name,
      "subject_curriculum_grade.grade":classDetails.grade.name
    }
    let options={
      limit:req.query.limit,
      page:req.query.page,
      populate:{
        path:'teacher_id',
      }
    }
     
    
    Quote.paginate(query,options,(err,result)=>{
      let is_pricing=false
    if(result.docs.length>0){
      is_pricing=true
    }
return res.json(responseObj(true,{result:result,is_pricing:is_pricing},"All Quotes"))
    })
   
  }
  const reviewClass=async(req,res,next)=>{
    let reviewResponse=await Review.findOne({
      class_id:req.body.class_id,
      given_by:req.user._id
    })
    if(!reviewResponse){
      reviewResponse=await Review.insertMany({
        class_id:req.body.class_id,
        message:req.body.message?req.body.message:'',
        rating:req.body.rating,
        given_by:req.user._id
    })
    }
    else{
      reviewResponse=await Review.updateOne({
        _id:reviewResponse._id
      },{
        $set:{
          message:req.body.message?req.body.message:'',
          rating:req.body.rating,
        }
      })
    }
     
   
    return res.json(responseObj(true,reviewResponse,"Class Review Recorded"))
  }
  const reviewTeacher = async (req, res, next) => {
    let reviewResponse=await Review.findOne({
      class_id:req.body.class_id,
      given_by:req.user._id,
      teacher_id:req.body.teacher_id
    })
    if(!reviewResponse){
      reviewResponse = await Review.insertMany({
        message: req.body.message?req.body.message:'',
        rating: req.body.rating,
        teacher_id: req.body.teacher_id,
        class_id: req.body.class_id,
        given_by:req.user._id
    })
    }
    else{
      reviewResponse=await Review.updateOne({
        _id:reviewResponse._id
      },{
        $set:{
          message:req.body.message?req.body.message:'',
          rating:req.body.rating,
        }
      })
    }
     
   
    return res.json(responseObj(true,reviewResponse,"Teacher Review Recorded"))
    

}

const getExtraClassRequests=async(req,res)=>{
  const students=await AcademicManager.findOne({user_id:req.user._id},{students:1})
  let classes=await Classes.find({student_id:{
    $in:students
  }},{
    _id:1
  })
  let extraClassRequests=await ExtraClassRequest.find({
    class_id:{
      $in:classes.map((data)=>data._id)
    }
  })
  return res.json(responseObj(true,extraClassRequests,"Extra Class Requests"))
}

const getUpcomingClassDetails=async(req,res)=>{
  let classDetails = {}
  classDetails = await Class.findOne({ _id: req.query.class_id ,end_time:{
    $gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
  }}, { start_time: 1, end_time: 1, details: 1, grade: 1, subject: 1, teacher_id: 1, notes: 1,materials:1 }).populate({
    path: 'teacher_id', select: {
     name: 1,profile_image:1
    }
  }).populate({
    path: 'student_id', select: {
      name: 1,mobile_number:1,profile_image:1
    }
  })
  if(classDetails===null){
    return res.json(responseObj(false,null,"Invalid Class Id"))
  }
  let studentDetails=await Student.findOne({user_id:classDetails.student_id},{
    grade:1,
    curriculum:1,
    school:1,
user_id:1

  })
  let teacherDetails=await Teacher.findOne({user_id:classDetails.teacher_id},{
    degree_details:1,
  preferred_name:1,

  }).populate({
    path: 'user_id', select: {
      'profile_image': 1
    }
  })
 
  
  let reminderResponse = await Reminder.findOne({ class_id:req.query.class_id })
  res.json(responseObj(true, { classDetails: classDetails, reminderResponse: reminderResponse,studentDetails:studentDetails,teacherDetails:teacherDetails }, null))
}
const requestReUpload=async(req,res)=>{
  const homeworkResponse=await HomeWork.findOneAndUpdate({
   
        _id:req.params.home_work_id
      
  },{
   is_reupload:true,
   status:"Pending"
  })
  const studentDetails=await Class.findOne({
    _id:homeworkResponse.class_id
  })
  addNotifications(studentDetails.student_id,"Request for Re Upload of Homework placed", "Request for Re Upload of Homework placed of Title "+ homeworkResponse.title)
  res.json(responseObj(true,[],"Request for Re Upload of Homework placed Successfully"))


}

export {requestReUpload,markTaskDone,getRescheduledClasses, acceptClassRequest, reviewClass,reviewTeacher,getClassDetails,getPastClasses,getUpcomingClasses,getHomeworks, addExtraClassQuote, getTrialClasses,getResourceRequests,notifyTeacher,notifyStudent,resolveHomework,acceptTrialClassRequest ,rescheduleClass,getUpcomingClassDetails,getTrialClassDetails,getQuotes,joinClass}

