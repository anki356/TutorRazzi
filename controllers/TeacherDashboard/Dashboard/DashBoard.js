import mongoose from "mongoose"
import Class from "../../../models/Class.js"
import Payment from "../../../models/Payment.js"
import ResourceRequest from "../../../models/ResourceRequest.js"
import { responseObj } from "../../../util/response.js"
import moment from "moment"
import HomeWork from "../../../models/HomeWork.js"
const objectId=mongoose.Types.ObjectId
const getStats=async(req,res,next)=>{
    const trialRequests=await Class.countDocuments({
class_type:"Trial",
teacher_id:req.user._id,
status:'Pending'
    })
  
const rescheduleRequests=await Class.countDocuments({
    is_rescheduled:true,
    teacher_id:req.user._id,
    status:'Pending',
    start_time:{
      $gte:moment().format("YYYY-MM-DDTHH:mm:ss")
    }
})
let classResponse=await Class.find({teacher_id:req.user._id},{_id:1})
const resourceRequests=await ResourceRequest.countDocuments({
class_id:{
    $in:classResponse.map((data)=>data._id)
}
})
const currentYear = new Date().getFullYear(); // Get the current year
    const currentMonth = new Date().getMonth() + 1;
const getPaymentsData=await Payment.aggregate([{
    $match:{
        class_id:{
            $in:classResponse.map((data)=>data._id)
        }
    }
},{
  $match: {
      $expr: {
          $and: [
              { $eq: [{ $year: { $dateFromString: { dateString: '$createdAt' } } }, currentYear] },
              { $eq: [{ $month: { $dateFromString: { dateString: '$createdAt' } } }, currentMonth] },
          ],
      },
  },
},
{
  $group: {
      _id: { $dayOfMonth: { $dateFromString: { dateString: '$createdAt' } } },
      totalAmount: { $sum: '$net_amount' },
  },
}])
let array=[]
    
      
        for(let i=0;i<moment().daysInMonth();i++){
       
         
        
          array.push({
            date:moment().startOf('month').add(i,'d').date(),
            totalAmount:0
                    })
        
      
    }
    


    getPaymentsData.forEach((data)=>{
     let index= array.findIndex((dataOne)=>{
return dataOne.date===data._id
      })
      
      array[index].totalAmount=data.totalAmount
      
    })
    let newArray=[]
    
    array.forEach((data)=>{
      newArray.push({
        
        totalAmount:data.totalAmount,
        date:data.date
      })
    })
      
   
      
  
  
    classResponse=await Class.find({teacher_id:req.user._id})
    const totalPaymentThisWeek=await Payment([
        {
            $match:{
        
                class_id:{$in:classResponse.map((data)=>data._id)},
                createdAt: {
                  $gte: moment().startOf('week').format("YYYY-MM-DDTHH:mm"),
                  $lte: moment().format("YYYY-MM-DDTHH:mm"),
                },
                
            }
        },
       {
            $group: {
              _id: null,
              total_payments: { $sum: '$net_amount' },
            },
          },
    ])
   
    const lastWeekPayment=await Payment.aggregate([
      {
        $match:{
    
          class_id:{$in:classResponse.map((data)=>data._id)},
          createdAt: {
            $gte: moment().subtract(1,'week').startOf('week').format("YYYY-MM-DDTHH:mm"),
            $lte: moment().endOf('week').subtract(1,'week').format("YYYY-MM-DDTHH:mm"),
          },
        }
    },{
        $group: {
          _id: null,
          total_payments: { $sum: '$net_amount' },
        },
      },
    ])
    
    let totalPaymentThisWeekAmount=totalPaymentThisWeek.length>0?totalPaymentThisWeek[0].total_payments:0
    let totalPaymentLastweekAmount=lastWeekPayment.length>0?lastWeekPayment[0].total_payments:0
    let percentageChange=0
    if(totalPaymentLastweekAmount>0){
       percentageChange=(totalPaymentThisWeekAmount-totalPaymentLastweekAmount)/totalPaymentLastweekAmount*100
    }
    
  
    res.json(responseObj(true,{trialRequests:trialRequests,rescheduleRequests:rescheduleRequests,resourceRequests:resourceRequests,getPaymentsData:newArray,totalPaymentThisWeek:totalPaymentThisWeekAmount,lastWeekPayment:totalPaymentLastweekAmount,percentageChange:percentageChange},''))
    
}
const getPendingHomeworks=async(req,res)=>{

  let classResponse=await Class.find({teacher_id:req.user._id})
  let query={
    class_id:{
      $in:classResponse.map(data=>data._id)
    },
    status:{
      $in:['Pending','ReUpload']
    }
  }
  let options={
    limit:req.query.limit,
    page:req.query.page
  }
  HomeWork.paginate(query,options,(err,homeworkResponse)=>{
    return res.json(responseObj(true,homeworkResponse,'Pending Homeworks are here'))

  })
  
  
  
}
const getPendingResourceRequests=async (req,res)=>{
  const classResponse=await Class.find({teacher_id:req.user._id},{_id:1})
  
  let query={
    class_id:{
      $in:classResponse.map(data=>data._id)
    },
    status:"Pending"
  }
  let options={
    limit:req.query.limit,
    page:req.query.page
  }
  ResourceRequest.paginate(query,options,(err,resourceRequests)=>{
    return res.json(responseObj(true,resourceRequests,'Pending Resource Requests'))

  })

}
export  {getStats,getPendingHomeworks,getPendingResourceRequests}