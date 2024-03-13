import Attendance from "../../../models/Attendance.js"
import Class from "../../../models/Class.js"
import Parent from "../../../models/Parent.js"
import Student from "../../../models/Student.js"
import { responseObj } from "../../../util/response.js"
import moment from 'moment'
import mongoose from "mongoose"
import User from "../../../models/User.js"
import unlinkFile from "../../../util/unlinkFile.js"
import HomeWork from "../../../models/HomeWork.js"
import Payment from "../../../models/Payment.js"
import Exam from "../../../models/Exam.js"
import upload from "../../../util/upload.js"
const ObjectID=mongoose.Types.ObjectId
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
const getTotalClasesToday=async(req,res,next)=>{
    let total_classes=await Class.aggregate([{
        $match:{
            $and:[
                {
                    student_id:req.query.student_id
                },
                {
                    start_date:{
                        $gt:moment().set('h',0).set('m',0).set('s',0).set(0,'s').format("YYYY-MM-DDTHH:mm:ss")
                    },

                },{
                    start_date:{
                        $lt:moment().add(1,'d').set('h',0).set('m',0).set('s',0).set(0,'s').format("YYYY-MM-DDTHH:mm:ss")
                    },
                }
            ]
        }
    }])
  return  res.json(responseObj(true,total_classes.length,null))
}
const getTotalClassesScheduled=async(req,res,next)=>{
    let class_scheduled = await Class.aggregate([{
        $match:{
            $and:[
                {
                    student_id:req.query.student_id
                },
                {
                    status:'Scheduled'
                },
                {
                    start_date:{
                        $gt:moment().set('h',0).set('m',0).set('s',0).set(0,'s').format("YYYY-MM-DDTHH:mm:ss")
                    },

                },{
                    start_date:{
                        $lt:moment().add(1,'d').set('h',0).set('m',0).set('s',0).set(0,'s').format("YYYY-MM-DDTHH:mm:ss")
                    },
                }
            ]
        }
    }])
  return  res.json(responseObj(true,class_scheduled.length,null))
}
const getClassAttendedToday=async (req,res,next)=>{
    let attended_today=[];
    attended_today=await Attendance.aggregate([
        {
            $match:{
               $and:[
                {
                    student_id:req.query.student_id
                },{
                    check_in_datetime:{
                        $lt:moment().add(1,'d').set('h',0).set('m',0).set('s',0).set(0,'s').format("YYYY-MM-DDTHH:mm:ss")
                    },
                }
                ,{
                    check_in_datetime:{
                        $gt:moment().set('h',0).set('m',0).set('s',0).set(0,'s').format("YYYY-MM-DDTHH:mm:ss")
                    },
                },{
                    status:'Present'
                }
               ]
            }
        }
    ])
   return  res.json(responseObj(true,attended_today,null))
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

      { student_id: req.user._id },


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
          // {"name":  {$regex: req.query.search, $options: 'i' }
           
          // },
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
const getPastClasses = async (req, res, next) => {
  
  let query = {
    $and: [
      {

        start_time: { $lt:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss") },
      }, {
        student_id: req.user._id,

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
      path:'teacher_id',
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
          // {"name":  {$regex: req.query.search, $options: 'i' }
           
          // },
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
      path:'teacher_id',
      select:{
        name:1
      }
    }],
    select:{
      "subject":1,"name":1,"start_time":1,"end_time":1,"rescheduled_by":1,"status":1,"class_type":1
    }
  }
  let query = {
    $and: [
      {

        end_time: { $gte: moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")},
      }, {
        student_id: req.user._id,

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
      // {"name":  {$regex: req.query.search, $options: 'i' }
       
      // },
      // {"student_id":{
      //   $in:student_ids.map((data)=>data._id)
      // }},
      {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
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
const getTrialClasses = async (req, res, next) => {
  let query = {
    $and: [{
      student_id: req.user._id,
      class_type: 'Trial',
      // status: 'Pending'
    },{$or:[{
status:{
$eq:"Done"
}
    },{
      status:{
        $eq:"Scheduled"
      },
      end_time:{
        $gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
      }
    }]}]
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
      path:'teacher_id'
    }],
    select:{
      "subject":1,"name":1,"start_time":1,"end_time":1,"status":1,"rescheduled_by":1,"is_rescheduled":1
    }
  }
  Class.paginate(query, options, (err, result) => {
   
    res.json(responseObj(true, result, null))
  })
}
  const getPendingPaymentClasses=async (req,res,next)=>{
    let query={
      $and:[
        {payment_status:'Unpaid'},
        {student_id:new ObjectID(req.query.student_id)},
        {
    is_rescheduled:true
        }
      ]
    }
    let options={
      limit:req.query.limit,
      page:req.query.page
    }
    Class.paginate(query,options,(results)=>{

     return res.json(responseObj(true,results,null))
    })
  }
  const getWatchHourweekly=async (req,res,next)=>{
    
    let weeklyHoursResponseArray=[]
   console.log(req.user._id)
    for(let i=0;i<7;i++){
        
    
        const weeklyHoursResponse=await Class.aggregate([
            {
                $match:{
                    $and:[
    
                        {"end_time":{
                            $lt:moment(req.query.start_date).startOf('week').add(i+1,'d').set('h',0).set('m',0).set('s',0).format("YYYY-MM-DDTHH:mm:ss")
                        }},
                        {"start_time":{
                            $gte :moment(req.query.start_date).startOf('week').set('h',0).set('m',0).set('s',0).add(i,'d').format("YYYY-MM-DDTHH:mm:ss")}},
                            {
                                student_id:new ObjectID(req.user._id)
                            },
                            { status:'Done'}
                        
                      
                    ]
                }
                
            },
            {
                $group: {
                    _id:moment(req.query.start_date).startOf('week').set('h',0).set('m',0).set('s',0).add(i,'d').format("YYYY-MM-DDTHH:mm:ss"),
                    totalWatchHours: {
                    $sum:1// Convert milliseconds to hours
                    
                  },

                }
            }
        ])
      console.log(weeklyHoursResponse)
        if(weeklyHoursResponse.length>0){

            weeklyHoursResponseArray.push({
                date:moment(req.query.start_date).startOf('week').set('h',0).set('m',0).set('s',0).add(i,'d').format("YYYY-MM-DDTHH:mm:ss"),
                totalWatchHours:weeklyHoursResponse[0].totalWatchHours
            })
        }
        else{
            weeklyHoursResponseArray.push({
                date:moment(req.query.start_date).startOf('week').set('h',0).set('m',0).set('s',0).add(i,'d').format("YYYY-MM-DDTHH:mm:ss"),
                totalWatchHours:0
            })
        }
    }
    let totalWeeklyHours=0
    weeklyHoursResponseArray.forEach((data)=>{
totalWeeklyHours+=data.totalWatchHours
    })

   return res.json(responseObj(true,{"weeklyHoursResponseArray":weeklyHoursResponseArray,"totalWeeklyHours":totalWeeklyHours,"averageWeeeklyHours":totalWeeklyHours/7},null))

  }
  const getAttendance=async(req,res,next)=>{
    
   
    let recheduledClasses=await Class.countDocuments({
            $and:[
                {
                    student_id:new ObjectID(req.user._id)
                },{
                    start_time :{$gte:moment(req.query.start_time).startOf('week').set('h',0).set('m',0).set('s',0).format("YYYY-MM-DDTHH:mm:ss")},

                },{
                    end_time:{
                        $lte:moment(req.query.start_time).endOf('week').set('h',0).set('m',0).set('s',0).format("YYYY-MM-DDTHH:mm:ss")
                    }
                },{
                    is_rescheduled:true
                }
            ]
        })
 


let attendanceDataArray=[]
let totalPresent=0
let totalAbsent=0
let week_days=["Sun","Mon","Tues","Wed","Thurs","Fri","Sat"]
for (let i=0;i<7;i++){
 
    let scheduledClasses=await Class.countDocuments({
            $and:[
                {
                    student_id:new ObjectID(req.user._id)
                },{
                    start_time :{$gte:moment(req.query.start_time).startOf('week').add(i,'d').set('h',0).set('m',0).set('s',0).format("YYYY-MM-DDTHH:mm:ss")},

                },{
                    end_time:{
                        $lt:moment(req.query.start_time).startOf('week').add(i+1,'d').set('h',0).set('m',0).set('s',0).format("YYYY-MM-DDTHH:mm:ss")
                    }
                }
                ,
                {status:{
                  $in:['Scheduled','Done']
                }}
            ]
        }
    )
 
  let  attendanceResponse=await Class.aggregate([
        {
            $match:{
                $and:[
                   {
                    end_time:{
                        $gte:moment(req.query.start_time).startOf('week').set('h',0).set('m',0).set('s',0).add(i,'d').format("YYYY-MM-DDTHH:mm:ss")
                    }
                   } ,{
                    start_time:{
                        $lte:moment(req.query.start_time).startOf('week').set('h',0).set('m',0).set('s',0).add(i+1,'d').format("YYYY-MM-DDTHH:mm:ss")
                    }
                   },{
                    student_id:new ObjectID(req.user._id)
                   },
                   {status:'Done'}
                ]
            }
        },
        {
            $group: {
                _id: moment(req.query.start_time).startOf('week').set('h',0).set('m',0).set('s',0).add(i,'d').format("YYYY-MM-DDTHH:mm:ss"),
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                date: "$_id",
                count: 1
            }
        }
    ])
   
    if (attendanceResponse.length===0&& scheduledClasses===0){
        attendanceDataArray.push({
            date:moment(req.query.start_time).startOf('week').set('h',0).set('m',0).set('s',0).add(i,'d').format("YYYY-MM-DDTHH:mm:ss"),
            day:week_days[i],
            "attendance": null
        })

    }
    else if(attendanceResponse.length===0){
   
        attendanceDataArray.push({
            date:moment(req.query.start_time).startOf('week').set('h',0).set('m',0).set('s',0).add(i,'d').format("YYYY-MM-DDTHH:mm:ss"),
            day:week_days[i],
            "attendance": false
        }),
      
        totalAbsent+=scheduledClasses
    }
    else{
        attendanceDataArray.push({
            date:attendanceResponse[0].date,
            day:week_days[i],
            attendance:scheduledClasses===attendanceResponse[0].count
            
            
        })
        totalPresent+=attendanceResponse[0].count
        totalAbsent+=scheduledClasses-attendanceResponse[0].count
    }
}


return res.json(responseObj(true,{"totalRescheduledClasses":recheduledClasses,"attendance":attendanceDataArray,"totalAbsent":totalAbsent,"totalPresent":totalPresent},null))
  }
  
  
  const getUserProfile=async(req,res,next)=>{
    let userprofile={};
   
    userprofile=await Student.findOne({user_id:req.user._id},{preferred_name:1,curriculum:1,grade:1,school:1,address:1,city:1,state:1,country:1,subjects:1}).populate({path:"user_id",select:{
      email:1,mobile_number:1,profile_image:1
    }}).populate({path:'parent_id',select:{
        email:1,mobile_number:1
      }
    })
    res.json(responseObj(true,userprofile,''))
  }
  const getHomeworks=async(req,res,next)=>{
 
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
  let homworks=await HomeWork.find({
    class_id:{
      $in:ClassResponse
    }
  })
     HomeWork.paginate(query,options,(err,result)=>{
      
     homworks.forEach((data)=>{
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

  const editUserProfile=async(req,res)=>{
    if(req.files?.download){
  
      let fileName=await upload(req.files?.download)
      User.updateOne({
        _id:req.user._id
      },{
        $set:{
         profile_image:fileName
        }
      })
    }
    User.updateOne({
      _id:req.user._id
    },{
      $set:{
      mobile_number:req.body.mobile_number,
      name:req.body.name,
      }
    })
    // let password= await  bcrypt.hash(makeId(5), 10)
  
   
   let studentResponse=await Student.findOne({
    user_id:req.user._id
   })
  
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
        // pincode:req.body.pincode
      }
    })
    if(req.body.parent_mobile_number){
      await User.updateOne({
        _id:studentDetails.parent_id
      },{
        $set:{
          mobile_number:req.body.parent_mobile_number
        }
      })
    }
    return res.json(responseObj(true,null,"Student Profile Edited"))
  }

  const getAllPayments=async(req,res,next)=>{
    let allpayments=[]
    
    allpayments=await Payment.find({sender_id:req.user._id})
    res.json(responseObj(true,allpayments,''))
  }

  const getAllStudents=async(req,res)=>{
    let students=await Student.find({
      parent_id:req.user._id
    },{
      user_id:1,preferred_name:1,profile_image:1
    })
    res.json(responseObj(true,students,"All Students linked to parent"))
  }
  const selectStudent=async(req,res)=>{
    let user=await User.findOne({
      _id:req.body.student_id
    })
    const token = user.signJWT();
    res.json(responseObj(true,{
        access_token:token,
        user:user
        
    },"Token with Student Details Attached",null) )
  }
export {getAllPayments,selectStudent,getHomeworks,editUserProfile,getAllExams,getTotalClasesToday,getWatchHourweekly,getTotalClassesScheduled,getClassAttendedToday,getUpcomingClasses,getPendingPaymentClasses,getAttendance,getUserProfile,getPastClasses,getRescheduledClasses,getTrialClasses,getAllStudents};