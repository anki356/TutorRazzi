import AcademicManager from "../../../models/AcademicManager.js"
import Class from "../../../models/Class.js"
import Quote from "../../../models/Quote.js"
import Student from "../../../models/Student.js"
import {responseObj} from "../../../util/response.js"
const getAllStudents=async(req,res)=>{
    let StudentIds=await AcademicManager.findOne({user_id:req.user._id},{students:1})
    let query={
        user_id:{
            $in:StudentIds.students
        }
    }
    if(req.query.search){
        query.preferred_name={
            $regex:req.query.search,
            $options:"i"
        }
    }
    let options={
        limit:req.query.limit||StudentIds.students.length,
        page:req.query.page||1,
        select:{
            "grade":1,"curriculum":1,_id:1,"preferred_name":1
        },
        populate:{path:"user_id",select:{"profile_image":1}}
    }
   Student.paginate(query,options,(err,result)=>{

       return res.json(responseObj(true,result,"all students"))
   })
}
const getStudentById=async(req,res)=>{
    const studentId = req.query.student_id;
    const studentResponse=await Student.findOne({user_id:studentId}).populate({
        path:'user_id'
    })
    const no_of_trial_classes_done=await Class.countDocuments({
        class_type:"Trial",
        status:"Done",
        student_id:studentId
    })
    let quotes=await Quote.find({
        student_id:studentId
    })
    let array=[]
    quotes.forEach(async(data)=>{
        let classes=await Class.find({
            quote_id:data._id,
            status:'Scheduled'
                }) 
                let obj=data
              
    if(classes.length===1){
obj.due_date=classes[0].end_date
    }
    array.push(obj)
    })
   
const no_of_classes=await Class.countDocuments({
  
    class_type:"Non-Trial",
    student_id:studentId
})
let last_payment=await Payment.find({
    sender_id:studentId
}).sort({
    createdAt:-1
}).limit(1)
const teacher_classes=await Class.find({
    status:{
        $ne:"Cancelled"
    },
    student_id:studentId
},{
    subject:1,grade:1,curriculum:1,name:1,teacher_id:1
}).populate({
    path:"teacher_id",
    select:{
        profile_image:1,name:1
    }
})
    return res.json(responseObj(true,{"studentResponse":studentResponse,"no_of_trial_classes_done":no_of_trial_classes_done,"no_of_requests":no_of_requests,"teacher_classes":teacher_classes},"Student Data"))
}

export {getAllStudents,getStudentById}