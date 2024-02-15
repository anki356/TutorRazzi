import Payment from "../../../models/Payment.js"
import Quote from "../../../models/Quote.js"
import Class from "../../../models/Class.js"
import {responseObj} from "../../../util/response.js"
import Student from "../../../models/Student.js"
import SubjectCurriculum from "../../../models/SubjectCurriculum.js"
const addQuote=async(req,res,next)=>{
   
    const response=await Quote.insertMany({
        class_count:req.body.class_count,
        amount:req.body.amount,
        teacher_id:req.body.teacher_id,
        subject_curriculum_grade:{
            subject: req.body.subject,
            curriculum:req.body.curriculum,
            grade:req.body.grade
        },
        student_id:req.body.student_id,
        class_type:'Normal',
        description:req.body.description,
        class_name:req.body.class_name
    })
    const paymentResponse=await Payment.create({
        amount:Number(req.body.amount)*Number(req.body.class_count),
        net_amount:Number(req.body.amount)*Number(req.body.class_count),
        sender_id:req.body.student_id,
        payment_type:"Credit",
        quote_id:response[0]._id
    })

    res.json(responseObj(true,{response,paymentResponse},null))
}
const getSubjectCurriculum=async(req,res)=>{
    const subject_curriculum=await SubjectCurriculum.find({
       curriculum:req.query.curriculum
    })
    let subjects=subject_curriculum.map((data)=>data.subject)
    return res.json(responseObj(true,subjects,"Subject Curriculum"))
   }
   const editQuote=async(req,res)=>{
    let quoteDetails=await Quote.findOne({
      _id:req.params._id  ,
    
       
    })
if(quoteDetails==null){
return res.json(responseObj(false,null,"Invalid Quote id"))
}
if(quoteDetails.status==='Paid'){
    return res.json(responseObj(false,null,"You cannot edit quote now"))

}

    await Quote.updateOne({
        _id:req.params._id
    },{
        $set:{
            ...req.body
        }
    })
    return res.json(responseObj(true,null,"Quote edited successfully"))
   }
   const getQuoteById=async(req,res)=>{
    let quote=await Quote.findOne({
        _id:req.query.quote_id
    })
    return res.json(responseObj(true,quote,"Quote Details"))
   }
   const getAllCurriculums=async (req,res)=>{
    const curriculums=await Curriculum.find({})
    return res.json(responseObj(true,curriculums,"All Curriculums"))
   }
export  {addQuote,getSubjectCurriculum,editQuote,getQuoteById,getAllCurriculums};