import moment from "moment"
import AcademicManager from "../../../models/AcademicManager.js"
import Class from "../../../models/Class.js"
import Payment from "../../../models/Payment.js"
import Quote from "../../../models/Quote.js"
import Student from "../../../models/Student.js"
import {responseObj} from "../../../util/response.js"
import User from "../../../models/User.js"
import Parent from "../../../models/Parent.js"
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
                "email":1,"profile_image":1
            
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

    return res.json(responseObj(true,{"studentResponse":studentResponse,"no_of_classes":no_of_classes,"last_payment":last_payment[0].net_amount},"Student Data"))
}
const getBundleDetails=async(req,res)=>{
    const bundles=await Class.find({
        quote_id:req.query.quote_id
    },{
        subject:1,start_time:1,end_time:1,status:1,teacher_id:1
    })
    if(bundles.length===0){
        return res.json(responseObj(false, null,"Incorrect Bundle ID"))
    }
    const teacher_name=await User.findOne({
       _id: bundles[0].teacher_id
    })
    const subject=bundles[0].subject.name
    const classRemaining=await Class.find({
        quote_id:req.query.quote_id,
        $or:[
            {
status:"Pending",
start_time:null,

            },{
status:"Scheduled",
start_time:{
    $gte:moment().format("YYYY-MM-DDTHH:mm:ss")
}
            }
        ] 
    })
let show=false
    if(classRemaining.length===1&&moment(classRemaining[0].end_time).diff(moment(),'d')<3){
show=true
    }
    return res.json(responseObj(true,{bundles:bundles,show:show,classRemaining:classRemaining.length,subject:subject,teacher_name:teacher_name.name}))
}
const getStudentClassList=async(req,res)=>{
    let query={
        student_id:req.query.student_id,
        status:"Paid"
    }
    if(req.query.teacher_id){
       query.teacher_id=req.query.teacher_id
    }
    let {limit,page}=req.query
    
    
    let array=[]
    let quotes=await Quote.find(query,{
        'subject_curriculum_grade':1,"class_count":1,"status":1
    }).limit(limit).skip((page-1)*limit)
    console.log(quotes)
    
    for (let data of quotes) {
        let classes = await Class.find({ quote_id: data._id, status: 'Scheduled' });
        let obj = data;
    
        if (classes.length === 1) {
            obj.due_date = classes[0].end_date;
        }
        array.push(obj);
    }
    console.log(array)
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
        sender_id:req.query.student_id,
        status:"Paid"
    }
    if(req.query.date){
        query.createdAt=req.query.date
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
const getStudentPersonalDetails=async(req,res)=>{
    let students=await Student.find()
    let studentDetails=await Student.findOne({
        user_id:req.query.student_id
    },{
        preferred_name:1,
        address:1,
        city:1,
        state:1,
        subjects:1,
        curriculum:1,
        grade:1,
        school:1,
        parent_id:1
    }).populate({
        path:'user_id',
        select:{
            email:1,mobile_number:1
        }
    })
    let studentId=students.findIndex((data)=>{
        return data.user_id=req.query.student_id
    })
    let parents=await Parent.find({})
    let parentID=parents.findIndex((data)=>{
        return data.user_id=studentDetails.parent_id
    })
    return res.json(responseObj(true,{studentDetails:studentDetails,parentID:parentID+1,studentId:studentId+1},"Student Details"));
}
const getPaymentDetails=async(req,res)=>{
const payment=await Payment.findOne({_id:req.query.payment_id},{
    trx_ref_no:1,status:1
}).populate({
    path:'quote_id',select:{
        "class_count":1,'subject_curriculum_grade':1,
    }
}).populate({
    path:"class_id",
    select:{
        "teacher_id":1,"student_id":1,"subject":1,"start_time":1,"end_time":1
    },
    populate:[{
        path:'teacher_id',
        select:{
            name:1,profile_image:1
        }
    },{
        path:'student_id',
        select:{
            name:1,_id:1
        }

    }]
    
})
console.log(payment)
const studentDetails=await Student.findOne({
user_id:payment.class_id[0].student_id._id
},{
    select:{
        "grade":1, "curriculum":1
    }
}).populate({
    path:'user_id',
    select:{
        name:1,profile_image:1
    }
})

const payments=await Payment.find()
let payment_id=payments.findIndex((data)=>{
    return data._id==req.query.payment_id
})
return res.json(responseObj(true,{payment_id:payment_id,studentDetails:studentDetails,payment:payment},"Payment Details"))

}
export {getAllStudents,getStudentById,getStudentClassList,getAllStudentPayments,getBundleDetails,getStudentPersonalDetails,getPaymentDetails}