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
const ObjectID=mongoose.Types.ObjectId
const getAllExams=async(req,res,next)=>{
  let query={
    student_id:req.query.student_id
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

const getUpcomingClasses=async(req,res,next)=>{
    
    let options={
      limit:req.query.limit?Number(req.query.limit):5,
      page:Number(req.query.page),
      populate:{
        "path":"teacher_id"
      }
    }
    let query={$and:[
     { start_time :{$gte:moment().format("YYYY-MM-DDTHH:mm:ss")}},
    
      {student_id:new ObjectID(req.query.student_id)},
  
    
      {status:'Scheduled'}
    ]
  
     
    }
    if(req.query.search){
      query={$and:[
        { start_time :{$gte:moment().format("YYYY-MM-DDTHH:mm:ss")}},
       
         {student_id:new ObjectID(req.query.student_id)},
     
       
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
              }}
             
       
       
             ]
          
         }
       ]
     
        
       }
    }
    Class.paginate(query,options,(err,result)=>{
      if(result){
       return  res.json(responseObj(true,result,null))
      }
    })
  
  }
  const getRescheduledClasses=async(req,res,next)=>{
  
   
  let options={
      limit:req.query.limit?Number(req.query.limit):5,
      page:Number(req.query.page),
      populate:{
        "path":"teacher_id"
      }
    }
  
    let query={$and:[
          {
  
            start_time :{$gte:moment().format('YYYY-MM-DDTHH:mm:ss')},
          },{
            student_id:new ObjectID(req.query.student_id),
  
          },
          {
            is_rescheduled:true
          },{
            status:'Pending'
          }]
        }
    if(req.query.search){
        query={$and:[
          { start_time :{$gte:moment().format('YYYY-MM-DDTHH:mm:ss')}},
         
           {student_id:new ObjectID(req.query.student_id)},
           {
            is_rescheduled:true
          },{
            status:'Pending'
          },
         
          {
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
                }}
               
         
         
               ]
            
           }
         ]
       
          
         }
      }
      Class.paginate(query,options,(err,result)=>{
        if(result){
          res.json(responseObj(true,result,null))
        }
        else{
          console.log(err)
        }
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
   
    for(let i=0;i<7;i++){
        
    
        const weeklyHoursResponse=await Attendance.aggregate([
            {
                $match:{
                    $and:[
    
                        {"check_out_datetime":{
                            $lt:moment(req.query.start_date).startOf('week').add(i+1,'d').set('h',0).set('m',0).set('s',0).format("YYYY-MM-DDTHH:mm:ss")
                        }},
                        {"check_in_datetime":{
                            $gte :moment(req.query.start_date).startOf('week').set('h',0).set('m',0).set('s',0).add(i,'d').format("YYYY-MM-DDTHH:mm:ss")}},
                            {
                                student_id:new ObjectID(req.query.student_id)
                            }
                        
                    ]
                }
            },
            {
                $group: {
                    _id:moment(req.query.start_date).startOf('week').set('h',0).set('m',0).set('s',0).add(i,'d').format("YYYY-MM-DDTHH:mm:ss"),
                    totalWatchHours: {
                    $sum:{
                        $divide: [{ $subtract: [{
                          $toDate: '$check_out_datetime' // Convert string to date
                        },
                        {
                          $toDate: '$check_in_datetime' // Convert string to date
                        }] }, 3600000] // Convert milliseconds to hours
                    }
                  },

                }
            }
        ])
      
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
    
   
    let recheduledClasses=await Class.aggregate([
        {$match:{
            $and:[
                {
                    student_id:new ObjectID(req.query.student_id)
                },{
                    start_time :{$gte:moment(req.body.start_time).startOf('week').set('h',0).set('m',0).set('s',0).format("YYYY-MM-DDTHH:mm:ss")},

                },{
                    end_time:{
                        $lte:moment(req.body.start_time).endOf('week').set('h',0).set('m',0).set('s',0).format("YYYY-MM-DDTHH:mm:ss")
                    }
                },{
                    is_rescheduled:true
                }
            ]
        }},
    ])
 


let attendanceDataArray=[]
let totalPresent=0
let totalAbsent=0
let week_days=["Sun","Mon","Tues","Wed","Thurs","Fri","Sat"]
for (let i=0;i<7;i++){
 
    let scheduledClasses=await Class.aggregate([
        {$match:{
            $and:[
                {
                    student_id:new ObjectID(req.query.student_id)
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
        }},
    ])
 
  let  attendanceResponse=await Attendance.aggregate([
        {
            $match:{
                $and:[
                   {
                    check_in_datetime:{
                        $gte:moment(req.query.start_time).startOf('week').set('h',0).set('m',0).set('s',0).add(i,'d').format("YYYY-MM-DDTHH:mm:ss")
                    }
                   } ,{
                    check_out_datetime:{
                        $lte:moment(req.query.start_time).startOf('week').set('h',0).set('m',0).set('s',0).add(i+1,'d').format("YYYY-MM-DDTHH:mm:ss")
                    }
                   },{
                    student_id:new ObjectID(req.query.student_id)
                   },{
                    class_id:{
                        $in:scheduledClasses.map((data)=>{
                            return data._id
                        })
                    }
                   }
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
   
    if (attendanceResponse.length===0&& scheduledClasses.length===0){
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
      
        totalAbsent+=scheduledClasses.length
    }
    else{
        attendanceDataArray.push({
            date:attendanceResponse[0].date,
            day:week_days[i],
            attendance:scheduledClasses.length===attendanceResponse[0].count
            
            
        })
        totalPresent+=attendanceResponse[0].count
        totalAbsent+=scheduledClasses.length-attendanceResponse[0].count
    }
}


return res.json(responseObj(true,{"totalRescheduledClasses":recheduledClasses.length,"attendance":attendanceDataArray,"totalAbsent":totalAbsent,"totalPresent":totalPresent},null))
  }
  const getPastClasses=async(req,res,next)=>{
    
    let query={$and:[
      {
  
        start_time :{$lt:new Date()},
      },{
        student_id:new ObjectID(req.query.student_id),
  
      },
      {
        status:'Done'
      }
    ]
  
    }
    let options={
      limit:req.query.limit?Number(req.query.limit):5,
      page:Number(req.query.page)
    }
    if(req.query.search){
      query={$and:[
        {
    
          start_time :{$lt:new Date()},
        },{
          student_id:new ObjectID(req.query.student_id),
    
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
          }}
        
     
     
           ]
        }
      ]
    
      }
    }
   
    
    Class.paginate(query,options,(err,result)=>{
      if(result){
        return res.json(responseObj(true,result,null))
      }
      else{
  throw new Error(err)
      }
    })
   
  }
  const getTrialClasses=async(req,res,next)=>{
    let query={$and:[{
      student_id:req.query.student_id,
      class_type:'Trial',
      start_time:{
        "$gte":moment().format("YYYY-MM-DDTHH:mm:ss")
      }
    }]}
    if(req.query.search){
      query={$and:[{
        student_id:req.query.student_id,
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
            }}
           
     
     
           ]
        
      }]}
    }
    let options={
      limit:req.query.limit?Number(req.query.limit):5,
      page:Number(req.query.page),
      populate:{
        path:"teacher_id",
        select:{
          full_name:1
        }
      }
    }
    Class.paginate(query,options,(err,result)=>{
      return res.json(responseObj(true,result,null))
    })
  }
  const getHomeworks=async(req,res,next)=>{
    let homeworkData=[]
    let classResponse=await Class.find({student_id:new ObjectID(req.query.student_id)})
    homeworkData=await HomeWork.find({class_id:{
      $in:classResponse.map((data)=>data._id)
    }})
   return  res.json(responseObj(true,homeworkData,null))
  }
  const getUserProfile=async(req,res,next)=>{
    let userprofile={};
    
    userprofile=await Parent.findOne({user_id:req.user._id})
  
    return res.json(responseObj(true,userprofile,null))
  }
  const getHomework=async(req,res,next)=>{
    let query={
      student_id:new ObjectID(req.query.student_id)
    }
    const options={
      limit:Number(req.query.limit),
      page:Number(req.query.page),
      select:[
        'homework'
      ]
    }
     Class.paginate(query,options,(err,result)=>{
      return res.json(responseObj(true,result,null))
     })
     
    
  }

  const editUserProfile=async (req,res)=>{
    let parentResponse=await Parent.findOne({user_id:req.user._id})
    if(parentResponse===null){
      parentResponse=await Parent.create({
        ...req.body,
        user_id:req.user._id
      })
    }
    else{
      parentResponse=await Parent.updateOne({
        user_id:req.user._id
      },{
        $set:{
          ...req.body
        }
      })
    }
    let userResponse=await User.updateOne({
      _id:req.user._id
    },{
      $set:{
        name:req.body.preferred_name
      }
    })
    if(req.files){
      const photoResponse=await User.findOne({
        _id:req.user._id
      },{
        profile_image:1
      })
      if(photoResponse!==null){
        unlinkFile(photoResponse.profile_image)
      }
      userResponse=await User.updateOne({
        _id:req.user._id
      },{
        $set:{
          profile_image:req.files[0].filename
        }
      })
    }
    return res.json(responseObj(true,parentResponse,null))
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
      user_id:1,preferred_name:1
    })
    res.json(responseObj(true,students,"All Students linked to parent"))
  }

export {getAllPayments,getHomeworks,editUserProfile,getAllExams,getTotalClasesToday,getWatchHourweekly,getTotalClassesScheduled,getClassAttendedToday,getUpcomingClasses,getPendingPaymentClasses,getAttendance,getUserProfile,getPastClasses,getRescheduledClasses,getTrialClasses,getHomework,getAllStudents};