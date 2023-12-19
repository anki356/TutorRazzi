import Payment from "../../../models/Payment.js"
import Quote from "../../../models/Quote.js"
import Class from "../../../models/Class.js"
import {responseObj} from "../../../util/response.js"
const addQuote=async(req,res,next)=>{
   
    const response=await Quote.insertMany({
        class_count:req.body.class_count,
        amount:req.body.amount,
        teacher_id:req.body.teacher_id,
        subject_curriculum_grade:{
            subject: req.body.subject,
            curriculum:req.body.curriclum,
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
export  {addQuote};