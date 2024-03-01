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
        averageRating: {$round:[{$avg: "$reports.rating"},0] },
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

const getMonthlyReportDetails = async (req, res) => {
    const averageGrade = await MonthlyReport.aggregate([
        {
            $match: {
                _id:req.query._id

            }
        }
        ,
        {$project:{
            averageRating: { $avg: "$reports.rating" }
        }}
       
    ])

    const reportDetails = await MonthlyReport.findOne({
       _id:req.query.id
    })
if(reportDetails===null){
    throw new Error("Invalid Report Id")
}
    const additionalComment = await AdditionalComment.findOne({
        student_id: reportDetails.student_id, month: reportDetails.month,
        year: reportDetails.year, teacher_id: reportDetails.teacher_id
    })
    res.json(responseObj(true, { ratings: averageGrade[0]?.averageRating ? averageGrade[0]?.averageRating : 0, report: reportDetails.reports, additionalComment: additionalComment }, null))
}
export {getMonthlyReport,getMonthlyReportDetails}
