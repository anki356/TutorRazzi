import Class from "../../../models/Class.js"
import Payment from "../../../models/Payment.js"
import Wallet from "../../../models/Wallet.js"
import { responseObj } from "../../../util/response.js"

const getPaymentWeekly=async(req,res)=>{
    const classes=await Class.find({teacher_id:req.user._id},{_id:1})
   const response=await  Payment.aggregate([
{$match:{
class_id:{
    $in:classes.map((data)=>data._id)
}
}},

        {
          $addFields: {
            week: { $isoWeek: { $dateFromString: { dateString: "$createdAt" } } }, // Add a new field "week" based on ISO week number
          }
        },
        {
          $group: {
            _id: "$week", // Group by week
            totalPayment: { $sum: "$amount" }, // Calculate the sum of payment amounts for each week
            
          }
        },
        {
          $sort: { _id: 1 } // Sort by week in ascending order
        }
      ])
    return  res.json(responseObj(true,response,'Weekly payments'))
}

const getWalletBalance=async(req,res)=>{
    let balance = await Wallet.findOne({user_id:req.user._id},{amount:1})
    return res.json(responseObj(true,balance,'Wallet balance'))
}

const lastWithdrawl=async(req,res,next)=>{

    const amountResponse=await Payment.find({sender_id:req.user._id},{amount:1}).sort({createdAt:-1}).limit(1)
res.json(responseObj(true,amountResponse.length>0?amountResponse[0].amount:0,null))
}

const getPayments=async(req,res,next)=>{
    const classResponse=await Class.find({teacher_id:req.user._id})
   let query={
       

           
class_id:{$in:classResponse.map((data)=>data._id)}
   

   }
   let options={
       limit:req.query.limit,
       page:req.query.page,
       sort:{
           createdAt:-1
       },
       populate:[{
        path:'sender_id'
       },{path:'class_id'}]
   }
   
Payment.paginate(query,options,(err,paymentResponse)=>{
  
  
 return  res.json(responseObj(true,paymentResponse,null))
})
}

const getWithdrawls=async(req,res,next)=>{
   
   let query={
       

           
sender_id:req.user._id
   

   }
   let options={
       limit:req.query.limit,
       page:req.query.page,
       sort:{
           createdAt:-1
       }
   }
   
Payment.paginate(query,options,(err,paymentResponse)=>{
  
  
 return  res.json(responseObj(true,paymentResponse,null))
})
}

const getPaymentDetails=async(req,res,next)=>{
   const payment = await Payment.findOne({_id: req.query._id},{
       amount:1,net_amount:1,trx_ref_no:1,createdAt:1,status:1
   }).populate({path:'class_id',select:{
       subject:1,
       start_time:1,
       grade:1,
       curriculum:1
   },populate:[{
       path:'student_id',select:{
           name:1,profile_image:1
       }
   },{
       path:'teacher_id',select:{
           name:1
       }
   }]})
   res.json(responseObj(true,payment,null))
}

export {getPaymentWeekly,getWalletBalance,lastWithdrawl,getPayments,getPaymentDetails,getWithdrawls}