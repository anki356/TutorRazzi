import Class from "../../../models/Class.js"
import Payment from "../../../models/Payment.js"

import User from "../../../models/User.js"
import { responseObj } from "../../../util/response.js"

const getTotalPaymentReceived=async(req,res)=>{
    const totalPaymentReceived=await Payment.aggregate([
        {$match:{$and:[{
            payment_type:"Credit"},{
            status:"Paid"
        }]}},
        { $group: { _id: null , TotalAmount:{ $sum : "$net_amount" }}}
    ])
    if(!totalPaymentReceived.length>0){
return res.json(responseObj(true,0,"Payments Received"))
    }
    return res.json(responseObj(true,totalPaymentReceived[0].TotalAmount*5/100,"Payments Received"))

}
const getLastAmountReceived=async(req,res)=>{
    const totalPaymentReceived=await Payment.aggregate([
        {$match:{$and:[{
            payment_type:"Credit"},{
            status:"Paid"
        }]}},
        {
            $sort:{
                createdAt:-1
            }
        },{
            $limit:1
        },{
            $project:{
                net_amount:1,
            }
        }
    ])
    if(!totalPaymentReceived.length>0){
return res.json(responseObj(true,0,"Last Payment Received"))
    }
    return res.json(responseObj(true,totalPaymentReceived[0].TotalAmount*5/100,"Last Payment Received"))

}
const getTotalPaymentRemains=async(req,res)=>{
    const totalPaymentRemains=await Payment.aggregate([
        {$match:{$and:[{
            payment_type:"Credit"},{
            status:"Pending"
        }]}},{
            $group: {
              _id: null,
          
                TotalAmount:{ $sum : "$net_amount" }
              
            }
          }
    ])
    if(!totalPaymentRemains.length>0){
        return res.json(responseObj(true,0,"Last Payment Received"))
            }
            return res.json(responseObj(true,totalPaymentRemains[0].TotalAmount*5/100," Payment Remains"))
}
const totalProfileViews=async(req,res)=>{
    let userId = req.user._id;
    const profileViewCountResponse= await User.findOne({_id:userId},{
        views:1
    })
    return res.json(responseObj(true,profileViewCountResponse.views,"No Of Profile Views"))
}
const getSixMonthPayment=async(req,res)=>{
    const startOfDuration = moment().startOf('month').subtract(6,'M').format("YYYY-MM-DD");
    const endOfDuration = moment().format("YYYY-MM-DD");
  
    const response=await Payment.aggregate([
      {
        $match: {
            $and:[
{createdAt: { $gte: startOfDuration, $lte: endOfDuration }},
{payment_type:'Credit'},
{status:'Done'}
            ]
          
          
        }
      },
      {
        $group: {
          _id:  {$substr: ["$createdAt", 0, 7]} ,
          totalData: { $sum: "$amount" }
        
        }
      }
    ])
    let array=[]
    
      
        for(let i=0;i<6;i++){
       
         
        
          array.push({
            month:moment().startOf('month').subtract(6,'M').add(i,'M').format("YYYY-MM"),
            totalAmount:0
                    })
        
      
    }
   
    response.forEach((data)=>{
     let index= array.findIndex((dataOne)=>{
return dataOne.month===data._id
      })
      console.log(index)
      array[index].totalAmount=data.totalData
    })
    let newArray=[]
    let month_array=["January","February","March","April","May","June","July","August","September","October","November","December"]
    array.forEach((data)=>{
      newArray.push({
        day:month_array[moment(data.month,"YYYY-MM").month()], 
        totalAmount:data.totalAmount,
        date:data.month
      })
    })
      
    
      
   
   return res.json(responseObj(true,newArray,"Six months record")) 
}

const getTotalTrialRequests=async(req,res)=>{
    const totalTrialRequests=await Class.countDocuments({
        class_type:"Trial",
        status:"Pending"
    })
    return res.json(responseObj(true,totalTrialRequests,"Total Requests")) 
}

const getTotalBookings=async(req,res)=>{
    const totalBookings=await Class.countDocuments({
        class_type:"Non-Trial",
        status:"Scheduled"
    })
    return res.json(responseObj(true,totalBookings,"Total Bookings")) 
}

const getTotalStudents=async(req,res)=>{
    const totalStudents=await User.countDocuments({status:true,role:"student"})
    return res.json(responseObj(true,totalStudents,"Total Students"))
}

const getTotalHoursCompleted=async(req,res)=>{
    const totalHoursCompleted=await Class.aggregate([
        { $match:{status:'Done'}},
        {
            $project: {
              timeDifference: {
                $subtract: ['$end_time', '$start_time']
              }
            }
          },
          {
            $group: {
              _id: null,
              totalDifference: {
                $sum: '$timeDifference'
              }
            }
          }
    ])
    return res.json(responseObj(true,totalHoursCompleted,"Total Hours Completed"))
}
export {getTotalTrialRequests,getTotalPaymentReceived,getLastAmountReceived,getTotalPaymentRemains,totalProfileViews,getSixMonthPayment,getTotalBookings,getTotalStudents,getTotalHoursCompleted}