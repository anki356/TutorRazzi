import moment from "moment"
import Class from "../../../models/Class.js"
import Payment from "../../../models/Payment.js"
import Wallet from "../../../models/Wallet.js"
import { responseObj } from "../../../util/response.js"

const getPaymentWeekly=async(req,res)=>{
    const classes=await Class.find({teacher_id:req.user._id},{_id:1})
   const response=await  Payment.aggregate([
{$match:{$and:[
    {
        class_id:{
            $in:classes.map((data)=>data._id)
        }
    },{
        "payment_date": {
            "$gte": moment().startOf('week').format("YYYY-MM-DDTHH:mm:ss"),// Start of current year
            "$lte": moment().endOf('week').format("YYYY-MM-DDTHH:mm:ss")// // Start of next year
          }
    },
   { status:"Paid"}
]

}},

{
    $addFields: {
      dayOfWeek: { $dayOfWeek: { $dateFromString: { dateString: "$payment_date" } } } // Add a new field "dayOfWeek" representing the day of the week
    }
  },
        {
          $group: {
            _id: "$dayOfWeek", // Group by week
            totalPayment: { $sum: "$amount" }, // Calculate the sum of payment amounts for each week
            
          }
        },
        {
          $sort: { _id: 1 } // Sort by week in ascending order
        }
      ])
      let array=[]
      console.log(response)
      const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

console.log(weekdays);

      for (let i=1;i<=7;i++){
        let index=response.findIndex((data)=>{
            return data._id===i
        })
        if(index!==-1){
        array.push({
            day:weekdays[response[index]._id-1],
            
            amount:response[index].totalPayment,
        })
        }
        else{
            array.push({
                day:weekdays[i-1],
            
                amount:0,
            })
        }
              }
    return  res.json(responseObj(true,array,'Weekly payments'))
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
       

           
class_id:{$in:classResponse.map((data)=>data._id)},
   status:"Paid"

   }
   let options={
       limit:req.query.limit,
       page:req.query.page,
       sort:{
           payment_date:-1
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
       amount:1,net_amount:1,trx_ref_no:1,payment_date:1,status:1
   }).populate({path:'class_id',select:{
       subject:1,
       start_time:1,
       end_time:1,
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

const withdraw=async (req,res,next)=>{
    let WalletResponse= await Wallet.findOne({
user_id:req.user._id
    })
    if(req.body.amount>WalletResponse.amount){
        return res.json(responseObj(false,"You cannot withdraw amount greater than your balance",null))
    }
    if(req.body.amount===0){
        return res.json(responseObj(false,"You cannot withdraw 0 amount",null))
    }
    WalletResponse=await Wallet.findOneAndUpdate({
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
        trx_ref_no:req.body.trx_ref_no,
        net_amount:req.body.amount,
        status:"Paid"
    
    })
    res.json(responseObj(true,{WalletResponse,PaymentResponse},null))
    }
export {getPaymentWeekly,getWalletBalance,lastWithdrawl,getPayments,getPaymentDetails,getWithdrawls,withdraw}