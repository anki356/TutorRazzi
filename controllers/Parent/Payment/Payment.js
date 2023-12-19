import Class from "../../../models/Class.js"
import mongoose from "mongoose"
import Payment from "../../../models/Payment.js"
import { responseObj } from "../../../util/response.js"
import Quote from "../../../models/Quote.js"
import moment from "moment"
import ExtraClassRequest from "../../../models/ExtraClassRequest.js"
import { generatePDF } from "../../../util/generatedFile.js"
import sendEmail from "../../../util/sendEmail.js"
import { marked } from "marked"
import User from "../../../models/User.js"
import Student from "../../../models/Student.js"
import Teacher from "../../../models/Teacher.js"
import Wallet from "../../../models/Wallet.js"
import { paymentAcknowledgement } from "../../../util/EmailFormats/paymentAcknowledgement.js"
import { paymentReceiptAcknowlegement } from "../../../util/EmailFormats/paymentReceiptAcknowlegement.js"
const objectId = mongoose.Types.ObjectId

const payQuote = async (req, res, next) => {
    
    const quoteResponse = await Quote.findOneAndUpdate({_id:req.params._id},{$set:{
        status:"Paid"
    }})
   
    let classArray = []
    for (let i =0;i<quoteResponse.class_count;i++) {
        let classObj = {
            teacher_id: quoteResponse.teacher_id,
            student_id: quoteResponse.student_id,
            subject:{name: quoteResponse.subject_curriculum_grade.subject},
            curriculum:{name: quoteResponse.subject_curriculum_grade.curriculum},
            class_type: req.body.class_type,
            is_rescheduled: false,
            grade: {name:quoteResponse.subject_curriculum_grade.grade},
            status: 'Pending',
            payment_status: 'Paid',
            quote_id:quoteResponse._id,
            name:quoteResponse.class_name
        }

        classArray.push(classObj)
    }
    let classInsertResponse = await Class.insertMany(
        classArray
    ) 

    let paymentStudentResponse=await Payment.updateOne({
        quote_id:req.params._id},{$set:{
        sender_id:req.user._id,
        coupon: req.body.coupon_name&&req.body.coupon_amount ?{
            coupon_name: req.body.coupon_name,
            discount: req.body.coupon_amount

        }:null,
        
        amount:req.body.amount,
        net_amount:req.body.net_amount,
        tax:req.body.tax,
        other_deductions:req.body.other_deductions,
        status:"Paid",
        trx_ref_no:req.body.trx_ref_no,
        class_id:classInsertResponse.map((data)=>data._id)
        
       
    }})
let teacherResponse=await Teacher.findOne({user_id:quoteResponse.teacher_id},{user_id:1,preferred_name:1}).populate({path:"user_id",select:{
    name:1,email:1}})
let walletResponse=await Wallet.findOne({
    user_id:teacherResponse.user_id
})
if(walletResponse!==null){
    walletResponse=await Wallet.updateOne({
        user_id:teacherResponse.user_id
            },{
                $inc:{
                    amount:req.body.net_amount*95/100
                }
            })
}
else{
    walletResponse=await Wallet.create({
        user_id:teacherResponse.user_id,
        amount:(req.body.net_amount)*95/100
    })
}
   
    
        
        let count=await Payment.countDocuments()
    
               let {filename,content}=await generatePDF(moment().format("DD-MM-YYYY"),req.user.name,req.user.
               email,req.body.net_amount,req.body.trx_ref_no,count) 
                 
               sendEmail(req.user.email,'Payment Receipt',paymentAcknowledgement(req.user.name,req.body.net_amount,req.body.tax,req.body.coupon_amount,req.body.other_deductions,req.body.amount),[{
                filename: req.user.name+"-"+Date.now()+".pdf",
                content: content,
                encoding:'utf-8'
               }])
             
              
           
            let markdownContent =paymentReceiptAcknowlegement(teacherResponse.user_id.name,req.body.net_amount)
     count=await Payment.countDocuments()
 
         
            sendEmail(teacherResponse.user_id.email,'Payment Received',markdownContent)
      
         
             return  res.json(responseObj(true, {classInsertResponse,paymentStudentResponse}, 'Quote Payment Done'))
}

const rejectQuote=async(req,res)=>{
    await Quote.updateOne({
        _id:req.params._id
    },{
        $set:{
            status:"Rejected"
        }
    })
    return res.json(responseObj(true,[],"Payment Rejected"))
}
export {  payQuote,rejectQuote }