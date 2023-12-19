import Grade from "../../../models/Grade.js"
import mongoose from "mongoose"
import { responseObj } from "../../../util/response.js"
import AdditionalComment from "../../../models/AdditionalComment.js"
import moment from "moment"
import Report from "../../../models/Report.js"
const ObjectID=mongoose.Types.ObjectId
const getMonthlyReport=async(req,res,next)=>{
   
   console.log(  { student_id:new ObjectID(req.query.student_id)},
   { month:req.query.month},
    {year:req.query.year }  ) 
   const averageGrade=await Report.aggregate([
        {
            $match:{
                $and:[
                   { student_id:new ObjectID(req.query.student_id)},
                   { month:Number(req.query.month)},
                    {year:Number(req.query.year) }  
                ]
                
            }
        }
        ,
        {
            $project :{
                totalRatings:{
                    "$avg":"$rating"
                }
            }
        }
    ])
    
    const report=await Report.find({student_id:new ObjectID(req.query.student_id),
        month:req.query.month,
        year:req.query.year})

const additionalComment=await AdditionalComment.findOne({student_id:new ObjectID(req.query.student_id), month:req.query.month,
    year:req.query.year})
    res.json(responseObj(true,{ratings:averageGrade[0]?.totalRatings?averageGrade[0]?.totalRatings:0,report:report,additionalComment:additionalComment},null))
}
const getMonthlyReports=async(req,res,next)=>{
    const monthlyReport=await Report.aggregate([
        {
            $match:{
                student_id:new ObjectID(req.query.student_id),
            }
        },  {
            $group: {
                _id: {
                    year: "$year",
                    month:"$month"
                },
                averageRating: { $avg: "$rating" },
              // You can use other accumulator operators based on your requirements
                // Add other fields or calculations as needed
            }
        },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                averageRating: 1,// Include other fields as needed
            }
        },
        {
            $sort: {
                year: 1,
                month: 1
            }
        }
    ])
    


  return  res.json(responseObj(true,monthlyReport,null))
}
export {getMonthlyReport,getMonthlyReports}
