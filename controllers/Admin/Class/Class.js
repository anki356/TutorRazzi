import {responseObj} from "../../../util/response.js"
import Class from "../../../models/Class.js"
import User from "../../../models/User.js"
import moment from "moment"
import Student from "../../../models/Student.js"
import Teacher from "../../../models/Teacher.js"
import Reminder from "../../../models/Reminder.js"
import ResourceRequest from "../../../models/ResourceRequest.js"
import Task from "../../../models/Task.js"
import HomeWork from "../../../models/HomeWork.js"
import Review from "../../../models/Review.js"
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
    
    //   {student_id:req.user._id},
  // {class_type:"Non-Trial"},
    
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
        {"student_id":{
          $in:student_ids.map((data)=>data._id)
        }},
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
        // student_id:req.user._id,
  
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
        {"student_id":{
          $in:student_ids.map((data)=>data._id)
        }},
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
    //   student_id:req.user._id,
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
        {"student_id":{
          $in:student_ids.map((data)=>data._id)
        }},
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
    
              end_time :{$gte:new Date().toLocaleDateString()},
            },{
            //   student_id:req.user._id,
    
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
              {"student_id":{
                $in:student_ids.map((data)=>data._id)
              }},
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
     
      
      // let reminderResponse = await Reminder.findOne({ class_id:req.query.class_id })
      res.json(responseObj(true, { classDetails: classDetails,studentDetails:studentDetails,teacherDetails:teacherDetails }, null))
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
    
    // let reminderResponse = await Reminder.findOne({ class_id:req.query.class_id})
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
    export {viewRec,getUpcomingClasses,getPastClasses,getRescheduledClasses,getTrialClasses,getUpcomingClassDetails,getClassDetails}
