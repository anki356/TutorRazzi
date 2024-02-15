import Student from '../../../models/Student.js'
import Quote from "../../../models/Quote.js"
import Payment from "../../../models/Payment.js"
import AcademicManager from "../../../models/AcademicManager.js"
import { responseObj } from '../../../util/response'
import moment from 'moment'
const getPayments=async(req,res)=>{
    let students=await AcademicManager.findOne({
        user_id:req.user._id
    },{
        students:1
    })
    let query={sender_id:{
        $in:students.map((data)=>data.students)
    }}
    if(req.query.date){
        query.createdAt=req.query.date
    }
    if(req.query.search){
        const student_ids=await Student.find({
            preferred_name:{
                $regex:req.query.search,
                $options:"i"
            }
        })
        const quote_ids=await Quote.find({$or:[{
            "subject_curriculum_grade.subject":{
                $regex:req.query.search,
                $options:"i"
            },
            
        },{
            class_count:{
                $regex:req.query.search,
                $options:"i"
            }
        }]})
        query["$or"]=[{
sender_id:{
    $in:student_ids.map((data)=>data.user_id)
}
        },{
            amount:{$regex:req.query.search,
            $options:"i"}
        },{
            quote_id:{
                $in:
                    quote_ids.map((data)=>data._id)
                
            }
        },{
            status:{
                $regex:req.query.search,
                $options:"i"  
            }
        }]
    }
    let options={
        limit:req.query.limit,
        page:req.query.page,
        populate:{
            path:"quote_id",
            populate:{
                path:'student_id',
                select:{
                    name:1
                }
            },
            select:{
                "class_count":1,"subject_curriculum_grade.subject":1
            }
        },
        select:{
            "net_amount":1,"createdAt":1
        }
    }
    Payment.paginate(query,options,(err,result)=>{
      return  res.json(responseObj(true,result,"All Payments"))
    })
}
const getPaymentStats=async(req,res)=>{
    let students=await AcademicManager.findOne({
        user_id:req.user._id
    },{
        students:1
    })
    let payments=await Payment.aggregate([
        {
          $match: {
            $and:[
                { "date": {
                    "$gte": moment().startOf('year').format("YYYY-MM-DDTHH:mm:ss"),// Start of current year
                    "$lte": moment().endOf('year').format("YYYY-MM-DDTHH:mm:ss")// // Start of next year
                  }},{
      sender_id:students.map((data)=>data.students)
                  }
            ]
          }
          
          },
        {
          "$group": {
            "_id": {
              "year": { "$year": "$date" },
              "month": { "$month": "$date" }
            },
            "total": { "$sum": "$amount" }
          }
        },
        {
          "$sort": {
            "_id.year": 1,
            "_id.month": 1
          }
        }
      ]
      )
      let array=[]
      let monthArray=[  "January", "February", "March", "April", "May", "June",  "July", "August", "September", "October", "November", "December"]

      for (let i=0;i<12;i++){
let index=payments.findIndex((data)=>{
    return data._id.month===i
})
if(index!==-1){
array.push({
    year:data._id.year,
    month:monthArray[data._id.month],
    amount:data.total
})
}
else{
    array.push({
        year:moment().year(),
        month:monthArray[i],
        amount:0
    })
}
      }
      return res.json(responseObj(true,array,null))
}
export {getPayments,getPaymentStats}