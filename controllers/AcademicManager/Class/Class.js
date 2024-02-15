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
    $and: [{
      start_time: req.body.start_time,
    }, {
      $or: [{
        teacher_id: req.user._id
      }, {
        student_id: req.body.student_id
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
  return res.json(responseObj(true, [], null))
}else{
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

  rescheduled_by:req.user._id

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
return res.json(responseObj(true,[],"Accepted Rescheduled Request"))

}
  


}

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
  rescheduled_by:req.user._id,
  status:'Pending'
  }})
  res.json(responseObj(true,[],null))

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
          grade:gradeDetails.grade

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
      subject: 1, start_time: 1, name: 1, status: 1, class_type: 1, student_id: 1, teacher_id: 1,"end_time":1
    }
};

let query = {
  student_id: { $in: academicManagerResponse.students },
  teacher_id: { $in: academicManagerResponse.teachers },
  class_type: "Trial"
};

if(req.query.date) {
  query["start_time"] = {
    $gte: moment(req.query.date).format("YYYY-MM-DD"),
    $lt: moment(req.query.date).add(1,'d').format("YYYY-MM-DD")
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
          name:1,subject:1,start_time:1,status:1, class_type:1
        }
    }

    let query = {
        student_id: {
            $in: academicManagerResponse.students
        },
        teacher_id: { $in: academicManagerResponse.teachers },
        is_rescheduled:true,
        start_time:{
          $gte:moment().format("YYYY-MM-DDTHH:mm:ss")
        }

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
        query["createdAt"]=moment(req.query.date).format("YYYY-MM-DD")
      }
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
    return  res.json(responseObj(true,[],"Successfully Notified Student for the homework"))
}

const resolveHomework=async(req,res)=>{
    const homeworkResponse=await HomeWork.updateOne({
        _id:req.params.homework_id
    },{
        $set:{status:'Resolve'}
    })
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
        "start_time":1,"subject":1,"name":1,
        class_type:1
      }
  
    }
    let query={$and:[
     { start_time :{$gte:moment().format("YYYY-MM-DDTHH:mm:ss")}},
      {student_id:{$in:academicManagerResponse.students}},
      {teacher_id:{$in:academicManagerResponse.teachers}},
      {status:'Scheduled'}
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
      
      query={$and:[
        { start_time :{$gte:moment().format("YYYY-MM-DDTHH:mm:ss")}},
       
        {student_id:{$in:academicManagerResponse.students}},
        {teacher_id:{$in:academicManagerResponse.teachers}},
     
       
         {status:'Scheduled'},{
          $or:
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
       ]
     
        
       }
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
  
        start_time :{$lt:moment().format("YYYY-MM-DDTHH:mm:ss")},
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
      query={$and:[
        {
    
          start_time :{$lt:format("YYYY-MM-DDTHH:mm:ss")},
        }, {student_id:{$in:academicManagerResponse.students}},
        {teacher_id:{$in:academicManagerResponse.teachers}},

        {
          status:'Done'
        },{
          $or: [
         
            { "subject.name": { $regex: req.query.search, $options: 'i' } },
            {"name":  {$regex: req.query.search, $options: 'i' }
             
            },
            {"student_id":{
              $in:student_ids.map((data)=>data._id)
            }},
            {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
          ]
        }
      ]}
      
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
      $lte:moment().format("YYYY-MM-DDTHH:mm:ss")
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
      school:1
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
    let studentDetails=await Student.findOne({user_id:classDetails.student_id},{
      grade:1,
      curriculum:1,
      school:1
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
    let ratingsResponse=await Review.findOne({
      class_id:req.query.class_id
    })
    
  
    res.json(responseObj(true, { classDetails: classDetails, reminderResponse: reminderResponse,studentDetails:studentDetails,homeworkResponse:homeworkResponse,taskResponse:taskResponse,teacherDetails:teacherDetails ,ratingsResponse:ratingsResponse}, null))
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
  classDetails = await Class.findOne({ _id: req.query.class_id ,start_time:{
    $gte:moment().format("YYYY-MM-DDTHH:mm:ss")
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
    school:1
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
  await HomeWork.updateOne({
   
        _id:req.params.home_work_id
      
  },{
   is_reupload:true,
   status:"Pending"
  })
  res.json(responseObj(true,[],"Request for Re Upload of Homework placed Successfully"))

}
export {requestReUpload,markTaskDone,getRescheduledClasses, acceptClassRequest, reviewClass,reviewTeacher,getClassDetails,getPastClasses,getUpcomingClasses,getHomeworks, addExtraClassQuote, getTrialClasses,getResourceRequests,notifyTeacher,notifyStudent,resolveHomework,acceptTrialClassRequest ,rescheduleClass,getUpcomingClassDetails,getTrialClassDetails,getQuotes}

