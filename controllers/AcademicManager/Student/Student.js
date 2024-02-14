import AcademicManager from "../../../models/AcademicManager.js"
import Class from "../../../models/Class.js"
import Payment from "../../../models/Payment.js"
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
    const studentResponse=await Student.findOne({user_id:studentId},{
        curriculum:1,preferred_name:1,createdAt:1
    }).populate({
        path:'user_id',
            select:{
                "email":1
            
        }
    })
    // const no_of_trial_classes_done=await Class.countDocuments({
    //     class_type:"Trial",
    //     status:"Done",
    //     student_id:studentId
    // })
    
   
const no_of_classes=await Class.countDocuments({
  
    class_type:"Non-Trial",
    student_id:studentId
})
let last_payment=await Payment.find({
    sender_id:studentId
}).sort({
    createdAt:-1
}).limit(1)

    return res.json(responseObj(true,{"studentResponse":studentResponse,"no_of_classes":no_of_classes,"last_payment":last_payment[0].amount},"Student Data"))
}
const getStudentClassList=async(req,res)=>{
    let query={
        student_id:req.query.student_id
    }
    if(req.query.teacher_id){
       query.teacher_id=req.query.teacher_id
    }
    let {limit,page}=req.query
    
    
    let array=[]
    let quotes=await Quote.find(query).limit(limit).skip((page-1)*limit)
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
    let totalDocs=array.length
    let totalPages=Math.ceil(totalDocs/Number(limit))
    let hasPrevPage=page>1
    let hasNextPage=page<totalPages
    let prevPage=hasPrevPage?Number(page)-1:null
    let nextPage=hasNextPage?Number(page)+1:null
     return res.json(responseObj(true,{result:{docs:array,totalDocs:totalDocs,limit:limit,page:page,pagingCounter:page,totalPages:totalPages,hasNextPage:hasNextPage,hasPrevPage:hasPrevPage,prevPage:prevPage,nextPage:nextPage}},"All Quotes"));
 
}
const getAllStudentPayments=async(req,res)=>{
    let query={
        sender_id:req.query.student_id
    }
    let options={
        limit:req.query.limit,
        page:req.query.page,
        populate:{
            path:'quote_id',
            select:{
                'subject_curriculum_grade.subject':1,class_count:1
            }
        },
        select:{
            'createdAt':1,'trx_ref_no':1,"net_amount":1
        }
    }
    Payment.paginate(query,options,(err,result)=>{
        return res.json(responseObj(true,result,"All Quotes"));
    })
}
export {getAllStudents,getStudentById,getStudentClassList,getAllStudentPayments}