import Class from "../../../models/Class.js"
import Attendance from "../../../models/Attendance.js"
import { responseObj } from "../../../util/response.js"
import mongoose from "mongoose"
import User from "../../../models/User.js"
import Student from "../../../models/Student.js"
import Payment from "../../../models/Payment.js"
import Grade from "../../../models/Report.js"
import Exam from "../../../models/Exam.js"
const ObjectID= mongoose.Types.ObjectId
import moment from 'moment-timezone'
import Report from "../../../models/Report.js"
import HomeWork from "../../../models/HomeWork.js"
import Parent from "../../../models/Parent.js"
import makeId from "../../../util/makeId.js"
import bcrypt from 'bcrypt'
import sendEmail from "../../../util/sendEmail.js"
const getTotalClasses=async(req,res,next)=>{
 
const getTotalClassesResponse= await Class.aggregate([
    {
      $match:{$and :[{
        student_id:req.user._id // Match documents where the objectIds array contains the specified ObjectID
      },{
        status:{$in:['Scheduled','Done']}
      }]}
    },
    {
      $count: "totalDocuments" // Count the matching documents
    }
])
if(getTotalClassesResponse.length===0){

    res.json(responseObj(true,0,[]))
}
else{
    res.json(responseObj(true,getTotalClassesResponse[0]["totalDocuments"],''))
}
}
const getTotalClassesAttended=async(req,res,next)=>{
 
  let totalClassesAttended=[]
  totalClassesAttended=await Attendance.find({student_id:req.user._id})
  res.json(responseObj(true,totalClassesAttended.length,''))

}
const getHomework=async(req,res,next)=>{
 
  let query={
    student_id:req.user._id
  }
  let ClassResponse=await Class.find(query,{_id:1})
  const options={
    limit:Number(req.query.limit),
    page:Number(req.query.page),
   
  }
query={
  class_id:{
    $in:ClassResponse
  }
}
let pending=0
let completed=0
   HomeWork.paginate(query,options,(err,result)=>{
    
   result.docs.forEach((data)=>{
      if(data.status==='Pending'){
        pending+=1
      }
      else{
        completed+=1
      }
    })
    res.json(responseObj(true,{result:result,pending:pending,completed:completed},null))
   })
  
 
}
const getUpcomingClasses = async (req, res, next) => {
  
  
  let options = {
    limit: req.query.limit ? Number(req.query.limit) : 5,
    page: Number(req.query.page),
    populate:[{
      path:'teacher_id',
      select:{
        name:1
      }
    }],
    select:{
      "subject":1,"name":1,"start_time":1,"end_time":1
    }
  }
  let query = {
    $and: [
      { end_time: { $gte: moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss") } },

      { teacher_id: req.user._id },


      { status: 'Scheduled' }
    ]


  }
  if(req.query.search){
    let teacher_ids=await User.find({
      name:{
        $regex: req.query.search, $options: 'i' 
      }
      })
     
    
    query[ "$or"]=
        [
       
          { "subject.name": { $regex: req.query.search, $options: 'i' } },
          {"name":  {$regex: req.query.search, $options: 'i' }
           
          },
          // {"student_id":{
          //   $in:student_ids.map((data)=>data._id)
          // }},
          {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
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
  if(req.query.teacher_id){
    query.teacher_id=req.query.teacher_id
  }
  Class.paginate(query, options, (err, results) => {
    if (results) {
      res.json(responseObj(true, results, null))
    }
  })

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
      res.json(responseObj(true,result,'Past Class Details are here'))
    }
    
  })
 
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
const getTrialClasses=async(req,res,next)=>{
 
  let query={$and:[{
    student_id:req.user._id,
    class_type:'Trial',
    start_time:{
      "$gte":new Date()
    }
  }]}
  if(req.query.search){
    query={$and:[{
      student_id:req.user._id,
      class_type:'Trial',
      start_time:{
        "$gte":new Date()
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
// const getPendingPaymentClasses=async (req,res,next)=>{
//   let pendingpaymentclass=[];
//   pendingpaymentclass=    await Class.aggregate([{
// $match:{
//   $and:[
//     {payment_status:'Unpaid'},
//     {student_id:new ObjectID(req.user.student_id)},
//     {
// is_rescheduled:true
//     }
//   ]
// }
//   },{
//     $project:{
//       subject_id:1,
//       start_date:1,
//       end_date:1
//     }
//   },{$limit:req.query.limit?Number(req.query.limit):5},{
//     $skip:req.query.offset
//   }])
//   res.json(responseObj(true,pendingpaymentclass,null))
// }
const getWatchTime=async(req,res,next)=>{
 
  let watchtime=0;
  const attendanceResponse=await Attendance.find({student_id:req.user._id},{check_in_datetime:1,check_out_datetime:1})


  attendanceResponse.forEach((data,index)=>{
  watchtime+=moment(data.check_out_datetime).diff(moment(data.check_in_datetime),'H')
})
res.json(responseObj(true,watchtime,''))
}
const editUserProfile=async(req,res)=>{
  User.updateOne({
    _id:req.user._id
  },{
    $set:{
      profile_image:req.files[0].filename,
      name:req.body.name
    }
  })
  let password= await  bcrypt.hash(makeId(5), 10)
 let parentResponse=await User.create({
email:req.body.parent_email_address,
password:password,
mobile_number:req.body.parent_mobile_number,
role:'parent'
 })
 sendEmail(req.body.parent_email_address,"New Account Created","Your Account is created and password is "+password)
 let studentResponse=await Student.findOne({
  user_id:req.user._id
 })
 if(studentResponse===null){

 
 studentResponse=await Student.create({
      preferred_name:req.body.name,
      user_id:req.user._id,
      gender:req.body.gender,
      city:req.body.city,
      state:req.body.state,
      country:req.body.country,
      grade:{name:req.body.grade},
      age:req.body.age,
      parent_id:parentResponse._id,
      school:req.body.school,
      address:req.body.address,
      subjects:[
          {
              name:req.body.subject[0]
          },{
              name:req.body.subject[1]
          },{
              name:req.body.subject[2]
          }
      ],
      curriculum:{
          name:req.body.curriculum
      },
      pincode:req.body.pincode

  })
}
else{
  studentResponse =await Student.updateOne({
    user_id:req.user._id
  },{
    $set:{
      preferred_name:req.body.name,
      gender:req.body.gender,
      city:req.body.city,
      state:req.body.state,
      country:req.body.country,
      grade:{name:req.body.grade},
      age:req.body.age,
      school:req.body.school,
      address:req.body.address,
      subjects:[
          {
              name:req.body.subject[0]
          },{
              name:req.body.subject[1]
          },{
              name:req.body.subject[2]
          }
      ],
      curriculum:{
          name:req.body.curriculum
      },
      pincode:req.body.pincode
    }
  })
}
  return res.json(responseObj(true,studentResponse,"Student Added"))
}
const getUserProfile=async(req,res,next)=>{
  let userprofile={};
 
  userprofile=await Student.findOne({user_id:req.user._id},{preferred_name:1,grade:1,school:1,address:1,city:1,state:1,country:1,subjects:1}).populate({path:"user_id",select:{
    email:1,mobile_number:1,profile_image:1
  }}).populate({path:'parent_id',select:{
      email:1,mobile_number:1
    }
  })
  res.json(responseObj(true,userprofile,''))
}
const getAllPayments=async(req,res,next)=>{
  let allpayments=[]
  
  allpayments=await Payment.find({sender_id:req.user._id})
  res.json(responseObj(true,allpayments,''))
}
const getAllReports=async(req,res,next)=>{
  let reports = []
  
  reports=  await Report.find({student_id:req.user._id})
  res.json(responseObj(true,reports,''))
}
const getAllExams=async(req,res,next)=>{
  let query={
    student_id:req.user._id
  }
  if(req.query.subject){
query["subject.name"]=req.query.subject
  }
  let options={
    limit:req.query.limit,
    page:req.query.page
  }
Exam.paginate(query,options,(err,result)=>{
  return res.json(responseObj(true,result,"Exams  are here"))
})
  
 
}

export {editUserProfile,getTotalClasses,getTotalClassesAttended,getHomework,getUpcomingClasses,getWatchTime,getUserProfile,getAllPayments,getAllReports,getAllExams,getPastClasses,getRescheduledClasses,getTrialClasses}