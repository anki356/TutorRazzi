import moment from "moment"
import Class from "../../../models/Class.js"
import Student from "../../../models/Student.js"
import Teacher from "../../../models/Teacher.js"
import { responseObj } from "../../../util/response.js"
import Attendance from "../../../models/Attendance.js"
import HomeWork from "../../../models/HomeWork.js"
import User from "../../../models/User.js"
import makeId from "../../../util/makeId.js"

const studentData=async(req,res)=>{
    let totalUpComingClasses=await Class.countDocuments({
        start_time:{
            $gte:moment().format("YYYY-MM-DDTHH:mm:ss")
        },
        status:'Scheduled'
    })
    let totalTrialClassRequests=await Class.countDocuments({
        start_time:{
            $gte:moment().format("YYYY-MM-DDTHH:mm:ss")
        },
        status:'Pending',
        class_type:"Trial"
    })
    let totalUserStudents=await User.find({role:"student"})
    let totalStudents=await Student.countDocuments({user_id:{
        $in:totalUserStudents.map((data)=>data._id)}
      })
    return res.json(responseObj(true,{totalUpComingClasses,totalTrialClassRequests,totalStudents},"Total Upcoming Classes"))

}

const getAllStudents=async(req,res)=>{
    let users=await User.find({
        role:'student'
    })
    let query={user_id:{
        $in:users.map((data)=>{
            return data._id
        })
    }}
    if(req.query.search){
        query.preferred_name={
          $regex: req.query.search,
          $options:"i"
        }
       }
    let options={
        limit:req.query.limit,
        page:req.query.page,
        populate:{
            path:"user_id",
           select:{
            "_id":1,"email":1,"status":1
           }
        },
        select:{
            "preferred_name":1,"user_id":1,"grade":1,"city":1,"country":1
        }
    }
Student.paginate(query,options,(err,result)=>{
   
   
    return res.json(responseObj(true,result,"Students"))
})
}

const getStudentClasses=async(req,res)=>{
    let query = {
        student_id: req.query.student_id
      };
    
      if (req.query.teacher_id) {
        query.teacher_id = req.query.teacher_id;
      }
    
      if (req.query.subject) {
        query['subject.name'] = req.query.subject;
      }
    
      if (req.query.class_type === 'Upcoming') {
        query.start_time = { $gte: moment().format("YYYY-MM-DDTHH:mm:ss") };
        query.status = 'Scheduled';
      }
      if(req.query.class_type==='Past'){
        query.start_time = { $lte: moment().format("YYYY-MM-DDTHH:mm:ss") };
        query.status = 'Done';
      }
      if(req.query.class_type==='Trial'){
       
       query.class_type="Trial"
      }
      if(req.query.class_type==='Rescheduled'){
       query.status="Pending"
        query.is_rescheduled=true
       }
let options={
    limit:req.query.limit,
    page:req.query.page,
    populate:{
        path:"teacher_id",
        select:{
            "name":1
        }
    } ,
    select:{
        "teacher_id":1,"subject":1,"start_time":1,"end_time":1
    }  
}

Class.paginate(query,options,(err,result)=>{
    return res.json(responseObj(true,result,"Claases")) 
})
}

const getAllTeachers=async(req,res)=>{
    let teachers=await Teacher.find({},{user_id:1})
    return res.json(responseObj(true,teachers,"Teachers"))
}

const cancelClass=async(req,res)=>{
    const classResponse=await Class.updateOne({
        _id:req.params._id
    },{
        $set:{
            status:"Canceled"
        }
    })
    return res.json(responseObj(true,[],"Class Updated")) 
}

const getClassDetails=async(req,res)=>{
    const classResponse=await Class.findOne({_id:req.query.class_id})
    return res.json(responseObj(true,classResponse,"Class Details"))
}
const getStudentDetails=async(req,res)=>{
    const studentResponse=await Student.findOne({user_id:req.query.student_id}).populate({path:"parent_id"}).populate({
        path:"user_id"
    })
    if(studentResponse===null){
        throw new Error("No Student Found")
    }
    return res.json(responseObj(true,studentResponse,"Student Details"))
}

const getStudentSchedule=async(req,res)=>{
    let query = {
        student_id: req.query.student_id,
        start_time:{
            $gte:moment(req.query.date).format("YYYY-MM-DD"),
            $lte:moment(req.query.date).format("YYYY-MM-DD")
        }
      };
      let studentResponse=await Class.find(query)
      return res.json(responseObj(true,studentResponse,"Student Schedule"))
}

const getTotalClassesHoursAttended=async(req,res)=>{
    let totalHours=await Attendance([
        {$match:{
            student_id:req.query.student_id
        }}, {
            $group: {
               _id: null,
                totalWatchHours: {
                $sum:{
                    $divide: [{ $subtract: ['$check_out_datetime', '$check_in_datetime'] }, 3600000] // Convert milliseconds to hours
                }
              },

            }
        }


    ])
    return res.json(responseObj(true,totalHours,"Student watch Hours"))
}

const getHomeworkStatistics=async(req,res)=>{
    let classResponse=await Class.find({student_id:req.query.student_id})
    let pendingHomeworks=await HomeWork.countDocuments({
        class_id:{
            $in:classResponse.map((item)=> item._id)
        },
        status:"Pending"
    })

    let completedHomework=await HomeWork.countDocuments({
        class_id:{
            $in:classResponse.map((item)=> item._id)
        },
        status:"Completed"
    })
    return res.json(responseObj(true,[pendingHomeworks,completedHomework],"Homework Statistics"))

}
const updateStudent=async (req,res)=>{
    let details= await User.findById(req.params.student_id)
    await User.updateOne({
 _id:req.params.student_id
    },{
       $set:{
          status:!details.status
       }
    })
    return  res.json(responseObj(true,null,"Student Status updated successfullly")) 
 }
const deleteStudent=async (req,res)=>{
    await User.deleteById(req.params.student_id)
    await  Student.delete({
         user_id:req.params.student_id
      })
      return  res.json(responseObj(true,null,"Student deleted successfullly"))  
}


export {updateStudent,deleteStudent,getHomeworkStatistics,getTotalClassesHoursAttended,studentData,getStudentSchedule,getAllStudents,getAllTeachers,getStudentClasses,cancelClass,getClassDetails,getStudentDetails}