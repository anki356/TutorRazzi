import moment from "moment"
import Class from "../../../models/Class.js"
import Payment from "../../../models/Payment.js"

import User from "../../../models/User.js"
import { responseObj } from "../../../util/response.js"

const getTotalPaymentReceived=async(req,res)=>{
    
}
const getDashboard=async(req,res)=>{
    let totalPaymentReceived=await Payment.aggregate([
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
totalPaymentReceived=0
    }
    else{
        totalPaymentReceived=totalPaymentReceived[0].net_amount*5/100
    }
    // return res.json(responseObj(true,totalPaymentReceived[0].net_amount*5/100,"Last Payment Received"))
    let lastPaymentReceived=await Payment.aggregate([
        {$match:{$and:[{
            payment_type:"Credit"},{
            status:"Paid"
        }]}},
        { $group: { _id: null , TotalAmount:{ $sum : "$net_amount" }}}
    ])
    if(!lastPaymentReceived.length>0){
lastPaymentReceived=0
    }
    else{
        lastPaymentReceived=lastPaymentReceived[0].net_amount*5/100
    }
    let totalPaymentRemains=await Payment.aggregate([
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
        totalPaymentRemains=0
        // return res.json(responseObj(true,0,"Last Payment Received"))
            }
else{
    totalPaymentRemains=totalPaymentRemains*5/100
}
    // return res.json(responseObj(true,totalPaymentReceived[0].TotalAmount*5/100,"Payments Received"))
    let userId = req.user._id;
    let profileViewCountResponse= await User.findOne({_id:userId},{
        views:1
    })
    profileViewCountResponse=profileViewCountResponse.views
    // return res.json(responseObj(true,profileViewCountResponse.views,"No Of Profile Views"))
    let startOfDuration = moment().startOf('month').subtract(5,'M').format("YYYY-MM-DD");
    let endOfDuration = moment().format("YYYY-MM-DD");
  
    let response=await Payment.aggregate([
      {
        $match: {
            $and:[
{createdAt: { $gte: startOfDuration, $lte: endOfDuration }},
{payment_type:'Credit'},
{status:'Paid'}
            ]
          
          
        }
      },
      {
        $group: {
          _id:  {$substr: ["$createdAt", 0, 7]} ,
          totalData: { $sum: {$multiply:["$net_amount",0.05]} }
        
        }
      }
    ])
 
    let array=[]
    
      
        for(let i=0;i<6;i++){
       
         
        
          array.push({
            month:moment().startOf('month').subtract(5,'M').add(i,'M').format("YYYY-MM"),
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
    let totalBookings=await Class.countDocuments({
        status:"Scheduled",
        start_time:{
          $gte:moment().format("YYYY-MM-DDTHH:mm:ss")
        }
    })
    // return res.json(responseObj(true,totalBookings,"Total Bookings"))    
    let totalStudents=await User.countDocuments({status:true,role:"student"})
    // return res.json(responseObj(true,totalStudents,"Total Students"))
    let totalHoursCompleted=await Class.find(
        {status:'Done'})
       let hoursCompleted=0
       console.log(totalHoursCompleted)
       totalHoursCompleted.forEach((data)=>{
        hoursCompleted+= moment(data.end_time).diff(moment(data.start_time),'h')
       })
    //  return res.json(responseObj(true,hoursCompleted,"Total Hours Completed"))  
    let totalTrialRequests=await Class.countDocuments({
        class_type:"Trial",
        status:"Pending",
        start_time:{
          $gte:moment().format("YYYY-MM-DDTHH:mm:ss")
        }
    })
    // return res.json(responseObj(true,totalTrialRequests,"Total Requests")) 
   
   return res.json(responseObj(true,{newArray,totalTrialRequests,totalHoursCompleted,totalStudents,totalBookings,newArray,profileViewCountResponse,totalPaymentRemains,totalPaymentRemains,lastPaymentReceived,totalPaymentReceived},"Stats")) 

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
    
}
const getSixMonthPayment=async(req,res)=>{
    const startOfDuration = moment().startOf('month').subtract(5,'M').format("YYYY-MM-DD");
    const endOfDuration = moment().format("YYYY-MM-DD");
  
    const response=await Payment.aggregate([
      {
        $match: {
            $and:[
{createdAt: { $gte: startOfDuration, $lte: endOfDuration }},
{payment_type:'Credit'},
{status:'Paid'}
            ]
          
          
        }
      },
      {
        $group: {
          _id:  {$substr: ["$createdAt", 0, 7]} ,
          totalData: { $sum: {$multiply:["$net_amount",0.05]} }
        
        }
      }
    ])
 
    let array=[]
    
      
        for(let i=0;i<6;i++){
       
         
        
          array.push({
            month:moment().startOf('month').subtract(5,'M').add(i,'M').format("YYYY-MM"),
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
        status:"Pending",
        start_time:{
          $gte:moment().format("YYYY-MM-DDTHH:mm:ss")
        }
    })
    return res.json(responseObj(true,totalTrialRequests,"Total Requests")) 
}

const getTotalBookings=async(req,res)=>{
    const totalBookings=await Class.countDocuments({
        status:"Scheduled",
        start_time:{
          $gte:moment().format("YYYY-MM-DDTHH:mm:ss")
        }
    })
    return res.json(responseObj(true,totalBookings,"Total Bookings")) 
}

const getTotalStudents=async(req,res)=>{
    const totalStudents=await User.countDocuments({status:true,role:"student"})
    return res.json(responseObj(true,totalStudents,"Total Students"))
}

const getTotalHoursCompleted=async(req,res)=>{
    const totalHoursCompleted=await Class.find(
       {status:'Done'})
      let hoursCompleted=0
      console.log(totalHoursCompleted)
      totalHoursCompleted.forEach((data)=>{
       hoursCompleted+= moment(data.end_time).diff(moment(data.start_time),'h')
      })
    return res.json(responseObj(true,hoursCompleted,"Total Hours Completed"))
}
export {getTotalTrialRequests,getTotalPaymentReceived,getDashboard,getTotalPaymentRemains,totalProfileViews,getSixMonthPayment,getTotalBookings,getTotalStudents,getTotalHoursCompleted}