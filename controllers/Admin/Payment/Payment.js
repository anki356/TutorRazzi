import moment from "moment"
import Payment from "../../../models/Payment.js"
import {responseObj} from "../../../util/response.js"
const getStats=async(req,res)=>{
    let start_of_week=moment().startOf('week').format("YYYY-MM-DD")
    let end_of_week=moment().endOf('week').add(1,'d').format("YYYY-MM-DD")
    const getTotalPayments=await Payment.aggregate([
       { $match:{
status:"Paid",
payment_type:"Credit",
createdAt:{
    $gte:start_of_week,
    $lt:end_of_week
}
        }},{
$group:{
    _id:null,
    totalAmount:{
        $sum:"$amount"
    }
}
        }
    ])
    const getTeacherPayout=getTotalPayments[0].totalAmount*95/100
    const profits=getTotalPayments[0].totalAmount*5/100
    return res.json(responseObj(true,{getTotalPayments,getTeacherPayout,profits},"Payment Statistics"))
}

const getWeeklyData=async (req,res,next)=>{
    const startOfWeek = moment().startOf('week').subtract(6,'week').format("YYYY-MM-DD");
    const endOfWeek = moment().add(1,'d').format("YYYY-MM-DD");
  
    const response=await Payment.aggregate([
      {
        $match:{
            status:"Paid",
            payment_type:"Credit",
            createdAt:{
                $gte:startOfWeek,
                $lt:endOfWeek
            }
        }
      },
      {
        $group: {
          _id:  moment("$createdAt").startOf('week').format("YYYY-MM-DD") ,
          totalData: { $sum: "$amount" }
        
        }
      }
    ])
    let array=[]
    
      
        for(let i=0;i<7;i++){
       
         
        
          array.push({
            date:moment().startOf('week').subtract(6,'week').add(i,'week').format("YYYY-MM-DD"),
            totalAmount:0
                    })
        
      
    }
    console.log(array)
    

    response.forEach((data)=>{
     let index= array.findIndex((dataOne)=>{
return dataOne.date===data._id
      })
      console.log(index)
      array[index].totalAmount=data.totalData
      
    })
    let newArray=[]
    let daysArray=["Sun","Mon","Tues","Wed","Thurs","Fri","Sat"]
    array.forEach((data)=>{
      newArray.push({
         
        totalAmount:data.totalAmount,
        date:data.date,
        teacher_payout:data.totalAmount*95/100,
        profits:data.totalAmount*5/100
      })
    })
      
   
      
    
   return res.json(responseObj(true,{newArray:newArray},"Past 7 weeks Payment"))
  }

  const getAllPayments=async(req,res)=>{
    let query={
status:"Paid",
payment_type:"Credit"
    }
    if(req.query.trx_ref_no){
      query.trx_ref_no=req.query.trx_ref_no
    }

    let options={
      limit:req.query.limit,
      page:req.query.page
    }
    Payment.paginate(query,options,(err,result)=>{
      return res.json(responseObj(true,result,"All payments"))
    })
  }


  const getPaymentById=async(req,res)=>{
    const paymentDetails=await Payment.findById({
      _id:req.query.payemnt_id
    }).populate({
      path:"class_id"
    })
    return res.json(responseObj(true,paymentDetails,"Payment Details"))
  }
export {getStats,getWeeklyData,getAllPayments,getPaymentById}