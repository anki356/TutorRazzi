import Class from "../../../models/Class.js"
import Payment from "../../../models/Payment.js"
import Quote from "../../../models/Quote.js"
import { paymentAcknowledgement } from "../../../util/EmailFormats/paymentAcknowledgement.js"
import { paymentReceiptAcknowlegement } from "../../../util/EmailFormats/paymentReceiptAcknowlegement.js"
import { generatePDF } from "../../../util/generatedFile.js"
import { responseObj } from "../../../util/response.js"
import sendEmail from "../../../util/sendEmail.js"

const getAllPayments=async(req,res)=>{
    let query={
        sender_id:req.user._id,
        status:"Done"
    }
    let options={
        limit:req.query.limit,
        page:req.query.page,
        populate:{
            path:"class_id"
        }
    }
   Payment.paginate(query,options,(err,result)=>{
    return res.json(responseObj(true,result,"All payments"))
   })
}

let getAllQuotes=async(req,res)=>{
    let query={
        sender_id:req.user._id,
        status:"Pending"
    }
    let options={
        limit:req.query.limit,
        page:req.query.page,
        populate:{
            path:"quote_id"
        }
    }
    Payment.paginate(query,options,(err,result)=>{
        return res.json(responseObj(true,result,"Quotes of Student are"))
    })
}
const payQuote = async (req, res, next) => {
    
    const quoteResponse = await Quote.findOneAndUpdate({_id:req.params._id},{$set:{
        status:"Paid"
    }})
   
    let classArray = []
    for (let i =0;i<quoteResponse.hours;i++) {
        let classObj = {
            teacher_id: quoteResponse.teacher_id,
            student_id: req.body.student_id,
            subject:{name: quoteResponse.subject_curriculum_grade.subject},
            curriculum:{name: quoteResponse.subject_curriculum_grade.curriculum},
            class_type: req.body.class_type,
            is_rescheduled: false,
            grade: {name:quoteResponse.subject_curriculum_grade.grade},
            status: 'Pending',
            payment_status: 'Paid',
            quote_id:quoteResponse._id
        }

        classArray.push(classObj)
    }
    let classInsertResponse = await Class.insertMany(
        classArray
    ) 

    let paymentStudentResponse=await Payment.updateOne({
        quote_id:req.params._id},{$set:{
        
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
let teacherResponse=await Teacher.findOne({_id:quoteResponse.teacher_id},{user_id:1,preferred_name:1}).populate("user_id",{select:{
name:1,email:1
}})
    let walletResponse=await Wallet.updateOne({
user_id:teacherResponse.user_id
    },{
        $inc:{
            amount:req.body.net_amount*95/100
        }
    })
    
        
        let count=await Payment.countDocuments()
               let {filename,content}=await generatePDF(moment().format("DD-MM-YYYY"),req.body.student_name,req.body.student_email,req.body.net_amount,req.body.trx_ref_no,count)    
               sendEmail(req.user.email,'Payment Receipt',paymentAcknowledgement(req.user.name,...req.body),{
                filename: filename,
                content: content,
               })
             
              
            //  markdownContent = `
            //    # Payment Acknowledgement 
                       
            //    Dear Admin,
                       
            //    You Have received payment of ${req.body.net_amount*5/100} made on ${moment().format("DD-MM-YYYY")}.
                       
            //    **Payment Details**:
            //    - Payment Amount: ${req.body.net_amount*5/100},
               
            //    - Payment Date: ${moment().format("DD-MM-YYYY")}
               
            //    Best regards,  
            //    **Tutor Razzi** 
            //    `;
        //         htmlContent =marked.parse(markdownContent);
        // count=await Payment.countDocuments()

            
        //        sendEmail("anki356@gmail.com",'Payment Received',htmlContent)
            //    let paymentTeacherResponse=await Payment.insertMany({
            //     sender_id: '6509954065b454494f4f888a',
            //     receiver_id:TeacherResponse.user_id ,
            //     payment_type: 'Debit',
            //     amount: req.body.net_amount*(95/100),
            //     class_id: classInsertResponse.map((data=>{
            //         return data._id
            //     })),
            //     trx_ref_no: req.body.trx_ref_no,
            //     net_amount: req.body.net_amount*(95/100),
            //     wallet_id: walletResponse._id
            // })    
            // let teacherUserResponse=await User.findOne({
            //     _id:TeacherResponse.user_id
            // },{email:1})//To Be Changed
            // let adminUserReponse=await User.findOne({
            //     _id:new objectId('6509954065b454494f4f888a')
            // },{email:1})//To be Changed
            // let teacherWalletResponse=await Wallet.updateOne({
            //     _id: walletResponse._id
            // },{
            //     $inc:{
            //         amount:req.body.net_amount*(95/100)
            //     }
            // })   
            let markdownContent =paymentReceiptAcknowlegement(teacherResponse.user_id.name,req.body.net_amount)
     count=await Payment.countDocuments()
     
         
            sendEmail(teacherResponse.user.email,'Payment Received',markdownContent)
      
         
             return  res.json(responseObj(true, {classInsertResponse,paymentStudentResponse}, 'Quote Payment Done'))
}

const getPaymentDetails=async(req,res)=>{
const paymentDetails=await Payment.findOne({_id:req.query.payment_id}).populate({path:"class_id"})
return res.json(responseObj(true,paymentDetails,"Payment Details"))
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
export  {getAllPayments,getAllQuotes,payQuote,getPaymentDetails,rejectQuote}