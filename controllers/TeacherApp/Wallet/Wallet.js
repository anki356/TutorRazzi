import Payment from "../../../models/Payment.js"
import Wallet from "../../../models/Wallet.js"
import { responseObj } from "../../../util/response.js"
import mongoose from "mongoose"
const ObjectId = mongoose.Types.ObjectId;
import moment from "moment-timezone";
import Class from "../../../models/Class.js"
import Student from "../../../models/Student.js";
const getStats=async(req,res,next)=>{

const walletBalance=await Wallet.findOne({
    user_id:req.user._id
},{amount:1})
const classResponse=await Class.find({teacher_id:req.user._id})
    
const total_earnings_response=await Payment.aggregate([
    {
        $match:{$and:[

            {
               class_id:{$in:classResponse.map((data)=>data._id)}
            }
            ,{
                createdAt:{
                    $gte:moment().startOf('week').subtract(1,'week').set('h',0).set('m',0).set('s',0).format("YYYY-MM-DDTHH:mm:ss"),
                    $lte: moment().endOf('week').subtract(1,'week').add(1,'d').set('h',0).set('m',0).set('s',0).format("YYYY-MM-DDTHH:mm:ss")
                }
            }
        ]
        }
      
    }
    ,
    {
        $group:{
            _id:0,
            totalEarnings:{
$sum:"$net_amount"
            }
        }
    }
])
const amountResponse=await Payment.find({sender_id:new ObjectId(req.user._id)},{amount:1}).sort({createdAt:-1}).limit(1)
// res.json(responseObj(true,,null))
res.json(responseObj(true,{walletBalance:walletBalance,"last_week_earnings":total_earnings_response.length>0?total_earnings_response[0].totalEarnings*95/100:0,"last_withdrawl":amountResponse.length>0?amountResponse[0].amount:0},null))
}
const withdraw=async (req,res,next)=>{
   
const WalletResponse=await Wallet.findOneAndUpdate({
    user_id:req.user._id
},{
    $inc:{
amount:-req.body.amount
    }
})

const PaymentResponse=await Payment.insertMany({
    sender_id:req.user._id,
    payment_type:'Debit',
    amount:req.body.amount,
    wallet_id:WalletResponse._id,
    net_amount:req.body.amount,
    status:"Pending"

})
res.json(responseObj(true,{WalletResponse,PaymentResponse},null))
}

const getStatement=async(req,res,next)=>{
    const classResponse=await Class.find({teacher_id:req.user._id})
    let query={
        
 
            
 class_id:{$in:classResponse.map((data)=>data._id)},
    status:"Paid"
 
    }
    let options={
        limit:req.query.limit,
        page:req.query.page,
        sort:{
            createdAt:-1
        },
        populate:[{path:'quote_id',select:{
         'subject_curriculum_grade.subject':1
        }}],
        select:{
            "net_amount":1,"payment_type":1,"payment_date":1,"createdAt":1
        }
    }
    
 Payment.paginate(query,options,(err,paymentResponse)=>{
   
   
  return  res.json(responseObj(true,paymentResponse,null))
 })
}

const getPaymentDetails=async(req,res,next)=>{
    const payment = await Payment.findOne({_id: req.query._id},{
net_amount:1,trx_ref_no:1,payment_date:1,status:1
    }).populate({path:'class_id',select:{
        subject:1,
        start_time:1,
        end_time:1,
    },populate:[{
        path:'student_id',select:{
            "name":1
        }
    },{
        path:'teacher_id',select:{
            "name":1
        }
    }]}).populate({
     path:'quote_id',
     select:{
        "student_id":1
     }
    })
    const studentDetails=await Student.findOne({
 user_id:payment.quote_id.student_id
    },{
     "grade":1,"curriculum":1,"school":1
    }).populate({
     path:"user_id",
     select:{
         "name":1,"profile_image":1
     }
    })
    res.json(responseObj(true,{payment:payment,studentDetails:studentDetails},null))
 }
export {getStats,withdraw,getStatement,getPaymentDetails}