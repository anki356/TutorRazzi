import Grade from "../../../models/Grade.js"
import mongoose from "mongoose"
import { responseObj } from "../../../util/response.js"
import AdditionalComment from "../../../models/AdditionalComment.js"
import moment from "moment"
import Report from "../../../models/Report.js"
import MonthlyReport from "../../../models/MonthlyReport.js"
const ObjectID=mongoose.Types.ObjectId
const getMonthlyReport=async(req,res,next)=>{
    let query={
        student_id:new ObjectID(req.query.student_id)  
    }
    if(req.query.teacher_id){
        query={
            student_id:new ObjectID(req.query.student_id),
            teacher_id:new ObjectID(req.quer.teacher_id)
        }
    }
    if(req.query.subject){
        query.subject=req.query.subject
    }
   let options={
    limit:req.query.limit,
    page:req.query.page
   }
   let pipeline=MonthlyReport.aggregate([
    {$match:query},
    {$project:{
        averageRating: { $avg: "$reports.rating" },
        status:1,
        month:1,
        year:1,
        createdAt:1

    }}
])
  MonthlyReport.aggregatePaginate(pipeline,options,(err,result)=>{
    return res.json(responseObj(true,result,null))
  })  

}

const getMonthlyReportDetails=async(req,res)=>{
    const averageGrade=await Report.aggregate([
        {
            $match:{
                student_id:new ObjectID(req.query.student_id),
                month:req.query.month,
                year:req.query.year
            }
        },{
            $group :{
                _id:0,
                totalRatings:{
                    "$avg":"$rating"
                }
            }
        }
    ])
    const report=await Report.find({student_id:new ObjectID(req.query.student_id),
    month:req.query.month,
    year:req.query.year})

const additionalComment=await AdditionalComment.findOne({student_id:new ObjectID(req.query.student_id),month:req.query.month,year:req.query.year})
  return  res.json(responseObj(true,{ratings:averageGrade[0]?.totalRatings?averageGrade[0]?.totalRatings:0,report:report,additionalComment:additionalComment},null))
}
export {getMonthlyReport,getMonthlyReportDetails}
